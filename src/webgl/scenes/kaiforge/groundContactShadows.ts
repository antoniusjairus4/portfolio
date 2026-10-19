import { type MeshStandardMaterial, Vector2 } from 'three';
import { ROBOT_ROOT } from './robot/pose';

/** Tight occlusion at the fixed feet complements the overhead source's soft PCF shadow.
 * Runs on the existing floor material, including portrait, without another render pass.
 */
export function withGroundContactShadows(material: MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.kfRobotBase = { value: new Vector2(ROBOT_ROOT[0], ROBOT_ROOT[2]) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vKFContactWorld;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvKFContactWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vKFContactWorld;
uniform vec2 kfRobotBase;
float kfFootOcclusion(vec2 point, vec2 foot) {
  vec2 delta = point - foot;
  return exp(-dot(delta, delta) / 0.0036);
}`,
      )
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
vec2 kfFloor = vKFContactWorld.xz;
vec2 kfBaseDistance = max(abs(kfFloor - kfRobotBase) - vec2(0.31, 0.23), vec2(0.0));
float kfContact = exp(-dot(kfBaseDistance, kfBaseDistance) / 0.0064);
kfContact = max(kfContact, kfFootOcclusion(kfFloor, vec2(-0.96, -0.53)));
kfContact = max(kfContact, kfFootOcclusion(kfFloor, vec2(-0.96,  0.53)));
kfContact = max(kfContact, kfFootOcclusion(kfFloor, vec2( 0.96, -0.53)));
kfContact = max(kfContact, kfFootOcclusion(kfFloor, vec2( 0.96,  0.53)));
kfContact *= 1.0 - smoothstep(0.004, 0.06, abs(vKFContactWorld.y));
reflectedLight.directDiffuse *= 1.0 - 0.24 * kfContact;
reflectedLight.indirectDiffuse *= 1.0 - 0.3 * kfContact;
`,
      );
  };
  material.customProgramCacheKey = () => 'kf-ground-contact-v1';
  return material;
}
