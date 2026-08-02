# Problemas Conhecidos

> Bugs, dívidas técnicas e limitações conhecidas que ainda não foram
> resolvidas. Ao corrigir, mover a entrada para `changelog.md`. Features
> planejadas (não problemas) ficam em `roadmap.md`.

Formato por entrada:

```
## [AAAA-MM-DD] Título curto
**Sintoma**: o que acontece.
**Impacto**: quem/o que é afetado.
**Status**: em aberto | investigando | bloqueado por X.
```

---

## `RECORD_AUDIO` sempre presente no build final, mesmo sem estar no `app.json`

**Sintoma**: tanto `eas build:configure` quanto `eas update:configure`
"reintroduziram" `android.permissions: ["RECORD_AUDIO"]` no `app.json` em
sessões anteriores — sempre removido manualmente. Mas mesmo com o `app.json`
limpo (confirmado, sem esse array), `npx expo config --json` mostra
`android.permissions` com `RECORD_AUDIO` mesmo assim.

**Causa raiz confirmada (2026-08-02)**: não vem do `app.json` nem de nenhum
comando do EAS CLI "reinjetando" nada — é o **plugin do `expo-image-picker`**
(`node_modules/expo-image-picker/plugin/src/withImagePicker.ts`), que pede
`RECORD_AUDIO` por padrão (suporte a gravar vídeo) a menos que
`microphonePermission: false` seja passado explicitamente na config do
plugin em `app.json`. As "correções" anteriores nunca resolviam de verdade —
só escondiam do `app.json`, mas o config resolvido (o que realmente vai pro
build) continuava incluindo.

**Impacto**: nenhuma função do app usa áudio/microfone; a permissão pedida
sem uso real pode levantar bandeira em revisão de loja (Play Store).

**Status**: causa raiz confirmada, correção **ainda não aplicada** —
depende de novo build nativo (não dá pra OTA). Fix: adicionar
`microphonePermission: false` na config do plugin `expo-image-picker` em
`app.json`.

---

## Vulnerabilidades do `npm audit` em ferramental de build

**Sintoma**: 12 vulnerabilidades (10 moderate / 2 high) reportadas pelo
`npm audit`.

**Impacto**: todas são transitivas do ferramental de build do Expo (via
`xcode` / `@expo/config-plugins`) — **não** em código que roda no app
publicado.

**Status**: em aberto por decisão consciente. Corrigir exigiria
`npm audit fix --force`, que pula para o Expo SDK 57 — mudança grande demais
para o momento.

---

## Contraste de cor não auditado

**Sintoma**: a paleta não passou por auditoria formal de contraste (WCAG AA).
Combinações de texto secundário sobre superfícies claras são as mais suspeitas.

**Impacto**: acessibilidade — legibilidade para usuários com baixa visão.

**Status**: em aberto, anotado para o time de design (ficou fora da Fase 6
parte 1 por decisão do usuário).

---

## "Leaked password protection" desabilitado no Supabase

**Sintoma**: a checagem de senha vazada (HaveIBeenPwned) do Supabase Auth não
está ativa; a API retorna 402 ao tentar habilitar.

**Impacto**: usuários conseguem cadastrar senhas sabidamente vazadas.

**Status**: bloqueado por plano — exige Supabase Pro. Ver `roadmap.md`.

---

## Reset de senha sem retorno ao app

**Sintoma**: o link de redefinição abre no navegador; depois de trocar a senha,
o usuário precisa voltar ao app e logar manualmente.

**Impacto**: fricção no fluxo de recuperação de conta. Funcional, mas não é o
fluxo esperado.

**Status**: em aberto — depende de scheme/deep linking entrar em escopo
(ver `roadmap.md`).
