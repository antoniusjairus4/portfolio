export interface VentureTheme {
  key: 'palindrome' | 'kaiforge' | 'neuroshield';
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  onAccent: string;
  danger: string;
  fontFamily: string;
  borderRadius: string;
}

export const VENTURE_THEMES: Record<VentureTheme['key'], VentureTheme> = {
  palindrome: {
    key: 'palindrome',
    bg: '#FFFFFF', // Clean White Background
    surface: '#F8FAFC',
    text: '#0F172A',
    muted: '#475569',
    accent: '#6366F1',
    accent2: '#818CF8',
    onAccent: '#FFFFFF',
    danger: '#EF4444',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '9999px',
  },
  kaiforge: {
    key: 'kaiforge',
    bg: '#E2E8F0', // Medium Light Blue/Slate
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    accent: '#0EA5E9',
    accent2: '#38BDF8',
    onAccent: '#FFFFFF',
    danger: '#E11D48',
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '16px',
  },
  neuroshield: {
    key: 'neuroshield',
    bg: '#F8FAFC', // Crisp Lightest Blue/White
    surface: '#FFFFFF',
    text: '#0284C7',
    muted: '#64748B',
    accent: '#0284C7',
    accent2: '#38BDF8',
    onAccent: '#FFFFFF',
    danger: '#FF4A4A',
    fontFamily: '"Space Grotesk", sans-serif',
    borderRadius: '4px',
  },
};
