# Ofertaki — Status do projeto (última atualização: 2026-07-31)

## Stack

- **Mobile:** React Native + Expo (SDK 54), TypeScript
- **Backend:** Supabase (Postgres + Auth + Storage), projeto `haflsneovzjnqanjkwdt`
- **Repos git:**
  - `ofertaki-app/` → repo próprio, já no GitHub (github.com/kenielcnp-dotcom/ofertaki, branch main)
  - `contexto base/` (raiz) → repo novo, só local, contém agent/ (scaffold Python, fora de escopo) e Documentação do Produt/ (docs originais do produto)

## O que já foi feito

### Fase 0/1 — Setup + Auth

- Projeto Expo criado, deps instaladas, Supabase linkado.
- Migrations `0001_init_profiles.sql` e `0002_categories.sql` aplicadas no banco real.
- Auth completo: signup/login/logout/reset senha, trigger `handle_new_user` cria perfil automaticamente, sessão persistida via AsyncStorage.
- `.env` configurado com credenciais reais.

### Fase 2 + 3 combinadas — Base de promoções + interações sociais + lista de compras

_(a Fase 2 nunca tinha sido feita antes; foi feita junto com a 3 porque uma depende da outra)_

- Migrations `0003` (promotions) → `0006` (bucket de Storage promotion-images) aplicadas.
- Contadores (likes_count etc.) protegidos por REVOKE de coluna — nem o autor edita via UPDATE, só triggers security definer.
- RLS bloqueia auto-curtida/auto-confirmação.
- Hotbar realinhada (pedido do usuário, diferente do plano original): Home · Lista · Publicar · Notificações · Perfil, com "Publicar" central em destaque.
- Busca virou parte da Home (não é mais aba).
- Ranking virou link a partir do Perfil (não é mais aba).
- "Lista" = lista de compras pessoal (`lista_compras`, privada por usuário, com checkbox "comprado"), separada de like/comentário/confirmação.
- "Notificações" é só stub por enquanto (Realtime fica pra Fase 5).
- Telas novas: `PromotionDetailScreen`, `ListaScreen`, `CreatePromotionScreen` (formulário real), `NotificationsScreen` (stub).
- `SearchScreen` antiga removida (obsoleta).

### Mercados (supermercados) — melhoria pedida depois

- **Antes:** campo "Loja" era texto livre + categoria selecionada manualmente.
- **Agora:** tabela `mercados` (migrations 0007/0008), campo "Loja" virou dropdown de verdade (`MarketSelect`, modal com lista), categoria "Mercado" é atribuída automaticamente (chips de categoria sumiram da tela, já que o MVP só cobre mercado).
- Seed inicial genérico: Carrefour, Extra, Assaí, Pão de Açúcar, Dia — para ajustar depois pelo dashboard.
- Decisão registrada: não usar uma tabela por mercado (quebraria paginação do feed e as FKs de likes/comments/confirmations) — usar tabela normalizada + índice.
- Estado técnico: `npx tsc --noEmit` limpo, migrations sincronizadas com o Supabase remoto, tudo commitado e com push feito pro GitHub.

### Gamificação/Ranking (Fase 4)

- `points_ledger` (+10 publicar, +2 curtida recebida, +1 confirmação recebida), `reputation_score` em `profiles` sincronizado via trigger e protegido por `REVOKE` (cliente não escreve direto).
- Função `get_monthly_ranking` (RPC) retorna Top 50 do mês + posição do usuário fora do Top 50. `RankingScreen`/`RankingItem` com medalhas ouro/prata/bronze, acessível a partir do Perfil.
- Lista de compras ganhou itens de texto livre (não precisam mais vir de uma promoção publicada) — `lista_compras.promotion_id` agora é opcional.

### Notificações, busca e denúncia (Fase 5)

- Migrations `0011_notifications_reports.sql` e `0012_promotions_search.sql` aplicadas.
- `notifications`: gerada por trigger quando a promoção de alguém recebe curtida/comentário/confirmação (nunca escrita direto pelo cliente). `NotificationsScreen` já é real — lista, Realtime (nova notificação aparece sem refresh), marcar como lida/marcar todas.
- Busca da Home trocou `ilike` por full-text (`tsvector` + índice GIN em `title`/`description`, busca via `websearch` em português).
- `reports`: botão "Denunciar promoção" no detalhe, com motivo (expirada/falsa/preço errado/impróprio/outro). Ao atingir 5 denúncias de usuários diferentes, a promoção vira `status = 'removed'` automaticamente (trigger).
- **Fora de escopo por decisão consciente:** filtro por categoria na Home não foi construído — hoje toda promoção usa a categoria "Mercado" fixa, então o filtro não teria efeito prático ainda. Fica pra quando outras categorias entrarem.
- Estado técnico: `npx tsc --noEmit` limpo, todas as 12 migrations sincronizadas com o Supabase remoto, commitado e enviado pro GitHub.

### Segurança — correções do Database Linter do Supabase

- Achado real (não só cosmético): `adjust_promotion_counter` era `SECURITY DEFINER`, chamável direto via `/rest/v1/rpc` por `anon`/`authenticated`, e aceitava o nome da coluna como texto livre sem validar — dava pra reescrever qualquer coluna de `promotions` (inclusive `price`) por fora da RLS. Corrigido com whitelist de coluna + `REVOKE EXECUTE` (migration `0013`).
- `REVOKE EXECUTE` em todas as outras funções `SECURITY DEFINER` de uso interno (trigger-only); só `get_monthly_ranking` continua pública de propósito.
- `set_updated_at` ganhou `search_path` fixo; policy de listagem pública do bucket `promotion-images` removida (URL direta de imagem não depende de RLS).
- **Pendência que não dá pra resolver por código:** "Leaked password protection" (checagem HaveIBeenPwned) exige plano Pro do Supabase — API retornou 402 no free tier atual.

### Fase 6 (parte 1) — erro/retry, skeleton, acessibilidade, revisão de RLS

- `FeedScreen`, `PromotionDetailScreen`, `ListaScreen`, `NotificationsScreen` agora mostram estado de erro com botão "Tentar novamente" (`ErrorState`) em vez de ficar carregando pra sempre ou em branco quando a query falha.
- Loading trocou `ActivityIndicator` solto por skeleton loaders (`Skeleton`, `PromotionCardSkeleton`) em Feed, Detalhe, Lista, Notificações e Ranking.
- Acessibilidade: fotos de promoção corretamente ocultas/rotuladas pra leitor de tela; alvos de toque pequenos (checkbox da Lista, motivos de denúncia) ganharam `hitSlop`/`minHeight` pra chegar perto de 44px.
- Revisão de RLS nas 14 migrations achou 1 gap real: `promotions.status` era editável pelo próprio autor via UPDATE — dava pra reverter manualmente uma remoção automática por denúncia. Corrigido com `REVOKE UPDATE (status)` (migration `0014`), sem mudar nenhum comportamento hoje (o client nunca escrevia esse campo).
- **Fora desta rodada, por decisão do usuário:** testes automatizados (fica pra uma rodada própria depois) e correção de contraste de cor (pendência anotada pro time de design).

### Rebrand + telas de Login/Cadastro/Welcome (branch `test.design-local`, não mergeada na `main`)

- Entrega real do time de design aplicada: `WelcomeScreen` nova (foto de fundo real + logo), `AuthHeader` com header curvo verde, `LoginScreen`/`SignUpScreen` redesenhadas (inputs com ícone, toggle de senha, botões pill), rebrand de cor (`colors.primary` verde `#1A5331`, `colors.secondary` laranja `#E77F43`) aplicado ao app inteiro.
- Está **só na branch `test.design-local`** (histórico local resumido a 1 commit, mas já espelhada em `origin/test.design-local`) — **não foi trazida para a `main`**, decisão consciente por enquanto.
- Detalhe completo nas Seções 15/16 do plano de referência.

### 2026-07-31 — Diagnóstico e correções para deixar pronto pro deploy

Pedido do usuário: revisão geral de ponta a ponta + deixar pronto pro deploy. Achados e correções:

- **App não iniciava**: não existia `.env` nem `.env.example` neste checkout — `src/config/env.ts` derrubava o app assim que carregava (`Variável de ambiente ausente`). Recriado `.env` (local, fora do Git) com as credenciais reais informadas pelo usuário e `.env.example` (novo, documentando as duas vars) commitado.
- `expo-doctor` acusou `expo@54.0.8` desalinhado do SDK instalado; corrigido com `expo install --fix` → `~54.0.36`.
- Testado end-to-end num browser real (Playwright headless contra `expo start --web`): cadastro → trigger `handle_new_user` cria o perfil → login → logout → login de novo, tudo contra o Supabase remoto de verdade, zero erro de console. Feed, Lista, Alertas, Publicar e Perfil renderizam sem erro.
- **Bug real encontrado no Ranking**: `get_monthly_ranking` declarava `total_points integer`, mas `sum(pl.points)` retorna `bigint` — toda chamada da RPC dava 400 (`structure of query does not match function result type`) e a `RankingScreen` ficava presa no skeleton pra sempre. Corrigido na migration `0015_fix_ranking_return_type.sql`, aplicada no banco remoto (via Management API + `supabase db push` para registrar no histórico) e confirmada com uma chamada real à RPC (200, sem erro).
- `supabase migration list` confirma as 15 migrations (`0001`–`0015`) com `local == remote` — nada pendente. `supabase gen types typescript` rodado de novo: sem diff contra `src/types/database.types.ts` (já estava correto).
- `SignUpScreen`: no cadastro, quando o projeto Supabase já devolve sessão ativa (confirmação de e-mail desligada, é o caso hoje), o app mostrava o alerta "confirme seu e-mail" e tentava navegar pra `Login` mesmo já tendo trocado pra `MainTabs` — gerava warning de navegação e mensagem contraditória pro usuário. Agora só mostra esse alerta/navegação quando realmente não veio sessão.
- `app.json`: nome de exibição virou "Ofertaki" (antes "ofertaki-app"), `ios.bundleIdentifier`/`android.package` = `com.ofertaki.app` (placeholder — **confirmar/trocar antes de submeter às lojas** se já existir um app registrado com outro id), plugin `expo-image-picker` com textos de permissão (obrigatório pra build de loja, senão o app crasha ao pedir permissão de câmera/fototeca).
- `eas.json`: criado do zero (não existia) com perfis `development`/`preview`/`production`.
- Tudo commitado e enviado para `origin/test.design-local`.

## O que falta

- **Antes de rodar `eas build` de verdade**: criar projeto EAS (`eas login` + `eas build:configure`, gera `extra.eas.projectId`) e configurar `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` como env vars do EAS (`eas env:create`) — o `.env` local é gitignored e não vai pro build na nuvem sozinho.
- **Confirmar `com.ofertaki.app`** como bundle id/package definitivo (ou trocar) antes de submeter às lojas — contas Apple Developer/Google Play e ficha da loja (ícones, screenshots, política de privacidade) ainda não fazem parte de nada automatizável por aqui.
- **Fase 6 (parte 2):** testes automatizados (Jest/RNTL, e possivelmente Detox/Maestro depois).
- Reset de senha não tem deep link de volta pro app (usuário reseta no navegador e loga de novo manualmente) — funcional, mas não é o fluxo ideal; ficaria pra quando scheme/deep linking entrar em escopo.
- Filtro por categoria na Home (adiado — ver acima).
- Habilitar "Leaked password protection" no Supabase quando o projeto for pra plano Pro.
- Decidir quando trazer `test.design-local` pra `main` (usuário optou por deixar as branches como estão por enquanto).
- 12 vulnerabilidades (10 moderate/2 high) do `npm audit` são todas em ferramental de build do Expo (transitively via `xcode`/`@expo/config-plugins`), não em código que roda no app publicado; corrigir exigiria pular pro Expo SDK 57 (`npm audit fix --force`), fora de escopo desta rodada.

_Plano de referência completo em:_ `C:\Users\kenie\.claude\plans\me-mostre-como-vc-staged-lightning.md`
