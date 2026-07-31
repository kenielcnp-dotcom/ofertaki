# Ofertaki — Status do projeto (última atualização: 2026-07-30)

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

## O que falta

- **Fase 6 (parte 2):** testes automatizados (Jest/RNTL, e possivelmente Detox/Maestro depois).
- **Integração com o time de design** — combinada para "mais tarde" (ainda não veio); telas atuais usam estilo funcional simples (Button/Input/EmptyState), sem redesenho visual. Inclui rever o contraste de `colors.primary` como cor de texto.
- Filtro por categoria na Home (adiado — ver acima).
- Habilitar "Leaked password protection" no Supabase quando o projeto for pra plano Pro.

_Plano de referência completo em:_ `C:\Users\kenie\.claude\plans\me-mostre-como-vc-staged-lightning.md`
