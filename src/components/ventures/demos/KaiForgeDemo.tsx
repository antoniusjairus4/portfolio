'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VentureItem } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

interface TrajectoryPoint {
  x: number;
  y: number;
}

export const KaiForgeDemo: React.FC<{ venture: VentureItem }> = ({ venture }) => {
  const theme = VENTURE_THEMES[venture.themeKey];
  const [speed, setSpeed] = useState(25);
  const [angle, setAngle] = useState(-35); // degrees
  const [spin, setSpin] = useState<'topspin' | 'flat' | 'backspin'>('topspin');
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [bouncePoint, setBouncePoint] = useState<TrajectoryPoint | null>(null);

  const simulateShot = useCallback(() => {
    const points: TrajectoryPoint[] = [];
    const rad = (angle * Math.PI) / 180;
    
    // Canvas coords: origin at launcher (x: 50, y: 180)
    let x = 50;
    let y = 180;
    let vx = Math.cos(rad) * speed * 0.35;
    let vy = Math.sin(rad) * speed * 0.35;
    
    const gravity = 0.18;
    const spinFactor = spin === 'topspin' ? 0.04 : spin === 'backspin' ? -0.03 : 0;
    const tableY = 220; // Table height line
    let bounced = false;
    let bPt: TrajectoryPoint | null = null;

    for (let t = 0; t < 120; t++) {
      points.push({ x, y });
      
      // Apply forces (deterministic fixed timestep)
      vy += gravity + spinFactor;
      x += vx;
      y += vy;

      // Table bounce check (table spans x: 150 to 550)
      if (!bounced && y >= tableY && x >= 150 && x <= 550) {
        y = tableY;
        vy = -vy * 0.72; // restitution
        vx *= 0.92;
        bounced = true;
        bPt = { x, y };
      }

      if (y > 280 || x > 620) break;
    }

    setTrajectory(points);
    setBouncePoint(bPt);
  }, [speed, angle, spin]);

  useEffect(() => {
    simulateShot();
  }, [simulateShot]);

  return (
    <div
      className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl border transition-colors duration-300"
      style={{
        backgroundColor: theme.surface,
        borderColor: `${theme.text}20`,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: `${theme.text}15` }}>
        <div>
          <h4 className="text-xl font-bold tracking-tight">Shot Trajectory Sandbox</h4>
          <p className="text-xs opacity-75 mt-0.5">
            Interactive physics simulation demo of KaiForge table tennis tracking.
          </p>
        </div>
        <div className="text-xs font-mono font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
          Speed: {speed} m/s
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative w-full h-64 bg-slate-900/5 rounded-xl overflow-hidden border border-black/10 flex items-center justify-center">
        <svg viewBox="0 0 640 280" className="w-full h-full">
          {/* Net */}
          <line x1="350" y1="170" x2="350" y2="220" stroke={theme.text} strokeWidth="3" strokeDasharray="4 2" opacity="0.6" />
          
          {/* Table Surface */}
          <line x1="150" y1="220" x2="550" y2="220" stroke={theme.accent} strokeWidth="5" strokeLinecap="round" />
          {/* Table Legs */}
          <line x1="200" y1="220" x2="200" y2="260" stroke={theme.text} strokeWidth="3" opacity="0.3" />
          <line x1="500" y1="220" x2="500" y2="260" stroke={theme.text} strokeWidth="3" opacity="0.3" />

          {/* Trajectory Trail */}
          {trajectory.length > 1 && (
            <polyline
              fill="none"
              stroke={theme.accent}
              strokeWidth="3"
              strokeDasharray="6 4"
              opacity="0.8"
              points={trajectory.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          )}

          {/* Bounce Marker */}
          {bouncePoint && (
            <circle cx={bouncePoint.x} cy={bouncePoint.y} r="6" fill={theme.danger} opacity="0.9" />
          )}

          {/* Ball Position */}
          {trajectory.length > 0 && (
            <circle
              cx={trajectory[trajectory.length - 1].x}
              cy={trajectory[trajectory.length - 1].y}
              r="7"
              fill={theme.accent2}
              stroke={theme.accent}
              strokeWidth="2"
            />
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
        <div>
          <label className="block mb-1 opacity-80">Shot Velocity ({speed} m/s)</label>
          <input
            type="range"
            min="10"
            max="45"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="block mb-1 opacity-80">Launch Angle ({angle}°)</label>
          <input
            type="range"
            min="-60"
            max="-10"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="block mb-1 opacity-80">Spin Dynamics</label>
          <div className="flex gap-1">
            {(['topspin', 'flat', 'backspin'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpin(s)}
                className="flex-1 py-1.5 rounded text-[11px] font-semibold capitalize transition-all"
                style={{
                  backgroundColor: spin === s ? theme.accent : `${theme.text}10`,
                  color: spin === s ? theme.onAccent : theme.text,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
