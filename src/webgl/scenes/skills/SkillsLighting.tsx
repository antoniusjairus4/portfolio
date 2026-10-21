'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  type DirectionalLight,
  Object3D,
  PCFShadowMap,
  type PointLight,
  type SpotLight,
  Vector3,
} from 'three';
import { getSkillsCategoryIndex, smoothstep } from '@/components/skills/skillsChoreography';
import { assemblyProgress, SKILLS_REGIONS } from '@/components/skills/skillsSpatial';
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
  const floorBounce = useRef<PointLight>(null);
  const aperture = useRef<SpotLight>(null);
  const routeResponse = useRef<PointLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const pool = useMemo(() => new Object3D(), []);
  const ahead = useMemo(() => new Vector3(), []);
  useLayoutEffect(() => {
    const previous = gl.shadowMap.type;
    if (!portrait) {
      gl.shadowMap.type = PCFShadowMap;
      gl.shadowMap.needsUpdate = true;
    }
    return () => {
      gl.shadowMap.type = previous;
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl, portrait]);
  useFrame(() => {
    const p = controller.progress.current;
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
        target.position.x - 9,
        target.position.y + 17,
        target.position.z + 8,
      );
      key.current.intensity = 3.25 + openness * 0.5;
    }
    if (floorBounce.current) {
      floorBounce.current.position.set(
        target.position.x + 3.2,
        target.position.y - 0.7,
        target.position.z + 3,
      );
      floorBounce.current.intensity = 30 + openness * 9;
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
      <hemisphereLight args={['#e9e0ce', '#566364', 0.68]} />
      <primitive object={target} />
      <primitive object={pool} />
      <directionalLight
        ref={key}
        target={target}
        color="#fff0d8"
        intensity={3.25}
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
      />
      <spotLight
        ref={aperture}
        target={pool}
        color="#d9e3df"
        intensity={100}
        distance={38}
        angle={0.85}
        penumbra={0.85}
        decay={2}
      />
      <pointLight ref={floorBounce} color="#ead3ae" intensity={30} distance={21} decay={2} />
      <pointLight ref={routeResponse} color="#8B1E2D" intensity={0} distance={3.4} decay={2} />
    </>
  );
}
