'use client';

import React from 'react';
import { VentureItem } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

export const VentureMotif: React.FC<{ venture: VentureItem }> = ({ venture }) => {
  const theme = VENTURE_THEMES[venture.themeKey];

  if (venture.motif === 'chain-blocks') {
    return (
      <svg viewBox="0 0 400 100" className="w-full max-w-md h-auto opacity-75">
        <rect x="20" y="30" width="80" height="40" rx="8" fill="none" stroke={theme.accent} strokeWidth="2" />
        <line x1="100" y1="50" x2="150" y2="50" stroke={theme.accent} strokeWidth="2" strokeDasharray="4 2" />
        <rect x="150" y="30" width="80" height="40" rx="8" fill="none" stroke={theme.accent} strokeWidth="2" />
        <line x1="230" y1="50" x2="280" y2="50" stroke={theme.accent} strokeWidth="2" strokeDasharray="4 2" />
        <rect x="280" y="30" width="80" height="40" rx="8" fill="none" stroke={theme.accent} strokeWidth="2" />
      </svg>
    );
  }

  if (venture.motif === 'ball-arc') {
    return (
      <svg viewBox="0 0 400 100" className="w-full max-w-md h-auto opacity-75">
        <path d="M 20 80 Q 150 10, 250 80 T 380 40" fill="none" stroke={theme.accent} strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="250" cy="80" r="4" fill={theme.danger} />
        <circle cx="380" cy="40" r="6" fill={theme.accent2} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 100" className="w-full max-w-md h-auto opacity-75">
      <circle cx="60" cy="50" r="8" fill={theme.accent} />
      <circle cx="180" cy="25" r="10" fill={theme.accent2} />
      <circle cx="220" cy="75" r="7" fill={theme.accent} />
      <circle cx="340" cy="50" r="9" fill={theme.accent2} />
      <line x1="60" y1="50" x2="180" y2="25" stroke={theme.accent} strokeWidth="1.5" opacity="0.6" />
      <line x1="60" y1="50" x2="220" y2="75" stroke={theme.accent} strokeWidth="1.5" opacity="0.6" />
      <line x1="180" y1="25" x2="340" y2="50" stroke={theme.accent} strokeWidth="1.5" opacity="0.6" />
      <line x1="220" y1="75" x2="340" y2="50" stroke={theme.accent} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
};
