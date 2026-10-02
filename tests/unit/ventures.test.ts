import { describe, it, expect } from 'vitest';
import { venturesContent, VentureItemSchema } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

describe('Ventures Content & Theme Schemas', () => {
  it('validates every venture against VentureItemSchema', () => {
    expect(venturesContent.length).toBe(3);
    venturesContent.forEach((v) => {
      expect(() => VentureItemSchema.parse(v)).not.toThrow();
    });
  });

  it('ensures fixed venture order: Palindrome, KaiForge, NeuroShield AI', () => {
    expect(venturesContent[0].slug).toBe('palindrome');
    expect(venturesContent[1].slug).toBe('kaiforge');
    expect(venturesContent[2].slug).toBe('neuroshield');
  });

  it('verifies theme tokens exist for every venture', () => {
    venturesContent.forEach((v) => {
      const theme = VENTURE_THEMES[v.themeKey];
      expect(theme).toBeDefined();
      expect(theme.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.text).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
