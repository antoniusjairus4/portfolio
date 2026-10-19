import { AnimationMixer, LoopOnce, type AnimationClip, type Object3D } from 'three';
import { smoothstep } from '@/components/kaiforge/kaiforgeChoreography';

// The exporter kept frame/30 timestamps (READY=.03333, IMPACT=.6), not (frame-1)/30.
const KEYS = [
  [0, 1],
  [0.18, 1],
  [0.28, 7],
  [0.39, 13],
  [0.455, 18],
  [0.49, 18],
  [0.67, 25],
  [0.82, 36],
  [1, 36],
] as const;
export function athleteFrame(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 1; i < KEYS.length; i++) {
    const [end, frame] = KEYS[i],
      [start, previous] = KEYS[i - 1];
    if (p <= end) return previous + (frame - previous) * smoothstep((p - start) / (end - start));
  }
  return 36;
}
export function createAthleteAnimation(root: Object3D, clips: AnimationClip[]) {
  const clip = clips.find((clip) => clip.name === 'KF_Athlete_Forehand');
  if (!clip) throw new Error('Missing KF_Athlete_Forehand clip');
  const mixer = new AnimationMixer(root);
  const action = mixer.clipAction(clip).setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  return {
    sample(progress: number) {
      action.enabled = true;
      action.paused = false;
      mixer.setTime(athleteFrame(progress) / 30);
      root.updateMatrixWorld(true);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(root);
    },
  };
}
