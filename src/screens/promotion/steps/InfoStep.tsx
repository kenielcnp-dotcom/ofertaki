import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { MarketSelect } from '../../../components/forms/MarketSelect';
import { DepartmentSelect } from '../../../components/forms/DepartmentSelect';
import { useMarkets } from '../../../hooks/useMarkets';
import { useDepartments } from '../../../hooks/useDepartments';
import { useCreatePromotion } from '../../../hooks/useCreatePromotion';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography, shadows } from '../../../theme/typography';
import { formatPrice } from '../../../utils/formatters';
import type { PromotionImageAnalysis } from '../../../services/ai.service';
import type { PromotionType } from '../../../types/promotion';

type ValidAnalysis = Extract<PromotionImageAnalysis, { valid: true }>;

const TYPE_OPTIONS: { value: PromotionType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'relampago', label: 'Relâmpago', icon: 'flash' },
  { value: 'comum', label: 'Comum', icon: 'cart' },
  { value: 'encarte', label: 'Encarte', icon: 'megaphone' },
];

type Props = {
  imageUri: string;
  analysis: ValidAnalysis;
  onBack: () => void;
  onPublished: () => void;
};

const CONFIDENCE_HIGH = 70;
const POINTS_ON_PUBLISH = 10;

export function InfoStep({ imageUri, analysis, onBack, onPublished }: Props) {
  const { markets } = useMarkets();
  const { departments } = useDepartments();
  const { submit, submitting, error } = useCreatePromotion();

  const [title, setTitle] = useState(analysis.title ?? '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(analysis.price != null ? String(analysis.price).replace('.', ',') : '');
  const [originalPrice, setOriginalPrice] = useState(
    analysis.originalPrice != null ? String(analysis.originalPrice).replace('.', ',') : ''
  );
  const [marketId, setMarketId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [promotionType, setPromotionType] = useState<PromotionType>('comum');
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const priceNumber = Number(price.replace(',', '.'));
  const originalPriceNumber = Number(originalPrice.replace(',', '.'));
  const savings = originalPriceNumber - priceNumber;
  const discount =
    originalPriceNumber > 0 && Number.isFinite(savings) && savings > 0
      ? Math.round((1 - priceNumber / originalPriceNumber) * 100)
      : 0;

  const confidenceTone = analysis.confidence >= CONFIDENCE_HIGH ? 'success' : 'warning';

  async function handleSubmit() {
    const ok = await submit({
      title,
      description: description || undefined,
      price: priceNumber,
      originalPrice: originalPriceNumber,
      marketId: marketId ?? '',
      departmentId: departmentId ?? '',
      imageUri,
      aiAssisted: true,
      aiConfidence: analysis.confidence,
      promotionType,
      validUntil: promotionType === 'encarte' ? validUntil ?? undefined : undefined,
    });

    if (ok) onPublished();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.aiCard, confidenceTone === 'warning' && styles.aiCardWarning]}>
        <View style={[styles.aiIcon, confidenceTone === 'warning' && styles.aiIconWarning]}>
          <Ionicons name="checkmark" size={13} color={colors.textInverse} />
        </View>
        <View style={styles.aiTextWrap}>
          <Text style={[styles.aiLabel, confidenceTone === 'warning' && styles.aiLabelWarning]}>
            IA detectou a etiqueta
          </Text>
          <Text style={styles.aiName} numberOfLines={1}>
            {analysis.title ?? 'Confira os dados abaixo'}
          </Text>
          <Text style={styles.aiSub}>Confira e ajuste se precisar</Text>
        </View>
        <Badge label={`${Math.round(analysis.confidence)}%`} tone={confidenceTone} />
      </View>

      <Text style={styles.fieldLabel}>Tipo de promoção</Text>
      <View style={styles.typeRow}>
        {TYPE_OPTIONS.map((option) => {
          const selected = promotionType === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => setPromotionType(option.value)}
              style={[styles.typeChip, selected && styles.typeChipSelected]}
            >
              <Ionicons name={option.icon} size={15} color={selected ? colors.secondaryText : colors.textMuted} />
              <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {promotionType === 'encarte' ? (
        <View style={styles.dateWrap}>
          <Text style={styles.fieldLabel}>Válido até</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Selecionar data de validade"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateField}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSubtle} />
            <Text style={validUntil ? styles.dateFieldText : styles.dateFieldPlaceholder}>
              {validUntil ? validUntil.toLocaleDateString('pt-BR') : 'Selecione a data'}
            </Text>
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={validUntil ?? new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_event, date) => {
                setShowDatePicker(false);
                if (date) setValidUntil(date);
              }}
            />
          ) : null}
        </View>
      ) : null}

      <Input label="Título" value={title} onChangeText={setTitle} placeholder="Ex: Arroz 5kg" />

      <View style={styles.row}>
        <View style={styles.half}>
          <MarketSelect markets={markets} value={marketId} onChange={setMarketId} />
        </View>
        <View style={styles.half}>
          <DepartmentSelect departments={departments} value={departmentId} onChange={setDepartmentId} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Input
            label="Preço promocional (R$)"
            value={price}
            onChangeText={setPrice}
            placeholder="Ex: 19,90"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.half}>
          <Input
            label="Valor sem promoção (R$)"
            value={originalPrice}
            onChangeText={setOriginalPrice}
            placeholder="Ex: 24,90"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Input
        label="Descrição (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhes da promoção"
        multiline
      />

      {savings > 0 ? (
        <View style={styles.savingsPill}>
          <Ionicons name="pricetag" size={12} color={colors.success} />
          <Text style={styles.savingsText}>
            Você economiza {formatPrice(savings)} · {discount}% OFF
          </Text>
        </View>
      ) : null}

      <View style={styles.previewLabelRow}>
        <Ionicons name="eye-outline" size={13} color={colors.textSubtle} />
        <Text style={styles.previewLabel}>PRÉVIA NO FEED</Text>
      </View>
      <View style={[styles.previewCard, shadows.card]}>
        <View style={styles.previewImageWrap}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          {discount > 0 ? (
            <View style={styles.previewDiscount}>
              <Text style={styles.previewDiscountText}>−{discount}%</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.previewBody}>
          <View style={styles.previewPriceRow}>
            <Text style={styles.previewPrice}>
              {Number.isFinite(priceNumber) && priceNumber > 0 ? formatPrice(priceNumber) : '—'}
            </Text>
            {savings > 0 ? <Text style={styles.previewOldPrice}>{formatPrice(originalPriceNumber)}</Text> : null}
          </View>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {title || 'Título da promoção'}
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button label="Publicar promoção" icon="rocket" loading={submitting} onPress={handleSubmit} />
        <Text style={styles.pointsHint}>
          Ao publicar, você ganha <Text style={styles.pointsHintStrong}>{POINTS_ON_PUBLISH} pontos</Text>!
        </Text>
        <Button label="Voltar" variant="ghost" onPress={onBack} disabled={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  aiCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  aiCardWarning: { backgroundColor: colors.warningBg },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconWarning: { backgroundColor: colors.warning },
  aiTextWrap: { flex: 1 },
  aiLabel: { ...typography.micro, color: colors.success, letterSpacing: 0.4 },
  aiLabelWarning: { color: colors.warning },
  aiName: { ...typography.bodyStrong, color: colors.text, marginTop: 2 },
  aiSub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  fieldLabel: { ...typography.captionStrong, color: colors.text, marginBottom: spacing.xs + 2 },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  typeChipSelected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  typeChipText: { ...typography.captionStrong, color: colors.textMuted },
  typeChipTextSelected: { color: colors.secondaryText },
  dateWrap: { marginBottom: spacing.md },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundAlt,
  },
  dateFieldText: { ...typography.body, color: colors.text },
  dateFieldPlaceholder: { ...typography.body, color: colors.textSubtle },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  savingsText: { ...typography.micro, color: colors.success, fontWeight: '700' },
  previewLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  previewLabel: { ...typography.sectionLabel, color: colors.textSubtle },
  previewCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  previewImageWrap: { position: 'relative' },
  previewImage: { width: '100%', height: 140, backgroundColor: colors.surface },
  previewDiscount: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  previewDiscountText: { ...typography.micro, color: colors.secondaryText, fontWeight: '700' },
  previewBody: { padding: spacing.md },
  previewPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  previewPrice: { ...typography.price, color: colors.text },
  previewOldPrice: { ...typography.caption, color: colors.textSubtle, textDecorationLine: 'line-through' },
  previewTitle: { ...typography.bodyStrong, color: colors.text, marginTop: 2 },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  actions: { gap: spacing.sm, alignItems: 'stretch' },
  pointsHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  pointsHintStrong: { color: colors.secondaryDark, fontWeight: '700' },
});
