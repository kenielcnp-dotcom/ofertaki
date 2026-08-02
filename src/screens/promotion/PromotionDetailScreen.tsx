import { Fragment, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { ReportModal } from '../../components/promotion/ReportModal';
import { StarRating } from '../../components/promotion/StarRating';
import { usePromotionDetail } from '../../hooks/usePromotionDetail';
import { useListaCompras } from '../../hooks/useListaCompras';
import { useReportPromotion } from '../../hooks/useReportPromotion';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PromotionDetail'>;

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PromotionDetailScreen({ route }: Props) {
  const { promotionId } = route.params;
  const {
    promotion,
    loading,
    isError,
    refetch,
    comments,
    hasLiked,
    hasConfirmed,
    userRating,
    isAuthor,
    toggleLike,
    toggleConfirm,
    rate,
    addComment,
  } = usePromotionDetail(promotionId);
  const { addItem } = useListaCompras();
  const [commentBody, setCommentBody] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const { submit: submitReport, submitting: reportSubmitting, error: reportError } =
    useReportPromotion(promotionId);

  if (loading) {
    return (
      <View style={styles.content}>
        <Skeleton height={220} borderRadius={12} style={styles.skeletonImage} />
        <Skeleton height={24} width="70%" style={styles.skeletonLine} />
        <Skeleton height={20} width="30%" style={styles.skeletonLine} />
      </View>
    );
  }

  if (isError || !promotion) {
    return <ErrorState message="Não foi possível carregar essa promoção." onRetry={refetch} />;
  }

  return (
    <Fragment>
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.comment}>
          <Text style={styles.commentBody}>{item.body}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View>
          <Image
            source={{ uri: promotion.image_url }}
            style={styles.image}
            accessible
            accessibilityLabel={`Foto de ${promotion.title}`}
          />
          <Text style={typography.title}>{promotion.title}</Text>
          <Text style={styles.price}>{formatPrice(promotion.price)}</Text>
          {promotion.mercados?.name ? <Text style={styles.store}>{promotion.mercados.name}</Text> : null}
          {promotion.description ? <Text style={styles.description}>{promotion.description}</Text> : null}

          <View style={styles.ratingBlock}>
            <StarRating
              value={promotion.avg_rating}
              count={promotion.ratings_count}
              size={20}
            />
            {!isAuthor ? (
              <View style={styles.myRating}>
                <Text style={styles.myRatingLabel}>
                  {userRating ? 'Sua nota:' : 'Avaliar:'}
                </Text>
                <StarRating value={userRating} size={22} onRate={(score) => rate.mutate(score)} />
              </View>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <Button
              label={hasLiked ? `Curtido (${promotion.likes_count})` : `Curtir (${promotion.likes_count})`}
              variant={hasLiked ? 'primary' : 'secondary'}
              disabled={isAuthor}
              loading={toggleLike.isPending}
              onPress={() => toggleLike.mutate()}
            />
            <Button
              label={
                hasConfirmed
                  ? `Confirmado (${promotion.confirmations_count})`
                  : `Confirmar (${promotion.confirmations_count})`
              }
              variant={hasConfirmed ? 'primary' : 'secondary'}
              disabled={isAuthor}
              loading={toggleConfirm.isPending}
              onPress={() => toggleConfirm.mutate()}
            />
          </View>

          <Button
            label="Adicionar à Lista"
            variant="secondary"
            loading={addItem.isPending}
            onPress={() => addItem.mutate(promotion.id)}
          />

          {!isAuthor ? (
            <Pressable onPress={() => setReportModalVisible(true)} style={styles.reportLink}>
              <Text style={styles.reportLinkText}>Denunciar promoção</Text>
            </Pressable>
          ) : null}

          <Text style={[typography.subtitle, styles.commentsTitle]}>Comentários</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Nenhum comentário ainda.</Text>}
      ListFooterComponent={
        <View style={styles.commentForm}>
          <Input
            label="Comentar"
            value={commentBody}
            onChangeText={setCommentBody}
            placeholder="Escreva um comentário"
          />
          <Button
            label="Enviar"
            loading={addComment.isPending}
            onPress={() => {
              if (commentBody.trim()) {
                addComment.mutate(commentBody.trim(), { onSuccess: () => setCommentBody('') });
              }
            }}
          />
        </View>
      }
    />
    <ReportModal
      visible={reportModalVisible}
      onClose={() => setReportModalVisible(false)}
      submitting={reportSubmitting}
      error={reportError}
      onSubmit={async (reason, details) => {
        const ok = await submitReport(reason, details || undefined);
        if (ok) setReportModalVisible(false);
      }}
    />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  skeletonImage: { marginBottom: spacing.md },
  skeletonLine: { marginBottom: spacing.sm },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: spacing.md, backgroundColor: colors.surface },
  price: { color: colors.primary, fontWeight: '700', fontSize: 20, marginTop: spacing.xs },
  store: { color: colors.textMuted, marginTop: spacing.xs },
  description: { marginTop: spacing.md, color: colors.text },
  ratingBlock: { marginTop: spacing.md, gap: spacing.xs },
  myRating: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  myRatingLabel: { color: colors.textMuted, fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  commentsTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  comment: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentBody: { color: colors.text },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  commentForm: { marginTop: spacing.md },
  reportLink: { marginTop: spacing.md, alignItems: 'center' },
  reportLinkText: { color: colors.danger, fontSize: 13 },
});
