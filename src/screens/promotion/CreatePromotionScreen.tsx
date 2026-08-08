import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stepper, type StepperStep } from '../../components/common/Stepper';
import { PhotoStep } from './steps/PhotoStep';
import { InfoStep } from './steps/InfoStep';
import { PublishStep } from './steps/PublishStep';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { MainTabScreenProps } from '../../navigation/types';
import type { PromotionImageAnalysis } from '../../services/ai.service';

type Props = MainTabScreenProps<'Publicar'>;

type ValidAnalysis = Extract<PromotionImageAnalysis, { valid: true }>;

const STEPS: StepperStep[] = [
  { key: 'foto', label: 'Foto' },
  { key: 'info', label: 'Info' },
  { key: 'publicar', label: 'Publicar' },
];

export function CreatePromotionScreen({ navigation }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ValidAnalysis | null>(null);

  function handlePhotoConfirmed(uri: string, result: ValidAnalysis) {
    setImageUri(uri);
    setAnalysis(result);
    setStepIndex(1);
  }

  function handleReset() {
    setImageUri(null);
    setAnalysis(null);
    setStepIndex(0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Stepper steps={STEPS} currentIndex={stepIndex} />
      </View>

      {stepIndex === 0 || !imageUri || !analysis ? (
        <PhotoStep onConfirmed={handlePhotoConfirmed} />
      ) : stepIndex === 1 ? (
        <InfoStep
          imageUri={imageUri}
          analysis={analysis}
          onBack={() => setStepIndex(0)}
          onPublished={() => setStepIndex(2)}
          onDuplicateConfirmed={() => {
            handleReset();
            navigation.navigate('Home');
          }}
        />
      ) : (
        <PublishStep
          onViewFeed={() => {
            handleReset();
            navigation.navigate('Home');
          }}
          onPublishAnother={handleReset}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
