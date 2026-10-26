'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { PCFShadowMap } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import type { ProjectSceneKey } from '@/experience/ProjectExperienceProvider';
import { AchievementsScene } from '@/webgl/scenes/AchievementsScene';
import { KaiForgeWorld } from '@/webgl/scenes/KaiForgeScene';
import { KaiPalindromeBridgeWorld } from '@/webgl/scenes/KaiPalindromeBridgeScene';
import { KaiForgeMaterials } from '@/webgl/scenes/kaiforge/Materials';
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

function SceneHandoffInvalidator({ scene }: { scene: ProjectSceneKey }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let frame = 0;
    let remaining = 18;
    const warmIncomingScene = () => {
      invalidate();
      remaining -= 1;
      if (remaining > 0) frame = requestAnimationFrame(warmIncomingScene);
    };
    warmIncomingScene();
    return () => cancelAnimationFrame(frame);
  }, [invalidate, scene]);

  return null;
}

interface ExperienceCanvasProps {
  scene: ProjectSceneKey;
  controller: ChapterProgressController;
  kaiForgeController?: ChapterProgressController;
  kaiPalindromeBridgeController?: ChapterProgressController;
  palindromeController?: ChapterProgressController;
  dprCap: number;
  portrait: boolean;
}

export function ExperienceCanvas({
  scene,
  controller,
  kaiForgeController,
  kaiPalindromeBridgeController,
  palindromeController,
  dprCap,
  portrait,
}: ExperienceCanvasProps) {
  const inKaiPalindromeContinuity =
    scene === 'kaiforge' || scene === 'kai-palindrome-bridge' || scene === 'palindrome';
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
      <SceneHandoffInvalidator scene={scene} />
      {inKaiPalindromeContinuity && (
        <KaiForgeMaterials>
          {kaiForgeController && (
            <KaiForgeWorld
              controller={kaiForgeController}
              portrait={portrait}
              active={scene === 'kaiforge'}
            />
          )}
          {kaiPalindromeBridgeController && (
            <KaiPalindromeBridgeWorld
              controller={kaiPalindromeBridgeController}
              portrait={portrait}
              active={scene === 'kai-palindrome-bridge'}
            />
          )}
          {palindromeController && (
            <PalindromeScene
              controller={palindromeController}
              portrait={portrait}
              active={scene === 'palindrome'}
            />
          )}
        </KaiForgeMaterials>
      )}
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
