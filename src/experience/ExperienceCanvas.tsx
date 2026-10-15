'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { KaiForgeScene } from '@/webgl/scenes/KaiForgeScene';

function ProgressInvalidator({ controller }: { controller: ChapterProgressController }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => controller.subscribe(invalidate), [controller, invalidate]);
  return null;
}

interface ExperienceCanvasProps {
  controller: ChapterProgressController;
  dprCap: number;
  portrait: boolean;
}

export function ExperienceCanvas({ controller, dprCap, portrait }: ExperienceCanvasProps) {
  return (
    <Canvas
      data-experience-renderer="shared"
      frameloop="demand"
      dpr={[1, dprCap]}
      camera={{ fov: portrait ? 46 : 39, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      shadows={!portrait}
      onCreated={({ gl }) => {
        gl.setClearColor('#0b0908');
      }}
    >
      <ProgressInvalidator controller={controller} />
      <KaiForgeScene controller={controller} portrait={portrait} />
    </Canvas>
  );
}
