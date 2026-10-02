'use client';

import React, { useState } from 'react';
import { VentureItem } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

export const NeuroShieldDemo: React.FC<{ venture: VentureItem }> = ({ venture }) => {
  const theme = VENTURE_THEMES[venture.themeKey];
  const [sliceIndex, setSliceIndex] = useState(4); // 0 to 9
  const totalSlices = 10;

  // Compute illustrative anomaly confidence per slice
  const anomalyIntensity = Math.max(0, Math.sin((sliceIndex / (totalSlices - 1)) * Math.PI) * 0.85);

  return (
    <div
      className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl border transition-colors duration-300"
      style={{
        backgroundColor: theme.surface,
        borderColor: `${theme.accent}30`,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: `${theme.accent}20` }}>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-bold tracking-tight">MRI Slice Scrubber</h4>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border" style={{ borderColor: theme.accent, color: theme.accent }}>
              NEURO-AI
            </span>
          </div>
          <p className="text-xs opacity-70 mt-1">
            Illustrative scan scrubber demo. <span className="font-semibold text-cyan-300">Not a real patient scan or medical diagnosis.</span>
          </p>
        </div>
        <div className="font-mono text-xs px-3 py-1 rounded border" style={{ borderColor: `${theme.accent}40`, color: theme.accent }}>
          SLICE {sliceIndex + 1} / {totalSlices}
        </div>
      </div>

      {/* Synthetic Brain Contour SVG Visualizer */}
      <div className="relative w-full h-64 bg-[#04070F] rounded-xl overflow-hidden border flex items-center justify-center" style={{ borderColor: `${theme.accent}25` }}>
        <svg viewBox="0 0 400 300" className="w-full h-full p-4">
          {/* Subtle grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.accent} strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Brain Slice Outer Shell Contours */}
          <g opacity="0.85">
            {/* Outer Cortex */}
            <path
              d="M 200 40 C 290 40, 340 100, 330 180 C 320 250, 260 270, 200 270 C 140 270, 80 250, 70 180 C 60 100, 110 40, 200 40 Z"
              fill="none"
              stroke={theme.accent}
              strokeWidth={2 + sliceIndex * 0.2}
              opacity={0.4 + (sliceIndex / totalSlices) * 0.5}
            />
            {/* Inner Ventricles */}
            <path
              d="M 200 90 C 240 90, 270 130, 260 170 C 250 210, 220 220, 200 220 C 180 220, 150 210, 140 170 C 130 130, 160 90, 200 90 Z"
              fill="none"
              stroke={theme.accent2}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.6"
            />
          </g>

          {/* Synthetic AI Heatmap Overlay */}
          {anomalyIntensity > 0.1 && (
            <g>
              <ellipse
                cx={200 + Math.sin(sliceIndex) * 20}
                cy={150 + Math.cos(sliceIndex) * 15}
                rx={35 + anomalyIntensity * 25}
                ry={25 + anomalyIntensity * 20}
                fill={theme.accent}
                opacity={anomalyIntensity * 0.45}
                className="transition-all duration-300"
              />
              <circle
                cx={200 + Math.sin(sliceIndex) * 20}
                cy={150 + Math.cos(sliceIndex) * 15}
                r={15 + anomalyIntensity * 10}
                fill={theme.accent2}
                opacity={anomalyIntensity * 0.7}
              />
            </g>
          )}

          {/* Crosshair Scanner Lines */}
          <line x1="200" y1="20" x2="200" y2="280" stroke={theme.accent} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
          <line x1="40" y1="150" x2="360" y2="150" stroke={theme.accent} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
        </svg>

        {/* Heatmap Confidence Overlay Readout */}
        <div className="absolute bottom-3 right-3 font-mono text-[10px] px-2.5 py-1 rounded bg-[#070D1A]/90 border" style={{ borderColor: `${theme.accent}40`, color: theme.accent }}>
          HEATMAP CONFIDENCE: {(anomalyIntensity * 100).toFixed(1)}%
        </div>
      </div>

      {/* Slider Controls */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-xs font-mono opacity-80">
          <span>ANTERIOR (AXIAL 01)</span>
          <span>POSTERIOR (AXIAL {totalSlices.toString().padStart(2, '0')})</span>
        </div>
        <input
          type="range"
          min="0"
          max={totalSlices - 1}
          value={sliceIndex}
          onChange={(e) => setSliceIndex(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
          aria-label="MRI slice scrubber position"
        />
      </div>
    </div>
  );
};
