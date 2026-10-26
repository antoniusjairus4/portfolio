'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, type PlaneGeometry, type ShaderMaterial, Vector2 } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { SKILLS_STOPS } from './timeline';

// The field and contour treatment come from the supplied React Bits FluxLines shader.
// World-space UVs keep the animation attached to the 3D floor as the camera travels.
const vertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vUv = uv;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform float uTime;
uniform float uWorldWidth;
uniform float uOpacity;
uniform float uCameraZ;
uniform vec2 uCards[6];
uniform vec2 uActiveCard;
uniform float uActiveWeight;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void main() {
  vec2 world = vec2((vUv.x - 0.5) * uWorldWidth, (vUv.y - 0.5) * 172.0);
  vec2 p = world * 4.35;
  vec2 dir = vec2(0.0, -1.0);
  vec2 perp = vec2(1.0, 0.0);
  float travel = uTime * 18.0;
  float distort1 = vn(p + perp * travel, 60.0, 10.0) * 42.0;
  float distort2 = vn(p - perp * travel, 120.0, 15.0) * 78.0;
  float peaks = dbn(p + distort1 + dir * travel * 0.5, 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * travel * 0.5, 40.0, 0.0);
  float field = smin(peaks, peaks2, 0.1);

  float gap = abs(field - 0.4);
  float core = 1.0 - smoothstep(0.018, 0.055, gap);
  float rim = 1.0 - smoothstep(0.045, 0.13, gap);
  float shimmer = vn(p + dir * travel * 0.5, 60.0, 12.0);
  float energy = (core * 0.82 + rim * 0.28) * (0.8 + 0.2 * shimmer);
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 tint = mix(uColorA, uColorB, smoothstep(0.1, 0.72, h));
  tint = mix(tint, uColorC, smoothstep(0.58, 0.95, h) * 0.36);
  float viewDepth = uCameraZ - vWorldPosition.z;
  float nearFade = smoothstep(7.0, 26.0, viewDepth);
  float farFade = 1.0 - smoothstep(25.0, 55.0, viewDepth);
  float lineStrength = energy * uOpacity * nearFade * farFade;

  float floorLight = smoothstep(5.0, 27.0, viewDepth);
  vec3 floorColor = mix(vec3(0.001, 0.002, 0.003), vec3(0.018, 0.026, 0.032), floorLight);
  float haze = smoothstep(20.0, 56.0, viewDepth);
  floorColor = mix(floorColor, vec3(0.004, 0.006, 0.009), haze * 0.78);

  float contact = 0.0;
  float grounding = 0.0;
  for (int i = 0; i < 6; i++) {
    vec2 offset = vWorldPosition.xz - uCards[i];
    float footprint = pow(offset.x / 2.35, 2.0) + pow(offset.y / 1.15, 2.0);
    contact = max(contact, exp(-footprint * 1.8));
    grounding = max(grounding, exp(-footprint * 0.3));
  }
  floorColor += vec3(0.009, 0.011, 0.013) * grounding;
  floorColor *= 1.0 - contact * 0.46;

  vec2 activeOffset = vWorldPosition.xz - uActiveCard;
  float reflection = exp(-1.4 * (pow(activeOffset.x / 3.8, 2.0) + pow(activeOffset.y / 2.2, 2.0)));
  floorColor += vec3(0.008, 0.001, 0.002) * reflection * uActiveWeight;

  float horizonFade = 1.0 - smoothstep(35.0, 65.0, viewDepth);
  gl_FragColor = vec4(floorColor + tint * lineStrength, horizonFade);
}`;

export function CapabilityFluxFloor({
  controller,
  portrait,
  geometry,
  placements,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
  geometry: PlaneGeometry;
  placements: readonly { x: number; z: number }[];
}) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { invalidate } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWorldWidth: { value: portrait ? 30 : 66 },
      uOpacity: { value: portrait ? 0.29 : 0.34 },
      uCameraZ: { value: 0 },
      uCards: { value: placements.map((placement) => new Vector2(placement.x, placement.z)) },
      uActiveCard: { value: new Vector2() },
      uActiveWeight: { value: 0 },
      uColorA: { value: new Color('#8b3048') },
      uColorB: { value: new Color('#b04d64') },
      uColorC: { value: new Color('#8ca5ad') },
    }),
    [portrait, placements],
  );

  useFrame(({ camera }, delta) => {
    const progress = controller.progress.current;
    uniforms.uCameraZ.value = camera.position.z;
    let activeIndex = 0;
    for (let index = 1; index < SKILLS_STOPS.length; index += 1) {
      if (
        Math.abs(progress - SKILLS_STOPS[index]) < Math.abs(progress - SKILLS_STOPS[activeIndex])
      ) {
        activeIndex = index;
      }
    }
    uniforms.uActiveCard.value.copy(uniforms.uCards.value[activeIndex]);
    const distance = Math.abs(progress - SKILLS_STOPS[activeIndex]);
    const focus = Math.max(0, 1 - distance / 0.085);
    uniforms.uActiveWeight.value = focus * focus * (3 - 2 * focus);
    if (progress < SKILLS_STOPS[0] || !materialRef.current) return;
    uniforms.uTime.value += Math.min(delta, 0.05);
    invalidate();
  });

  return (
    <mesh
      name="capability-flux-lines-floor"
      position={[0, -2.72, -62]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      receiveShadow
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
