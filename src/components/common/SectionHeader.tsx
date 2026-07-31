import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type SectionHeaderProps = {
  title: string;
  caption?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, caption, right, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  texts: { flex: 1 },
  title: { ...typography.subtitle, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
