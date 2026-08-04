import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/common/Button';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { useAnalyzePromotionImage } from '../../../hooks/useAnalyzePromotionImage';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import type { PromotionImageAnalysis } from '../../../services/ai.service';

type ValidAnalysis = Extract<PromotionImageAnalysis, { valid: true }>;

type Props = {
  onConfirmed: (imageUri: string, analysis: ValidAnalysis) => void;
};

export function PhotoStep({ onConfirmed }: Props) {
  const { uri, base64, picking, error: imageError, takePhoto, pickFromGallery, reset } = useImageUpload();
  const { analyze, analyzing, error: analysisError } = useAnalyzePromotionImage();
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  useEffect(() => {
    if (!uri || !base64) return;
    let cancelled = false;
    setBlockedReason(null);

    (async () => {
      const result = await analyze(base64);
      if (cancelled || !result) return;
      if (result.valid) {
        onConfirmed(uri, result);
      } else {
        setBlockedReason(
          result.reason ?? 'Tire uma foto do produto ou da etiqueta de preço bem de perto, com boa luz.'
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, base64]);

  async function handleTakePhoto() {
    reset();
    setBlockedReason(null);
    await takePhoto();
  }

  async function handlePickFromGallery() {
    reset();
    setBlockedReason(null);
    await pickFromGallery();
  }

  const busy = picking || analyzing;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>Publicar promoção</Text>
      <Text style={styles.subtitle}>
        Tire uma foto do produto ou da etiqueta de preço. A IA confere e já preenche os dados pra você.
      </Text>

      {uri ? (
        <View style={styles.photoFrame}>
          <Image source={{ uri }} style={styles.photo} />
          {analyzing ? (
            <View style={styles.scanOverlay}>
              <View style={styles.scanChip}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.scanChipText}>IA lendo a etiqueta...</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.sourceFrame}>
          <View style={styles.sourceIcon}>
            <Ionicons name="image-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.sourceHint}>Nenhuma foto ainda</Text>
        </View>
      )}

      {blockedReason ? (
        <View style={styles.blockBanner}>
          <View style={styles.blockIcon}>
            <Ionicons name="close" size={13} color={colors.textInverse} />
          </View>
          <View style={styles.blockTextWrap}>
            <Text style={styles.blockTitle}>Não reconhecemos um produto aqui</Text>
            <Text style={styles.blockText}>{blockedReason}</Text>
          </View>
        </View>
      ) : null}

      {imageError || analysisError ? <Text style={styles.errorText}>{imageError ?? analysisError}</Text> : null}

      <View style={styles.actions}>
        <Button
          label={uri ? 'Tirar outra foto' : 'Tirar foto'}
          icon="camera"
          variant="accent"
          loading={busy}
          disabled={busy}
          onPress={handleTakePhoto}
        />
        <Button
          label={uri ? 'Escolher outra foto' : 'Escolher foto'}
          icon="image"
          variant="secondary"
          loading={busy}
          disabled={busy}
          onPress={handlePickFromGallery}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  photoFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  photo: { width: '100%', height: '100%' },
  sourceFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sourceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceHint: { ...typography.caption, color: colors.textSubtle },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  scanChipText: { ...typography.captionStrong, color: colors.primaryDark },
  blockBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  blockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTextWrap: { flex: 1 },
  blockTitle: { ...typography.captionStrong, color: colors.danger },
  blockText: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
