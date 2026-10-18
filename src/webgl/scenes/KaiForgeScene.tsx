'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import { Vector3, Frustum, Matrix4, Mesh } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { KaiForgeMaterials, useKaiForgeMaterials } from './kaiforge/Materials';
import { Architecture } from './kaiforge/Architecture';
import { Equipment } from './kaiforge/Equipment';
import { ProxyAthlete } from './kaiforge/ProxyAthlete';
import { Trajectory } from './kaiforge/Trajectory';
import { CAMERAS, sampleCamera } from './kaiforge/staging';

function ProductionScene({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const materials = useKaiForgeMaterials();
  const { camera, scene, gl } = useThree();
  const target = useMemo(() => new Vector3(), []);
  useFrame(() => {
    const p = controller.progress.current;
    sampleCamera(portrait ? CAMERAS.portrait : CAMERAS.desktop, p, camera.position);
    sampleCamera(portrait ? CAMERAS.portraitTargets : CAMERAS.desktopTargets, p, target);
    camera.lookAt(target);
    camera.updateMatrixWorld();
  });
  // Read-only review instrumentation, no extra frame loop or production globals.
  useLayoutEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const previous = scene.onAfterRender;
    const frustum = new Frustum();
    const matrix = new Matrix4();
    scene.onAfterRender = () => {
      frustum.setFromProjectionMatrix(
        matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
      );
      let visibleTriangles = 0,
        shadowCasters = 0;
      const activeMaterials = new Set();
      scene.traverseVisible((object) => {
        if (!(object instanceof Mesh) || !frustum.intersectsObject(object)) return;
        const geometry = object.geometry;
        visibleTriangles +=
          Math.min(
            geometry.index?.count ?? geometry.attributes.position.count,
            geometry.drawRange.count,
          ) / 3;
        if (object.castShadow) shadowCasters++;
        activeMaterials.add(object.material);
      });
      gl.domElement.dataset.kfMetrics = JSON.stringify({
        calls: gl.info.render.calls,
        visibleTriangles,
        shadowCasters,
        materials: activeMaterials.size,
        dpr: gl.getPixelRatio(),
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        progress: controller.progress.current,
        camera: camera.position.toArray(),
      });
    };
    return () => {
      scene.onAfterRender = previous;
      delete gl.domElement.dataset.kfMetrics;
    };
  }, [scene, gl, controller, camera]);
  return (
    <>
      <color attach="background" args={['#191b19']} />
      <hemisphereLight args={['#f3ead8', '#6e685e', 1.4]} />
      <directionalLight
        position={[-3, 7, 4]}
        intensity={2.3}
        color="#fff1d9"
        castShadow={!portrait}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-camera-near={0.1}
        shadow-camera-far={15}
        shadow-normalBias={0.02}
        shadow-bias={-0.0002}
      />
      <Architecture progress={controller.progress} portrait={portrait} />
      <Equipment />
      <ProxyAthlete progress={controller.progress} />
      <Trajectory progress={controller.progress} portrait={portrait} />
      {/* Low-tier contact impression; no shadow renderer or transparent floor layers. */}
      {portrait && (
        <group>
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.1, 1.05]} />
            <primitive attach="material" object={materials.contact} />
          </mesh>
          <mesh position={[-1.95, 0.002, 0.38]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.5, 1, 1]}>
            <circleGeometry args={[0.55, 24]} />
            <primitive attach="material" object={materials.contact} />
          </mesh>
        </group>
      )}
    </>
  );
}

export function KaiForgeScene(props: { controller: ChapterProgressController; portrait: boolean }) {
  return (
    <KaiForgeMaterials>
      <ProductionScene {...props} />
    </KaiForgeMaterials>
  );
}
