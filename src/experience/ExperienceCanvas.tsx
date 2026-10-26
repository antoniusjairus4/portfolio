'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { PCFShadowMap } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import type { ProjectSceneKey } from '@/experience/ProjectExperienceProvider';
import { AchievementsScene } from '@/webgl/scenes/AchievementsScene';
import { KaiForgeScene } from '@/webgl/scenes/KaiForgeScene';
import { KaiPalindromeBridgeScene } from '@/webgl/scenes/KaiPalindromeBridgeScene';
import { NeuroShieldScene } from '@/webgl/scenes/NeuroShieldScene';
import { PalindromeNeuroShieldBridgeScene } from '@/webgl/scenes/PalindromeNeuroShieldBridgeScene';
import { PalindromeScene } from '@/webgl/scenes/PalindromeScene';

function ProgressInvalidator({ controller }: { controller: ChapterProgressController }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    return controller.subscribe(invalidate);
  }, [controller, invalidate]);
  return null;
}

interface ExperienceCanvasProps {
  scene: ProjectSceneKey;
  controller: ChapterProgressController;
  dprCap: number;
  portrait: boolean;
}

export function ExperienceCanvas({ scene, controller, dprCap, portrait }: ExperienceCanvasProps) {
  return (
    <Canvas
      data-experience-renderer="shared"
      frameloop="demand"
      dpr={[1, dprCap]}
      camera={{ fov: portrait ? 46 : 39, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows={
        portrait
          ? false
          : scene === 'kaiforge' || scene === 'kai-palindrome-bridge'
            ? { type: PCFShadowMap }
            : 'basic'
      }
      onCreated={({ gl }) => {
        gl.setClearColor('#0b0908', 1);
      }}
    >
      <ProgressInvalidator controller={controller} />
      {scene === 'kaiforge' && <KaiForgeScene controller={controller} portrait={portrait} />}
      {scene === 'kai-palindrome-bridge' && (
        <KaiPalindromeBridgeScene controller={controller} portrait={portrait} />
      )}
      {scene === 'palindrome' && <PalindromeScene controller={controller} portrait={portrait} />}
      {scene === 'palindrome-neuroshield-bridge' && (
        <PalindromeNeuroShieldBridgeScene controller={controller} portrait={portrait} />
      )}
      {scene === 'neuroshield' && <NeuroShieldScene controller={controller} portrait={portrait} />}
      {scene === 'achievements' && (
        <Suspense fallback={null}>
          <AchievementsScene controller={controller} portrait={portrait} />
        </Suspense>
      )}
    </Canvas>
  );
}
