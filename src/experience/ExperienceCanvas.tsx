'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import type { ProjectSceneKey } from '@/experience/ProjectExperienceProvider';
import { KaiForgeScene } from '@/webgl/scenes/KaiForgeScene';
import { NeuroShieldScene } from '@/webgl/scenes/NeuroShieldScene';
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
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      shadows={portrait ? false : 'basic'}
      onCreated={({ gl }) => {
        gl.setClearColor('#0b0908');
      }}
    >
      <ProgressInvalidator controller={controller} />
      {scene === 'kaiforge' && <KaiForgeScene controller={controller} portrait={portrait} />}
      {scene === 'palindrome' && <PalindromeScene controller={controller} portrait={portrait} />}
      {scene === 'neuroshield' && <NeuroShieldScene controller={controller} portrait={portrait} />}
    </Canvas>
  );
}
