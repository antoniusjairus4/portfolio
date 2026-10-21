'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  type DirectionalLight,
  type HemisphereLight,
  Object3D,
  type PointLight,
  type RectAreaLight,
  type SpotLight,
  Vector3,
  VSMShadowMap,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {
  getSkillRecognition,
  getSkillsCategoryIndex,
  smoothstep,
} from '@/components/skills/skillsChoreography';
import { assemblyProgress, SKILLS_REGIONS } from '@/components/skills/skillsSpatial';
import { skillCategories } from '@/content/skills';
import type { ChapterProgressController } from '@/experience/chapterProgress';

export function SkillsLighting({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const { camera, gl } = useThree();
  const key = useRef<DirectionalLight>(null);
  const sky = useRef<HemisphereLight>(null);
  const ceilingLight = useRef<RectAreaLight>(null);
  const floorBounce = useRef<PointLight>(null);
  const aperture = useRef<SpotLight>(null);
  const routeResponse = useRef<PointLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const pool = useMemo(() => new Object3D(), []);
  const ahead = useMemo(() => new Vector3(), []);
  useLayoutEffect(() => {
    RectAreaLightUniformsLib.init();
    const previous = gl.shadowMap.type;
    if (!portrait) {
      gl.shadowMap.type = VSMShadowMap;
      gl.shadowMap.needsUpdate = true;
    }
    return () => {
      gl.shadowMap.type = previous;
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl, portrait]);
  useFrame(() => {
    const p = controller.progress.current;
    const tools = smoothstep((p - 0.64) / 0.04) * (1 - smoothstep((p - 0.835) / 0.04));
    if (sky.current) sky.current.intensity = 0.65 - tools * 0.28;
    camera.getWorldDirection(ahead);
    target.position.copy(camera.position).addScaledVector(ahead, 12);
    target.position.y -= 1.8;
    target.updateMatrixWorld();
    pool.position.copy(target.position);
    pool.position.z -= 5;
    pool.updateMatrixWorld();
    const openness = smoothstep((p - 0.12) / 0.09) * (1 - smoothstep((p - 0.3) / 0.1));
    if (key.current) {
      key.current.position.set(
        target.position.x - 5,
        target.position.y + 11,
        target.position.z + 6,
      );
      const domain = getSkillsCategoryIndex(p);
      const focus = Math.max(
        ...skillCategories[domain].skills.map((_, skill) =>
          getSkillRecognition(p, domain, skill, skillCategories[domain].skills.length),
        ),
      );
      key.current.intensity = 1.05 + openness * 0.15 - focus * 0.12 - tools * 0.25;
    }
    if (ceilingLight.current) {
      ceilingLight.current.intensity = 4 + tools * 3;
      ceilingLight.current.width = 9 - tools * 3;
      ceilingLight.current.height = 18 - tools * 9;
      ceilingLight.current.position.set(
        target.position.x + 1,
        target.position.y + 7,
        target.position.z + 3,
      );
    }
    if (floorBounce.current) {
      floorBounce.current.position.set(
        target.position.x + 3.2,
        target.position.y - 0.7,
        target.position.z + 3,
      );
      floorBounce.current.intensity = 55 + openness * 12 + tools * 20;
    }
    if (aperture.current)
      aperture.current.position.set(
        target.position.x + 8,
        target.position.y + 11,
        target.position.z - 9,
      );
    if (routeResponse.current) {
      const domain = getSkillsCategoryIndex(p);
      const region = SKILLS_REGIONS[domain];
      const connection = Math.sin(assemblyProgress(p, domain) * Math.PI);
      routeResponse.current.position.set(region.x, region.y + 1.1, region.z - 1.7);
      routeResponse.current.intensity = connection * 1.2;
    }
  });
  return (
    <>
      <hemisphereLight ref={sky} args={['#b8d0df', '#a4957a', 0.65]} />
      <ambientLight color="#d4d9d2" intensity={0.12} />
      <primitive object={target} />
      <primitive object={pool} />
      <directionalLight
        ref={key}
        target={target}
        color="#ffe3b5"
        intensity={1.05}
        castShadow={!portrait}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={54}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-radius={3}
        shadow-blurSamples={6}
      />
      <spotLight
        ref={aperture}
        target={pool}
        color="#bdd8e8"
        intensity={130}
        distance={38}
        angle={0.85}
        penumbra={0.85}
        decay={2}
      />
      <rectAreaLight
        ref={ceilingLight}
        color="#ffe0ae"
        intensity={4}
        width={9}
        height={18}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <pointLight ref={floorBounce} color="#ffe5bc" intensity={55} distance={21} decay={2} />
      <pointLight ref={routeResponse} color="#8B1E2D" intensity={0} distance={3.4} decay={2} />
    </>
  );
}
