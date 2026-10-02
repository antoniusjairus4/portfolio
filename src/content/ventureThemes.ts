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
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    accent: '#6366F1',
    accent2: '#A5B4FC',
    onAccent: '#FFFFFF',
    danger: '#EF4444',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '9999px',
  },
  kaiforge: {
    key: 'kaiforge',
    bg: '#F4F6F9',
    surface: '#FFFFFF',
    text: '#0B132B',
    muted: '#5B6B83',
    accent: '#0EA5E9',
    accent2: '#38BDF8',
    onAccent: '#FFFFFF',
    danger: '#E11D48',
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '16px',
  },
  neuroshield: {
    key: 'neuroshield',
    bg: '#F0F7FF',
    surface: '#FFFFFF',
    text: '#0A192F',
    muted: '#4A6A8A',
    accent: '#00A8E8',
    accent2: '#00C49F',
    onAccent: '#FFFFFF',
    danger: '#FF4A4A',
    fontFamily: '"Space Grotesk", sans-serif',
    borderRadius: '4px',
  },
};
