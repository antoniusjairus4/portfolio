'use client';

import { useThree } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo, useSyncExternalStore } from 'react';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { PalindromeScene } from './PalindromeScene';
import { NeuroShieldScene } from './NeuroShieldScene';

function heldController(value: number): ChapterProgressController {
  return { progress: { current: value }, subscribe: () => () => {}, dispose: () => {} };
}

/** A short editorial handoff; the DOM Ink veil covers the midpoint scene swap. */
export function PalindromeNeuroShieldBridgeScene({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const { camera, invalidate } = useThree();
  const outgoing = useMemo(() => heldController(1), []);
  const incoming = useMemo(() => heldController(0), []);
  const snapshot = useCallback(() => controller.progress.current >= 0.5, [controller]);
  const showNeuroShield = useSyncExternalStore(controller.subscribe, snapshot, () => false);
  useLayoutEffect(() => {
    camera.up.set(0, 1, 0);
    invalidate();
  }, [camera, invalidate, showNeuroShield]);
  return showNeuroShield ? (
    <NeuroShieldScene controller={incoming} portrait={portrait} />
  ) : (
    <PalindromeScene controller={outgoing} portrait={portrait} />
  );
}
