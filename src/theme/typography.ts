export const fonts = {
  display: {
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
    extrabold: 'Outfit_800ExtraBold',
  },
  sans: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semibold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold',
  },
};

export const typography = {
  title: {
    fontSize: 24,
    fontFamily: fonts.display.bold,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: fonts.display.semibold,
    letterSpacing: -0.15,
  },
  body: {
    fontSize: 15,
    fontFamily: fonts.sans.regular,
  },
  caption: {
    fontSize: 13,
    fontFamily: fonts.sans.regular,
  },
};
