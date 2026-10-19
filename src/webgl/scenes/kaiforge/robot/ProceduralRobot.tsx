import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { Color, type Group } from 'three';
import { sampleColorDirection } from '../colorDirection';
import { useKaiForgeMaterials } from '../Materials';
import { PALETTE } from '../staging';
import { createRobotGeometry, type RobotPart } from './geometry';
import { createRobotMaterials, type RobotMaterialKey } from './materials';
import {
  FOREARM_LENGTH,
  GRIP_TO_BLADE,
  getRobotPose,
  ROBOT_ROOT,
  SHOULDER_HEIGHT,
  UPPER_LENGTH,
} from './pose';

function Part({
  geometry,
  materials,
}: {
  geometry: RobotPart;
  materials: ReturnType<typeof createRobotMaterials>;
}) {
  return (
    <>
      {Object.entries(geometry).map(([slot, shape]) => (
        <mesh
          key={slot}
          geometry={shape}
          material={materials[slot as RobotMaterialKey]}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

export function ProceduralRobot({ progress }: { progress: MutableRefObject<number> }) {
  const yaw = useRef<Group>(null);
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const wrist = useRef<Group>(null);
  const design = useMemo(createRobotGeometry, []);
  const { finish } = useKaiForgeMaterials();
  const materials = useMemo(() => createRobotMaterials(finish), [finish]);
  // Only the existing thin blade edge changes color; the robot body stays Ink.
  const paddleMaterials = useMemo(
    () => ({ ...materials, separator: materials.separator.clone() }),
    [materials],
  );
  const crimson = useMemo(() => new Color(PALETTE.crimson), []);
  useEffect(
    () => () => {
      design.dispose();
      for (const material of Object.values(materials)) material.dispose();
      paddleMaterials.separator.dispose();
    },
    [design, materials, paddleMaterials],
  );
  useFrame(() => {
    const pose = getRobotPose(progress.current);
    if (yaw.current) yaw.current.rotation.y = pose.shoulderYaw;
    if (shoulder.current) shoulder.current.rotation.z = pose.shoulderPitch;
    if (elbow.current) elbow.current.rotation.z = pose.elbowPitch;
    if (wrist.current) wrist.current.quaternion.copy(pose.wristRotation);
    paddleMaterials.separator.color.lerpColors(
      materials.separator.color,
      crimson,
      sampleColorDirection(progress.current).paddleAccent,
    );
  });
  const part = (key: keyof typeof design.parts) => (
    <Part geometry={design.parts[key]} materials={materials} />
  );
  return (
    <group name="KF_ProceduralRobot" position={[...ROBOT_ROOT]} dispose={null}>
      {part('base')}
      <group ref={yaw} name="KF_Robot_ShoulderYaw" position={[0, SHOULDER_HEIGHT, 0]}>
        {part('shoulder')}
        <group ref={shoulder} name="KF_Robot_ShoulderPitch">
          {part('upper')}
          <group ref={elbow} name="KF_Robot_Elbow" position={[UPPER_LENGTH, 0, 0]}>
            {part('elbow')}
            {part('forearm')}
            <group position={[FOREARM_LENGTH, 0, 0]}>
              {part('wrist')}
              <group ref={wrist} name="KF_Robot_WristGimbal">
                <Part geometry={design.parts.paddle} materials={paddleMaterials} />
                <group name="KF_Robot_ContactProbe" position={[0, GRIP_TO_BLADE, 0.025]} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
