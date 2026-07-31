import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MarketSelect } from '../../components/forms/MarketSelect';
import { useMarkets } from '../../hooks/useMarkets';
import { useCreatePromotion } from '../../hooks/useCreatePromotion';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Publicar'>;

export function CreatePromotionScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { markets } = useMarkets();
  const { uri: imageUri, picking, pickImage, reset: resetImage } = useImageUpload();
  const { submit, submitting, error } = useCreatePromotion();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [marketId, setMarketId] = useState<string | null>(null);

  async function handleSubmit() {
    const ok = await submit({
      title,
      description: description || undefined,
      price: Number(price.replace(',', '.')),
      marketId: marketId ?? '',
      imageUri: imageUri ?? '',
    });

    if (ok) {
      setTitle('');
      setDescription('');
      setPrice('');
      setMarketId(null);
      resetImage();
      navigation.navigate('Home');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[typography.title, styles.title]}>Publicar promoção</Text>

      <View style={styles.imageSection}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Nenhuma foto selecionada</Text>
          </View>
        )}
        <Button
          label={imageUri ? 'Trocar foto' : 'Selecionar foto'}
          variant="secondary"
          loading={picking}
          onPress={pickImage}
        />
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
      <MarketSelect markets={markets} value={marketId} onChange={setMarketId} />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button label="Publicar" loading={submitting} onPress={handleSubmit} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    title: { color: colors.text },
    imageSection: { marginBottom: spacing.lg, alignItems: 'center' },
    preview: {
      width: '100%',
      height: 200,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
    },
    placeholder: {
      width: '100%',
      height: 200,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: { color: colors.textMuted },
    errorText: { color: colors.danger, marginBottom: spacing.md },
  });
