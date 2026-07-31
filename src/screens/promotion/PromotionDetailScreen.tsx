import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { usePromotionDetail } from '../../hooks/usePromotionDetail';
import { useListaCompras } from '../../hooks/useListaCompras';
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
  const { promotion, loading, comments, hasLiked, hasConfirmed, isAuthor, toggleLike, toggleConfirm, addComment } =
    usePromotionDetail(promotionId);
  const { addItem } = useListaCompras();
  const [commentBody, setCommentBody] = useState('');

  if (loading || !promotion) {
    return <ActivityIndicator style={styles.loading} color={colors.primary} />;
  }

  return (
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
          <Image source={{ uri: promotion.image_url }} style={styles.image} />
          <Text style={typography.title}>{promotion.title}</Text>
          <Text style={styles.price}>{formatPrice(promotion.price)}</Text>
          {promotion.mercados?.name ? <Text style={styles.store}>{promotion.mercados.name}</Text> : null}
          {promotion.description ? <Text style={styles.description}>{promotion.description}</Text> : null}

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  loading: { flex: 1 },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: spacing.md, backgroundColor: colors.surface },
  price: { color: colors.primary, fontWeight: '700', fontSize: 20, marginTop: spacing.xs },
  store: { color: colors.textMuted, marginTop: spacing.xs },
  description: { marginTop: spacing.md, color: colors.text },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  commentsTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  comment: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentBody: { color: colors.text },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  commentForm: { marginTop: spacing.md },
});
