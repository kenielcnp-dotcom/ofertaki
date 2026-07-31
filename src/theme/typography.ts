import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// Fontes carregadas em App.tsx via expo-google-fonts.
// Outfit = títulos / números de preço. DM Sans = texto de interface.
export const fonts = {
  displayBold: 'Outfit_700Bold',
  displaySemi: 'Outfit_600SemiBold',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  title: { fontFamily: fonts.displayBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 24 },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14 },
  price: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 26, letterSpacing: -0.4 },
  priceLarge: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  button: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

// Sombras suaves — iOS usa shadow*, Android usa elevation.
function shadow(y: number, blur: number, opacity: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F331E',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadows = {
  card: shadow(4, 12, 0.07, 2),
  raised: shadow(8, 18, 0.12, 6),
  floating: shadow(10, 22, 0.2, 10),
};
