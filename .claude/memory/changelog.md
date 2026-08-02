# Changelog Técnico

> Histórico de mudanças relevantes no projeto. Formato: mais recente no topo.
> O detalhe de cada decisão fica em `decisions.md`.

## [2026-08-02] Fase 6 (parte 2): testes automatizados (Jest + RNTL)

- Infra: `jest-expo` ~54.0.17 + `jest` ~29.7.0 + `@testing-library/react-native` ^14.0.1
  (devDependencies), preset `jest-expo` + `transformIgnorePatterns` no
  `package.json`, script `npm test`, `"types": ["jest"]` no `tsconfig.json`.
- `expo-asset` virou dependência direta (`~12.0.13`): o `expo-font` (hoisted)
  não conseguia resolvê-lo no Jest — o pacote estava aninhado em
  `node_modules/expo/node_modules/`. `expo install expo-asset` também
  registrou o plugin no `app.json` (padrão do comando, inofensivo).
- **RNTL v14 mudou a API**: `render` e `fireEvent` são **assíncronos**
  (retornam Promise) — os testes precisam `await render(...)` /
  `await fireEvent.press(...)`. Ver `decisions.md`.
- 28 testes em 4 suítes: `promotionInsights`, `formatters`, `validation`
  (utilidades puras, com `jest.useFakeTimers()` pra controlar `Date.now()`) e
  `StarRating` (componente, modos leitura e interativo).
- **Bug real encontrado pelo teste**: `formatRelativeTime` produzia "há 2
  mêses" (plural errado de "mês" — o código anexava "es" a "mês"). Corrigido
  para `há ${months} ${months === 1 ? 'mês' : 'meses'}`.
- `npx tsc --noEmit` limpo. Detox/Maestro continua como possibilidade futura
  (ver `roadmap.md`).

## [2026-08-02] Permissão RECORD_AUDIO removida de vez do build

- Causa raiz (confirmada em `known-issues.md`): o plugin do `expo-image-picker`
  pedia `RECORD_AUDIO` por padrão a menos que `microphonePermission: false`
  fosse passado na config — correções anteriores só escondiam do `app.json`,
  mas o config resolvido (o que vai pro build) continuava incluindo.
- `app.json`: adicionado `microphonePermission: false` à config do plugin
  `expo-image-picker` (ao lado de `photosPermission`/`cameraPermission`).
- Verificado com `npx expo config --json`: `android.permissions` deixou de
  existir no config resolvido (antes continha `RECORD_AUDIO`). `expo-doctor`
  passa 18/18 checks.
- **Observação**: para valer de verdade precisa de um novo build nativo (não
  dá pra OTA). Sem `eas build`/`eas update` disparado — a pedido do usuário.

## [2026-08-02] Lista de compras compartilhável por código

- Precedido de uma prévia (Artifact) validando a ideia antes de qualquer
  código — decisões tomadas: economia continua individual, convite por
  código (não busca de usuário), qualquer convidado edita de verdade.
- Migration `0019`: tabelas `listas`, `lista_membros` (`role` dono/convidado,
  `unique (user_id)` — uma lista por usuário por vez), `lista_convites`
  (código de 6 caracteres, sem RLS de leitura pro client). `lista_compras`
  ganhou `lista_id` (substitui `user_id` como escopo de posse — `user_id`
  passa a significar "quem adicionou") e `purchased_by` (quem marcou como
  comprado, pra manter a economia individual). `REPLICA IDENTITY FULL` pra
  Realtime enxergar `lista_id` em eventos de `DELETE`.
- RPCs novas (`SECURITY DEFINER`, `GRANT` só pra `authenticated`):
  `get_or_create_my_lista`, `get_or_create_lista_convite`,
  `regenerate_lista_convite`, `redeem_lista_convite` — a última bloqueia a
  troca de lista se a atual do usuário já tem itens/outras pessoas.
- `listas.service.ts` (novo), `lista_compras.service.ts` estendido
  (`added_by`/`purchased_by_profile` via join com `profiles`),
  `useListaCompartilhada.ts` (novo hook: membros, código, entrar/remover),
  `useListaCompras.ts` resolve `listaId` primeiro e assina Realtime por
  `lista_id` (mesmo padrão de sufixo aleatório de `notifications.service.ts`).
- `ShareListModal.tsx` (novo componente, mesmo padrão de bottom sheet do
  `FilterModal`) e `ListaScreen` com botão "pessoas" no cabeçalho + bolinha
  de contagem de membros + atribuição por item ("adicionado por"/"comprado
  por"). Compartilhamento do código usa `Share` nativo do RN — sem
  `expo-clipboard` nem nenhuma lib nova (mudança continua OTA-atualizável).
- Testado ponta-a-ponta com dois usuários reais via Playwright (dois
  `BrowserContext`): item de A aparece pra B após o código, compra de B
  chega em A por Realtime, painel de economia de A não conta a compra de B.
- Doc: `.claude/docs/database.md`, `screens.md`, `components.md`,
  `api.md`, `app-overview.md`.

## [2026-08-02] App fechava ao abrir Notificações

- **Sintoma**: abrir a tela de Alertas fechava o app. Causa: o sino novo no
  header da Home (feature anterior) chama `useNotifications()` pra saber se
  há notificação não lida; a tela de Alertas chama o mesmo hook. Como as
  duas telas ficam montadas ao mesmo tempo (abas), as duas tentavam abrir uma
  inscrição Realtime do Supabase com o **mesmo nome de canal**
  (`notifications:${userId}`) — colisão.
- `notifications.service.ts`: `subscribeToNewNotifications` agora gera um
  sufixo aleatório por chamada (`notifications:${userId}:${uniqueId}`), então
  múltiplas telas podem se inscrever ao mesmo tempo sem colidir.
- Publicado via `eas update` (mudança só de JS).

## [2026-08-02] Barra de navegação do Android sobrepondo a BottomTabBar

- `src/navigation/MainTabs.tsx`: `tabBarStyle` tinha altura/`paddingBottom`
  fixos por plataforma e nunca somava `useSafeAreaInsets().bottom` — em
  Android com navegação gestual (edge-to-edge, padrão do Expo SDK 54), a
  barra de sistema ficava por cima do conteúdo da tab bar. Corrigido:
  altura de conteúdo fixa (`TAB_BAR_CONTENT_HEIGHT = 60`) + `insets.bottom`
  somado à altura e ao `paddingBottom`, mesmo padrão já usado em
  `ScreenHeader.tsx`/`WelcomeScreen.tsx`.
- Diagnóstico inicial veio de fora (ChatGPT) sugerindo Expo Router
  (`app/_layout.tsx`) — não se aplica a este projeto (React Navigation
  direto); a causa raiz real (safe area) estava certa, só a localização não.
- Publicado via `eas update --channel preview` (mudança só de JS).

## [2026-08-02] Cabeçalho da Home: logotipo, sino/perfil, filtro e departamentos

- Migration `0018`: tabela `departments` (Alimentos, Bebidas, Higiene,
  Limpeza, Açougue, Hortifruti) + `promotions.department_id` (nullable) —
  eixo diferente de `categories`, ver `decisions.md`.
- `CreatePromotionScreen`: novo campo obrigatório "Departamento"
  (`DepartmentSelect`, mesmo padrão do `MarketSelect`).
- `FeedScreen`: logotipo bicolor ("Ofert" branco + "aki" laranja via
  `ScreenHeader`'s nova prop `titleNode`); `DepartmentChips` filtra a Home
  por departamento; botão de filtro (funil) abre `FilterModal` — filtra por
  mercado e ordena por mais recente/mais confirmado; ícones de sino
  (Alertas, com bolinha de não lida) e perfil (Perfil) somados ao troféu já
  existente no header — duplicam as abas de baixo de propósito.
- `promotions.service.ts`/`usePromotions.ts`: `list()` ganha `marketId`,
  `departmentId`, `sort` (`'recent' | 'confirmed'`); `queryKey` inclui os
  novos filtros pra não servir página em cache errada.
- Sem `eas build`/`eas update` disparado — a pedido do usuário.

## [2026-08-02] Card de promoção redesenhado + avaliação + oferta quente + salvar

- Migration `0017`: tabela `ratings` (1-5 estrelas, um voto por usuário,
  pode trocar) + `promotions.avg_rating`/`ratings_count` mantidos por
  trigger (recalculado do zero, não delta — ver `decisions.md`).
- `PromotionCard.tsx` redesenhado: preço grande com o antigo riscado, selo
  de desconto %, pílula "você economiza", confirmações em destaque sobre a
  foto, "publicado há X min", nota por estrelas nas stats, selo 🔥 "Oferta
  quente" condicional.
- Novo `StarRating.tsx` (modo interativo e somente-leitura), usado no card e
  em `PromotionDetailScreen.tsx` (widget pra avaliar).
- Botão "Salvar" no card (ícone de marcador) — adiciona/remove da Lista de
  compras (`useListaCompras`), sem tabela nova. "Confirmar" não muda:
  continua só validando que a oferta é real.
- Novo `src/utils/promotionInsights.ts`: `isHotDeal` (limiar ajustável,
  10 confirmações/24h) e `discountPercent`, ambos client-side.
- Sem `eas build`/`eas update` disparado — a pedido do usuário, mais
  mudanças vêm antes do próximo deploy.

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
