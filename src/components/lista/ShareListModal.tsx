import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UseMutationResult } from '@tanstack/react-query';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import type { ListaMembroWithProfile } from '../../types/lista';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentUserId: string | undefined;
  members: ListaMembroWithProfile[];
  loadingMembers: boolean;
  isDono: boolean;
  code: string | undefined;
  loadingCode: boolean;
  regenerateCode: UseMutationResult<string, Error, void>;
  removeMember: UseMutationResult<void, Error, string>;
  redeemCode: UseMutationResult<string, Error, string>;
};

function formatCode(code: string) {
  return code.match(/.{1,2}/g)?.join(' ') ?? code;
}

export function ShareListModal({
  visible,
  onClose,
  currentUserId,
  members,
  loadingMembers,
  isDono,
  code,
  loadingCode,
  regenerateCode,
  removeMember,
  redeemCode,
}: Props) {
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (visible) {
      setJoinCode('');
      redeemCode.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function handleShare() {
    if (!code) return;
    Share.share({
      message: `Entra na minha lista de compras no Ofertaki! Código: ${code}`,
    });
  }

  function handleRegenerate() {
    Alert.alert(
      'Gerar novo código?',
      'O código atual deixa de funcionar para quem ainda não entrou.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Gerar novo', style: 'destructive', onPress: () => regenerateCode.mutate() },
      ]
    );
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    redeemCode.mutate(joinCode.trim(), {
      onSuccess: () => {
        setJoinCode('');
        onClose();
      },
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>Compartilhar lista</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Membros{members.length ? ` (${members.length})` : ''}</Text>
          {loadingMembers ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            members.map((member) => {
              const isSelf = member.user_id === currentUserId;
              const name = isSelf ? 'Você' : member.profiles?.username ?? 'Usuário';
              const initial = (member.profiles?.username ?? '?')[0]?.toUpperCase() ?? '?';
              return (
                <View key={member.id} style={styles.memberRow}>
                  <View style={[styles.avatar, isSelf ? styles.avatarSelf : styles.avatarOther]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{name}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === 'dono' ? 'dono da lista' : 'entrou com o código'}
                    </Text>
                  </View>
                  {isDono && member.role === 'convidado' ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${name} da lista`}
                      onPress={() => removeMember.mutate(member.id)}
                      hitSlop={8}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close" size={14} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}

          {isDono ? (
            <>
              <Text style={styles.sectionLabel}>Convidar mais gente</Text>
              {loadingCode ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : code ? (
                <>
                  <View style={styles.codePill}>
                    <Text style={styles.codeText}>{formatCode(code)}</Text>
                  </View>
                  <Button
                    label="Compartilhar código"
                    icon="share-social-outline"
                    variant="accent"
                    size="sm"
                    onPress={handleShare}
                    style={styles.shareButton}
                  />
                  <Pressable onPress={handleRegenerate} hitSlop={8}>
                    <Text style={styles.regenText}>
                      {regenerateCode.isPending ? 'Gerando novo código...' : 'Gerar novo código'}
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </>
          ) : null}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.sectionLabel}>Entrar com um código</Text>
          <View style={styles.joinRow}>
            <TextInput
              accessibilityLabel="Código de convite"
              placeholder="Ex: K7XQ2P"
              placeholderTextColor={colors.textSubtle}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={styles.joinInput}
            />
            <Button
              label="Entrar"
              size="sm"
              fullWidth={false}
              loading={redeemCode.isPending}
              disabled={!joinCode.trim()}
              onPress={handleJoin}
            />
          </View>
          {redeemCode.isError ? <Text style={styles.errorText}>{redeemCode.error.message}</Text> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { ...typography.subtitle, color: colors.text },
  sectionLabel: {
    ...typography.captionStrong,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  loader: { marginVertical: spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarSelf: { backgroundColor: colors.secondary },
  avatarOther: { backgroundColor: colors.primaryLight },
  avatarText: { ...typography.captionStrong, color: colors.textInverse },
  memberInfo: { flex: 1 },
  memberName: { ...typography.bodyStrong, color: colors.text },
  memberRole: { ...typography.caption, color: colors.textSubtle, marginTop: 1 },
  removeButton: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codePill: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  codeText: {
    ...typography.title,
    color: colors.primaryDark,
    letterSpacing: 2,
  },
  shareButton: { marginTop: spacing.sm },
  regenText: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    ...typography.micro,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  joinRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  joinInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    ...typography.body,
    color: colors.text,
    letterSpacing: 1,
  },
  errorText: { ...typography.micro, color: colors.danger, marginTop: spacing.xs },
});
