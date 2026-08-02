import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MarketSelect } from '../../components/forms/MarketSelect';
import { useMarkets } from '../../hooks/useMarkets';
import { useCreatePromotion } from '../../hooks/useCreatePromotion';
import { useImageUpload } from '../../hooks/useImageUpload';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Publicar'>;

export function CreatePromotionScreen({ navigation }: Props) {
  const { markets } = useMarkets();
  const {
    uri: imageUri,
    picking,
    error: imageError,
    pickImage,
    reset: resetImage,
  } = useImageUpload();
  const { submit, submitting, error } = useCreatePromotion();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [marketId, setMarketId] = useState<string | null>(null);

  async function handleSubmit() {
    const ok = await submit({
      title,
      description: description || undefined,
      price: Number(price.replace(',', '.')),
      originalPrice: Number(originalPrice.replace(',', '.')),
      marketId: marketId ?? '',
      imageUri: imageUri ?? '',
    });

    if (ok) {
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setMarketId(null);
      resetImage();
      navigation.navigate('Home');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.title}>Publicar promoção</Text>

      <View style={styles.imageSection}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Nenhuma foto tirada ainda</Text>
          </View>
        )}
        <Button
          label={imageUri ? 'Tirar outra foto' : 'Tirar foto'}
          variant="secondary"
          loading={picking}
          onPress={pickImage}
        />
        {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}
      </View>

      <Input label="Título" value={title} onChangeText={setTitle} placeholder="Ex: Arroz 5kg" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhes da promoção"
        multiline
      />
      <Input
        label="Preço (R$)"
        value={price}
        onChangeText={setPrice}
        placeholder="Ex: 19,90"
        keyboardType="decimal-pad"
      />
      <Input
        label="Valor sem promoção (R$)"
        value={originalPrice}
        onChangeText={setOriginalPrice}
        placeholder="Ex: 24,90"
        keyboardType="decimal-pad"
      />
      <MarketSelect markets={markets} value={marketId} onChange={setMarketId} />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button label="Publicar" loading={submitting} onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  imageSection: { marginBottom: spacing.lg, alignItems: 'center' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  placeholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.textMuted },
  errorText: { color: colors.danger, marginBottom: spacing.md },
});
