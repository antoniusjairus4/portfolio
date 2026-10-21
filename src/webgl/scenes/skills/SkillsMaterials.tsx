'use client';

import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import { BoxGeometry, MeshStandardMaterial } from 'three';

export type SkillsFinish =
  | 'mineral'
  | 'stone'
  | 'metal'
  | 'technical'
  | 'translucent'
  | 'signal'
  | 'light'
  | 'floor'
  | 'landscape';
const FINISHES: SkillsFinish[] = [
  'mineral',
  'stone',
  'metal',
  'technical',
  'translucent',
  'signal',
  'light',
  'floor',
  'landscape',
];

function architecturalMaterial(finish: SkillsFinish) {
  const brushed = finish === 'metal';
  const mineral = finish === 'mineral' || finish === 'stone';
  const floor = finish === 'floor';
  const material = new MeshStandardMaterial({
    color: finish === 'light' ? '#000000' : '#ffffff',
    roughness:
      finish === 'floor'
        ? 0.82
        : finish === 'landscape'
          ? 0.94
          : finish === 'mineral'
            ? 0.7
            : finish === 'stone'
              ? 0.78
              : brushed
                ? 0.48
                : 0.72,
    metalness: brushed ? 0.34 : finish === 'floor' ? 0.05 : finish === 'technical' ? 0.12 : 0.03,
    envMapIntensity: finish === 'floor' ? 0.18 : 0.12,
    transparent: finish === 'translucent',
    opacity: finish === 'translucent' ? 0.22 : 1,
    depthWrite: finish !== 'translucent',
    emissive: finish === 'light' ? '#ffd397' : finish === 'signal' ? '#8B1E2D' : '#000000',
    emissiveIntensity: finish === 'light' ? 1.35 : finish === 'signal' ? 0.14 : 0,
  });
  if (mineral || brushed || floor) {
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vSkillsSurface;',
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vec4 skillsPoint = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          skillsPoint = instanceMatrix * skillsPoint;
        #endif
        vSkillsSurface = (modelMatrix * skillsPoint).xyz;
      `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vSkillsSurface;',
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #include <map_fragment>
        float grainPhase = dot(vSkillsSurface, vec3(${brushed ? '70.0, 1.7, 2.1' : '13.1, 17.7, 12.3'}));
        float grain = sin(grainPhase) / (1.0 + fwidth(grainPhase) * fwidth(grainPhase));
        float strata = sin(vSkillsSurface.y * 3.3 + sin(vSkillsSurface.z * 1.9) * 0.7);
        ${
          floor
            ? `
        float flutePhase = vSkillsSurface.x * 105.0;
        float flute = sin(flutePhase) / (1.0 + pow(fwidth(flutePhase), 2.0));
        diffuseColor.rgb *= 0.9 + flute * 0.1;
        `
            : ''
        }
        diffuseColor.rgb *= 0.96 + grain * ${brushed ? '0.012' : '0.01'} + strata * ${brushed ? '0.008' : '0.018'};
      `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `
        #include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + grain * 0.035, 0.25, 1.0);
      `,
      );
    };
    material.customProgramCacheKey = () => `skills-surface-${finish}-v2`;
  }
  return material;
}

function createResources() {
  const surfaces = {
    mineral: architecturalMaterial('mineral'),
    metal: architecturalMaterial('metal'),
    technical: architecturalMaterial('technical'),
    stone: architecturalMaterial('stone'),
    light: architecturalMaterial('light'),
    floor: architecturalMaterial('floor'),
    landscape: architecturalMaterial('landscape'),
  };
  surfaces.mineral.color.set('#F2E8D5');
  surfaces.metal.color.set('#252b2e');
  surfaces.technical.color.set('#080d11');
  surfaces.stone.color.set('#7f796e');
  surfaces.light.color.set('#000000');
  surfaces.floor.color.set('#151d23');
  surfaces.floor.emissive.set('#0d151a');
  surfaces.floor.emissiveIntensity = 0.28;
  surfaces.landscape.color.set('#111b17');
  surfaces.landscape.emissive.set('#07130d');
  surfaces.landscape.emissiveIntensity = 0.34;
  return {
    surfaces,
    geometry: new BoxGeometry(),
    materials: Object.fromEntries(
      FINISHES.map((finish) => [finish, architecturalMaterial(finish)]),
    ) as Record<SkillsFinish, MeshStandardMaterial>,
  };
}
const Resources = createContext<ReturnType<typeof createResources> | null>(null);
export function SkillsMaterialProvider({ children }: { children: ReactNode }) {
  const resources = useMemo(createResources, []);
  useEffect(
    () => () => {
      resources.geometry.dispose();
      for (const material of Object.values(resources.materials)) material.dispose();
      for (const material of Object.values(resources.surfaces)) material.dispose();
    },
    [resources],
  );
  return <Resources.Provider value={resources}>{children}</Resources.Provider>;
}
export function useSkillsMaterials() {
  const resources = useContext(Resources);
  if (!resources) throw new Error('Skills material resources require their chapter owner.');
  return resources;
}
