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
    bg: '#000000',
    surface: '#0D1829',
    text: '#D4E8F5',
    muted: '#4A6A8A',
    accent: '#3FD0FF',
    accent2: '#7DF9FF',
    onAccent: '#000000',
    danger: '#FF4A4A',
    fontFamily: '"Space Grotesk", sans-serif',
    borderRadius: '0px',
  },
};
