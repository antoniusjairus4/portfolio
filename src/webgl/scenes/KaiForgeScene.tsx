'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import { Frustum, Matrix4, Mesh, Vector3 } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { Architecture } from './kaiforge/Architecture';
import { ArenaLighting } from './kaiforge/ArenaLighting';
import { Equipment } from './kaiforge/Equipment';
import { KaiForgeMaterials, useKaiForgeMaterials } from './kaiforge/Materials';
import { ProceduralRobot } from './kaiforge/robot/ProceduralRobot';
import { getRobotPose, ROBOT_ROOT } from './kaiforge/robot/pose';
import { CAMERAS, CONTACT, sampleCamera } from './kaiforge/staging';
import { TrainingProps } from './kaiforge/TrainingProps';
import { Trajectory } from './kaiforge/Trajectory';

export function KaiForgeWorld({
  controller,
  portrait,
  active = true,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
  active?: boolean;
}) {
  const materials = useKaiForgeMaterials();
  const { camera, scene, gl } = useThree();
  const target = useMemo(() => new Vector3(), []);
  useFrame(() => {
    if (!active) return;
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
    const contactPoint = new Vector3();
    scene.onAfterRender = () => {
      frustum.setFromProjectionMatrix(
        matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
      );
      let visibleTriangles = 0,
        shadowCasters = 0,
        athleteInstances = 0,
        robotInstances = 0;
      const activeMaterials = new Set();
      scene.traverseVisible((object) => {
        if (object.name === 'KF_ProductionAthlete') athleteInstances++;
        if (object.name === 'KF_StagingProxy_NOT_PRODUCTION') athleteInstances++;
        if (object.name === 'KF_ProceduralRobot') robotInstances++;
        if (
          !(object instanceof Mesh) ||
          (object.frustumCulled && !frustum.intersectsObject(object))
        )
          return;
        const geometry = object.geometry;
        visibleTriangles +=
          Math.min(
            geometry.index?.count ?? geometry.attributes.position.count,
            geometry.drawRange.count,
          ) / 3;
        if (object.castShadow) shadowCasters++;
        activeMaterials.add(object.material);
      });
      let robotTriangles = 0,
        robotMeshes = 0;
      const robotMaterials = new Set();
      scene.getObjectByName('KF_ProceduralRobot')?.traverseVisible((object) => {
        if (!(object instanceof Mesh)) return;
        robotTriangles +=
          (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
        robotMeshes++;
        robotMaterials.add(object.material);
      });
      scene.getObjectByName('KF_Robot_ContactProbe')?.getWorldPosition(contactPoint);
      const pose = getRobotPose(controller.progress.current);
      gl.domElement.dataset.kfMetrics = JSON.stringify({
        athleteInstances,
        robotInstances,
        robotTriangles,
        robotMeshes,
        robotMaterials: robotMaterials.size,
        robotPhase: pose.phase,
        robotPose: [
          pose.shoulderYaw,
          pose.shoulderPitch,
          pose.elbowPitch,
          ...pose.wristRotation.toArray(),
        ],
        contact: contactPoint.toArray(),
        contactError: contactPoint.distanceTo(CONTACT),
        programs: gl.info.programs?.length,
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
      {active && <color attach="background" args={['#111111']} />}
      <group visible={active}>
        <ArenaLighting portrait={portrait} progress={controller.progress} />
        <Architecture portrait={portrait} />
        <Equipment />
        <TrainingProps />
        <ProceduralRobot progress={controller.progress} />
        <Trajectory progress={controller.progress} portrait={portrait} />
        {/* Subtle low-tier contact impressions; no extra shadow renderer. */}
        {portrait && (
          <group>
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.1, 1.05]} />
            <primitive attach="material" object={materials.contact} />
          </mesh>
          <mesh
            position={[ROBOT_ROOT[0], 0.002, ROBOT_ROOT[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[0.75, 0.65, 1]}
          >
            <circleGeometry args={[0.55, 24]} />
            <primitive attach="material" object={materials.contact} />
          </mesh>
          </group>
        )}
      </group>
    </>
  );
}

export function KaiForgeScene(props: { controller: ChapterProgressController; portrait: boolean }) {
  return (
    <KaiForgeMaterials>
      <KaiForgeWorld {...props} />
    </KaiForgeMaterials>
  );
}
