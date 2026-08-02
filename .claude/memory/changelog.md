# Changelog Técnico

> Histórico de mudanças relevantes no projeto. Formato: mais recente no topo.
> O detalhe de cada decisão fica em `decisions.md`.

## [2026-08-02] Ícones da status bar ilegíveis sobre o header verde da Home

- `App.tsx` fixava `<StatusBar style="dark" />` globalmente; a Home usa
  `ScreenHeader` com `tone="brand"` (fundo verde escuro), então ícones
  escuros da status bar ficavam ilegíveis por cima do header — não era bug
  de overlap/espaçamento (o `insets.top` já era somado corretamente), era
  falta de contraste.
- `ScreenHeader` agora renderiza `<StatusBar style={isBrand ? 'light' :
  'dark'} />` (de `expo-status-bar`) internamente, só quando a tela está em
  foco (`useIsFocused`, de `@react-navigation/native`) — evita que uma tela
  `brand` montada em background numa tab troque o estilo global enquanto
  outra tela está em foco. `App.tsx` continua com `style="dark"` como
  padrão para as demais telas (fundo claro).
- Mudança só de JS — publicada via `eas update`, sem precisar de build novo.

## [2026-08-01] Env vars do Supabase configuradas no EAS

- `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` criadas via
  `eas env:set` (o `.env` local não sobe pro build na nuvem) nos três
  ambientes (`development`, `preview`, `production`), visibilidade
  `plaintext`. Confirmado com `eas env:list`.

## [2026-08-02] Logo real no ícone do app

- `assets/icon.png` e `assets/android-icon-foreground.png` trocados pela logo
  real (`assets/logo.png`, a mesma da `WelcomeScreen`) — antes eram o ícone
  placeholder padrão do template Expo (seta azul).
- `android.adaptiveIcon.backgroundColor` virou o verde da marca (`#1A5331`);
  removidas as referências a `backgroundImage`/`monochromeImage` (ainda
  placeholder genérico, não fazia sentido manter referenciadas). Pendência
  registrada em `roadmap.md`.

## [2026-08-01] EAS Update configurado (OTA)

- `expo-updates` instalado; `eas update:configure` rodado —
  `app.json` ganhou `updates.url` + `runtimeVersion` (`policy: "appVersion"`),
  `eas.json` ganhou `channel` em cada perfil de build
  (`development`/`preview`/`production`).
- Publicar update: `eas update --channel <canal> --message "..."` — atualiza
  builds já instalados sem gerar `.apk`/`.ipa` novo (só para mudanças de
  JS/assets; mudança nativa continua exigindo `eas build`).
- O comando reintroduziu `android.permissions: RECORD_AUDIO` de novo
  (duplicado); removido. Ver `known-issues.md`.
- **Builds gerados antes desta configuração** (o APK de `preview` de mais
  cedo) não recebem OTA — precisam ser substituídos por um build novo.

## [2026-08-01] Valor sem promoção + painel de economia mensal

- Migration `0016`: `promotions.original_price` (obrigatório, `check
  (original_price >= price)`, com backfill das linhas existentes) e
  `lista_compras.purchased_at` (mantido por trigger, zera ao desmarcar
  "comprado", `now()` ao marcar).
- `CreatePromotionScreen`: novo campo "Valor sem promoção (R$)"; validação
  bloqueia se for menor que o preço.
- `ListaScreen`: novo `SavingsPanel` no topo, com o total economizado no mês
  (soma de `original_price - price` das promoções compradas) e a contagem —
  calculado em memória em `useListaCompras` a partir dos dados já buscados,
  sem query nova.

## [2026-08-01] Projeto EAS criado

- `eas login` + `eas build:configure` rodados: `extra.eas.projectId` e `owner`
  (`kenieldotcoms-team`, conta de time) adicionados ao `app.json`. `slug`
  mudou de `ofertaki-app` para `ofertaki` (confirmado pelo usuário).
- O fluxo também adicionou `android.permissions: ["RECORD_AUDIO"]` sem motivo
  — nada no app usa áudio/microfone. Removido; ver `decisions.md`.

## [2026-08-01] Base de conhecimento Claude Code (essencial) adicionada ao repo

- Adicionados `CLAUDE.md` + `.claude/memory/` + `.claude/docs/` + `.claude/skills/`
  ao repositório, adaptados a partir de uma base mais ampla que incluía também
  `agents/`, `prompts/`, `templates/` e `hooks/` — deixados de fora por decisão
  do usuário (ver `decisions.md`).

## [2026-08-01] Publicar: câmera direto em vez de galeria

- `useImageUpload`/`CreatePromotionScreen`: o botão de foto agora abre a
  **câmera direto** (`launchCameraAsync`/`requestCameraPermissionsAsync`) em
  vez da galeria (`launchImageLibraryAsync`) — mais rápido para o caso de uso
  típico (fotografar a promoção na hora, no corredor do mercado).
- `useImageUpload` também passou a expor um `error` e mostrá-lo na tela: antes,
  permissão de câmera negada (ou bloqueada permanentemente) falhava em
  silêncio — o botão "Tirar foto" parecia simplesmente não fazer nada.

## [2026-08-01] `test.design-local` assume como branch do app

- A branch `test.design-local` passou a ser a branch default do repositório e a
  única que sustenta o app real; a `main` foi considerada obsoleta.
- Documentação ajustada para refletir isso — deixou de existir a pendência de
  "trazer o design para a `main`".

## [Fase 6, parte 1] Erro/retry, skeleton, acessibilidade, revisão de RLS

- Feed, Detalhe, Lista e Notificações passaram a mostrar `ErrorState` com
  "Tentar novamente" em vez de carregar para sempre quando a query falha.
- `ActivityIndicator` solto trocado por skeleton loaders (`Skeleton`,
  `PromotionCardSkeleton`) em Feed, Detalhe, Lista, Notificações e Ranking.
- Acessibilidade: fotos de promoção ocultas/rotuladas corretamente para leitor
  de tela; alvos de toque pequenos (checkbox da Lista, motivos de denúncia)
  ganharam `hitSlop`/`minHeight`.
- Revisão de RLS nas 14 migrations achou 1 gap real: `promotions.status` era
  editável pelo autor — dava para reverter uma remoção automática por denúncia.
  Corrigido com `REVOKE UPDATE (status)` (migration `0014`).

## [Segurança] Correções do Database Linter do Supabase

- `adjust_promotion_counter` era `SECURITY DEFINER`, chamável via
  `/rest/v1/rpc`, e aceitava o nome da coluna como texto livre — permitia
  reescrever qualquer coluna de `promotions` (inclusive `price`) por fora da
  RLS. Corrigido com whitelist + `REVOKE EXECUTE` (migration `0013`).
- `REVOKE EXECUTE` nas demais funções `SECURITY DEFINER` de uso interno;
  `set_updated_at` com `search_path` fixo; policy de listagem pública do bucket
  `promotion-images` removida.

## [Fase 5] Notificações, busca e denúncia

- Migrations `0011` e `0012`. `notifications` gerada por trigger; tela real com
  Realtime, marcar como lida / marcar todas.
- Busca da Home trocou `ilike` por full-text (`tsvector` + índice GIN,
  `websearch` em português).
- `reports` com motivo (expirada/falsa/preço errado/impróprio/outro); ao atingir
  5 denúncias de usuários diferentes a promoção vira `status = 'removed'`
  automaticamente.

## [Fase 4] Gamificação e ranking

- `points_ledger` (+10 publicar, +2 curtida recebida, +1 confirmação recebida) e
  `profiles.reputation_score` sincronizado via trigger, protegido por `REVOKE`.
- RPC `get_monthly_ranking`: Top 50 do mês + posição do usuário fora do Top 50.
  `RankingScreen` com medalhas ouro/prata/bronze, acessível pelo Perfil.
- Lista de compras ganhou itens de texto livre (`lista_compras.promotion_id`
  virou opcional).

## [Mercados] Campo "Loja" normalizado

- Migrations `0007`/`0008`: tabela `mercados`, `promotions.market_id`. Campo
  "Loja" virou dropdown (`MarketSelect`); categoria "Mercado" atribuída
  automaticamente. Seed: Carrefour, Extra, Assaí, Pão de Açúcar, Dia.

## [Fases 2 e 3] Promoções, interações sociais e lista de compras

- Migrations `0003`–`0006` (promoções + bucket `promotion-images`).
- Contadores protegidos por `REVOKE` de coluna; RLS bloqueia auto-curtida e
  auto-confirmação.
- Hotbar realinhada para Home · Lista · Publicar · Alertas · Perfil; busca virou
  parte da Home; Ranking virou link no Perfil.
- Telas novas: `PromotionDetailScreen`, `ListaScreen`, `CreatePromotionScreen`,
  `NotificationsScreen`. `SearchScreen` antiga removida.

## [Fases 0 e 1] Setup e autenticação

- Projeto Expo criado, Supabase linkado, migrations `0001`/`0002` aplicadas.
- Auth completo: signup/login/logout/reset de senha; trigger `handle_new_user`
  cria o perfil automaticamente; sessão persistida via AsyncStorage.
