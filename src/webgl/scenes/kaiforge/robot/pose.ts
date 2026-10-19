import { Euler, Quaternion, Vector3 } from 'three';
import { smoothstep } from '@/components/kaiforge/kaiforgeChoreography';
import { CONTACT } from '../staging';

export const ROBOT_ROOT = [-1.88, 0, 0.25] as const;
export const SHOULDER_HEIGHT = 0.7;
export const UPPER_LENGTH = 0.68;
export const FOREARM_LENGTH = 0.67;
export const GRIP_TO_BLADE = 0.15;
export const FACE_TO_BALL = 0.025; // 5 mm blade half-thickness + 20 mm ball radius.
const IMPACT_YAW = Math.atan2(0.8, 0.6);
const IMPACT_CENTER = CONTACT.clone().addScaledVector(new Vector3(0.8, 0, 0.6), -FACE_TO_BALL);
const READY = new Vector3(-1.48, 1.43, 0.24);
const LOAD = new Vector3(-1.93, 1.4, 0.64);
const FOLLOW = new Vector3(-1.31, 1.55, -0.18);
const clamp = (p: number) => Math.min(1, Math.max(0, p));

/** Pure absolute-progress IK; no mixer, clock, accumulated angle, or imported pose. */
export function getRobotPose(progress: number) {
  const p = clamp(progress);
  const center = READY.clone();
  let yaw = 1.02;
  let roll = -0.2;
  let tilt = 0.08;
  let phase = 'ready';
  if (p > 0.18 && p <= 0.3) {
    const t = clamp((p - 0.18) / 0.12);
    center.lerp(LOAD, smoothstep(t));
    yaw += (-0.15 - yaw) * smoothstep(t);
    roll += (0.32 - roll) * smoothstep(t * t);
    phase = 'load';
  } else if (p > 0.3 && p < 0.455) {
    const t = clamp((p - 0.3) / 0.155);
    center.copy(LOAD).lerp(IMPACT_CENTER, t * t);
    center.y += Math.sin(Math.PI * t) * 0.035;
    // The wrist turns later than the main sweep, then closes precisely on contact.
    const wrist = smoothstep(clamp((t - 0.12) / 0.88));
    yaw = -0.15 + (IMPACT_YAW + 0.15) * wrist;
    roll = 0.32 * (1 - wrist);
    tilt = 0.08 * (1 - wrist);
    phase = 'acceleration';
  } else if (p >= 0.455 && p <= 0.49) {
    center.copy(IMPACT_CENTER);
    yaw = IMPACT_YAW;
    roll = 0;
    tilt = 0;
    phase = 'impact';
  } else if (p > 0.49) {
    const t = clamp((p - 0.49) / 0.15);
    center.copy(IMPACT_CENTER).lerp(FOLLOW, 1 - (1 - t) ** 3);
    const wrist = smoothstep(t);
    yaw = IMPACT_YAW + (1.5 - IMPACT_YAW) * wrist;
    roll = 0.48 * wrist;
    tilt = 0.12 * wrist;
    phase = 'follow-through';
  }
  const paddleRotation = new Quaternion().setFromEuler(new Euler(tilt, yaw, roll, 'YXZ'));
  const wrist = center
    .clone()
    .sub(new Vector3(0, GRIP_TO_BLADE, 0).applyQuaternion(paddleRotation));
  const relative = wrist.clone().sub(new Vector3(ROBOT_ROOT[0], SHOULDER_HEIGHT, ROBOT_ROOT[2]));
  const reach = Math.hypot(relative.x, relative.z);
  const shoulderYaw = Math.atan2(-relative.z, relative.x);
  const cosine =
    (reach ** 2 + relative.y ** 2 - UPPER_LENGTH ** 2 - FOREARM_LENGTH ** 2) /
    (2 * UPPER_LENGTH * FOREARM_LENGTH);
  const elbowPitch = -Math.acos(Math.max(-1, Math.min(1, cosine)));
  const shoulderPitch =
    Math.atan2(relative.y, reach) -
    Math.atan2(
      FOREARM_LENGTH * Math.sin(elbowPitch),
      UPPER_LENGTH + FOREARM_LENGTH * Math.cos(elbowPitch),
    );
  const parent = new Quaternion()
    .setFromAxisAngle(new Vector3(0, 1, 0), shoulderYaw)
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), shoulderPitch + elbowPitch));
  const wristRotation = parent.invert().multiply(paddleRotation);
  return {
    phase,
    shoulderYaw,
    shoulderPitch,
    elbowPitch,
    wristRotation,
    bladeCenter: center,
    reachable: Math.abs(cosine) <= 1,
  };
}
