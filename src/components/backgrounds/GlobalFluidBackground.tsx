'use client';

import React from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';

export const GlobalFluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden">
      {/* Dim Fallback Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <img
          src="/images/achievements/bg-fluid.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover filter brightness-90"
        />
      </div>

      {/* WebGL LiquidEther Simulation Layer */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-85">
        <LiquidEther
          colors={['#0A0908', '#9A6318', '#F5B031', '#FFD275']}
          mouseForce={24}
          cursorSize={140}
          isViscous={true}
          viscous={40}
          iterationsViscous={36}
          iterationsPoisson={40}
          resolution={0.65}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={2.8}
          takeoverDuration={0.3}
          autoResumeDelay={1800}
          backgroundColor="#0A0908"
        />
      </div>
    </div>
  );
};
