import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  ring?: boolean;
};

export function Avatar({ uri, name, size = 44, ring = false }: AvatarProps) {
  const base = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const ringStyle = ring ? { borderWidth: 2, borderColor: colors.background } : null;

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, base, ringStyle]} accessibilityElementsHidden />;
  }

  const letter = (name?.trim()?.[0] ?? '?').toUpperCase();
  return (
    <View style={[styles.fallback, base, ringStyle]}>
      <Text style={[styles.letter, { fontSize: size * 0.4 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surface },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: fonts.displayBold, color: colors.primaryText },
});
