import { rangeProgress, smoothstep } from '@/components/kaiforge/kaiforgeChoreography';

/** Absolute scroll samples: color follows the existing stroke/contact timing. */
export function sampleColorDirection(progress: number) {
  const contact =
    smoothstep(rangeProgress(progress, 0.43, 0.455)) *
    (1 - smoothstep(rangeProgress(progress, 0.49, 0.54)));
  const tension =
    smoothstep(rangeProgress(progress, 0.27, 0.43)) *
    (1 - smoothstep(rangeProgress(progress, 0.49, 0.56)));
  const selectedPath =
    smoothstep(rangeProgress(progress, 0.455, 0.49)) *
    (1 - smoothstep(rangeProgress(progress, 0.82, 0.99)));
  return { contact, paddleAccent: Math.max(tension * 0.42, contact), selectedPath };
}
