'use client';

import React from 'react';
import { venturesContent } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

interface ChipNavProps {
  activeKey: string | null;
  onChipClick: (slug: string) => void;
}

export const VentureChipNav: React.FC<ChipNavProps> = ({ activeKey, onChipClick }) => {
  if (!activeKey) return null;

  const activeVenture = venturesContent.find((v) => v.slug === activeKey);
  const theme = activeVenture ? VENTURE_THEMES[activeVenture.themeKey] : null;

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-2"
      style={{
        backgroundColor: theme ? `${theme.surface}CC` : 'rgba(23, 17, 12, 0.85)',
        borderColor: theme ? `${theme.accent}40` : 'rgba(224, 169, 59, 0.3)',
        color: theme ? theme.text : '#F2E9D8',
      }}
      aria-label="Ventures Chapter Navigation"
    >
      {venturesContent.map((v) => {
        const isActive = v.slug === activeKey;
        const itemTheme = VENTURE_THEMES[v.themeKey];

        return (
          <button
            key={v.slug}
            onClick={() => onChipClick(v.slug)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all focus-visible:outline-none"
            style={{
              backgroundColor: isActive ? itemTheme.accent : 'transparent',
              color: isActive ? itemTheme.onAccent : theme ? theme.text : '#F2E9D8',
              opacity: isActive ? 1 : 0.7,
            }}
          >
            {v.chapterName || v.name}
          </button>
        );
      })}
    </nav>
  );
};
