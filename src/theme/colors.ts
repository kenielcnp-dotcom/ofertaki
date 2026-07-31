// Paleta Ofertaki — verde "feira" + laranja "etiqueta de preço".
// Identidade mantida (primary #1A5331 / secondary #E77F43), apenas refinada
// com tons de superfície e estados para dar hierarquia às telas.
export const colors = {
  // Superfícies
  background: '#FFFFFF',
  backgroundAlt: '#F7F8F7',
  surface: '#F5F6F8',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(15, 51, 30, 0.45)',

  // Texto
  text: '#1A1D1F',
  textMuted: '#6B7280',
  textSubtle: '#9AA3AE',
  textInverse: '#FFFFFF',

  // Marca — verde
  primary: '#1A5331',
  primaryLight: '#2E7D4E',
  primaryDark: '#0F331E',
  primaryBg: '#EAF4EE',
  primaryText: '#FFFFFF',

  // Marca — laranja (destaque de preço / CTA secundário)
  secondary: '#E77F43',
  secondaryLight: '#F09C6B',
  secondaryDark: '#C45D25',
  secondaryBg: '#FDF2EB',
  secondaryText: '#FFFFFF',

  // Linhas
  border: '#E5E7EB',
  borderStrong: '#D3D8DE',

  // Estado
  danger: '#EF4444',
  dangerBg: '#FEECEC',
  success: '#10B981',
  successBg: '#E7F8F1',
  warning: '#F59E0B',
  warningBg: '#FEF4E2',

  // Ranking
  gold: '#E0B106',
  silver: '#9CA3AF',
  bronze: '#B0703C',
} as const;

export type ColorName = keyof typeof colors;
