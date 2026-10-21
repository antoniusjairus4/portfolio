'use client';

import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import { BoxGeometry, MeshStandardMaterial } from 'three';

export type SkillsFinish = 'mineral' | 'stone' | 'metal' | 'technical' | 'translucent' | 'signal';
const FINISHES: SkillsFinish[] = [
  'mineral',
  'stone',
  'metal',
  'technical',
  'translucent',
  'signal',
];

function architecturalMaterial(finish: SkillsFinish) {
  const brushed = finish === 'metal';
  const mineral = finish === 'mineral' || finish === 'stone';
  const material = new MeshStandardMaterial({
    color: '#ffffff',
    roughness: finish === 'mineral' ? 0.86 : finish === 'stone' ? 0.72 : brushed ? 0.53 : 0.38,
    metalness: brushed ? 0.64 : finish === 'technical' ? 0.36 : 0.04,
    transparent: finish === 'translucent',
    opacity: finish === 'translucent' ? 0.22 : 1,
    depthWrite: finish !== 'translucent',
    emissive: finish === 'signal' ? '#8B1E2D' : '#000000',
    emissiveIntensity: finish === 'signal' ? 0.22 : 0,
  });
  if (mineral || brushed) {
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
        float grain = sin(dot(vSkillsSurface, vec3(${brushed ? '180.0, 1.7, 2.1' : '43.1, 57.7, 32.3'})));
        float strata = sin(vSkillsSurface.y * 3.3 + sin(vSkillsSurface.z * 1.9) * 0.7);
        diffuseColor.rgb *= 0.96 + grain * ${brushed ? '0.025' : '0.018'} + strata * ${brushed ? '0.01' : '0.035'};
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
    material.customProgramCacheKey = () => `skills-surface-${finish}-v1`;
  }
  return material;
}

function createResources() {
  const surfaces = {
    mineral: architecturalMaterial('mineral'),
    metal: architecturalMaterial('metal'),
    technical: architecturalMaterial('technical'),
    stone: architecturalMaterial('stone'),
  };
  surfaces.mineral.color.set('#F2E8D5');
  surfaces.metal.color.set('#303736');
  surfaces.technical.color.set('#1d2323');
  surfaces.stone.color.set('#b9ae96');
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
