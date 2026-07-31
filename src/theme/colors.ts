export const lightColors = {
  background: '#FFFFFF',
  surface: '#F5F6F8',
  card: '#FFFFFF',
  text: '#1A1D1F',
  textMuted: '#6B7280',
  primary: '#1A5331',
  primaryLight: '#2E7D4E',
  primaryDark: '#0F331E',
  primaryBg: '#EAF4EE',
  primaryText: '#FFFFFF',
  secondary: '#E77F43',
  secondaryLight: '#F09C6B',
  secondaryDark: '#C45D25',
  secondaryBg: '#FDF2EB',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
};

export const darkColors = {
  background: '#101512',
  surface: '#1C2620',
  card: '#17201A',
  text: '#F4F6F4',
  textMuted: '#9AA8A0',
  primary: '#3F9A68',
  primaryLight: '#2E7D4E',
  primaryDark: '#D9ECE1',
  primaryBg: '#1F2F26',
  primaryText: '#06170E',
  secondary: '#E77F43',
  secondaryLight: '#F09C6B',
  secondaryDark: '#C45D25',
  secondaryBg: '#FDF2EB',
  border: '#26332C',
  danger: '#F87171',
  success: '#34D399',
};

export type ThemeColors = typeof lightColors;

// Static light palette, kept for call sites that can't use the useTheme() hook
// (e.g. app.json-driven native chrome). Screens/components should prefer useTheme().
export const colors = lightColors;
