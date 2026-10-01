import React from 'react';
import { BakeResult } from './bakePhysics';

interface PhysicsDebugOverlayProps {
  scrollProgress: number;
  bakedFrameIndex: number;
  bakeResult: BakeResult | null;
  bakeTimeMs: number;
  isBaking: boolean;
}

export const PhysicsDebugOverlay: React.FC<PhysicsDebugOverlayProps> = ({
  scrollProgress,
  bakedFrameIndex,
  bakeResult,
  bakeTimeMs,
  isBaking,
}) => {
  return (
    <div className="absolute top-4 left-4 z-50 p-3 bg-black/85 text-xs text-amber-400 font-mono rounded border border-amber-500/30 shadow-lg pointer-events-auto backdrop-blur-sm max-w-sm">
      <div className="font-bold border-b border-amber-500/30 pb-1 mb-2 text-white">
        PHYSICS COLLAPSE DEBUG OVERLAY (?physDebug=1)
      </div>
      <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
      <div>Active Beat: Beat D (Physics Collapse)</div>
      <div>Baked Frame Index: {bakedFrameIndex} / {bakeResult ? bakeResult.totalFrames - 1 : 0}</div>
      <div>Engine Status: {isBaking ? 'BAKING...' : bakeResult ? 'BAKED (Matter.js)' : 'FALLBACK'}</div>
      <div>Body Count: {bakeResult ? bakeResult.letterIds.length : 0} rigid bodies</div>
      <div>Bake Time: {bakeTimeMs.toFixed(1)} ms</div>
      <div>Simulation Hash: {bakeResult ? bakeResult.hash : 'N/A'}</div>
    </div>
  );
};
