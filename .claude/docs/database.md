# Banco de Dados

Supabase (Postgres). A **fonte da verdade do schema são as migrations** em
`supabase/migrations/` (`0001`–`0016`) — nunca alterar o banco só pelo
dashboard. Os tipos TypeScript em `src/types/database.types.ts` são **gerados**
(`supabase gen types typescript`), não editados à mão.

## Tabelas

| Tabela | Papel |
|---|---|
| `profiles` | perfil do usuário, criado por trigger no signup |
| `categories` | categorias de promoção (hoje só "Mercado" em uso) |
| `mercados` | supermercados (fonte do dropdown "Loja") |
| `promotions` | promoções publicadas |
| `likes` | curtidas em promoção |
| `comments` | comentários em promoção |
| `confirmations` | confirmações de que o preço está correto |
| `lista_compras` | lista de compras pessoal (privada) |
| `points_ledger` | lançamentos de pontos (fonte da reputação) |
| `notifications` | notificações in-app |
| `reports` | denúncias de promoção |

## Colunas principais

**`profiles`** — `id` (= `auth.users.id`), `username`, `display_name`,
`avatar_url`, `bio`, `reputation_score`, `role`, `is_banned`, timestamps.

**`promotions`** — `id`, `user_id` → `profiles`, `market_id` → `mercados`,
`category_id` → `categories`, `title`, `description`, `price`,
`original_price` (valor sem a promoção, obrigatório, `check (original_price
>= price)` — migration `0016`), `image_url`, `expires_at`, `status`,
contadores (`likes_count`, `comments_count`, `confirmations_count`,
`reports_count`), `search_vector` (`tsvector`), timestamps.

**`reports`** — `id`, `promotion_id`, `user_id`, `reason`
(`expired` | `fake` | `wrong_price` | `inappropriate` | `other`), `details`.

**`lista_compras`** — item da lista; `promotion_id` é **opcional** (o item pode
ser texto livre), com flag de "comprado" (`is_purchased`) e `purchased_at`
(quando foi marcado como comprado — migration `0016`, mantido por trigger,
não pelo cliente; usado pelo painel de economia mensal da `ListaScreen`).

## Relações

- `profiles` 1—N `promotions` (autor)
- `mercados` 1—N `promotions` · `categories` 1—N `promotions`
- `promotions` 1—N `likes` / `comments` / `confirmations` / `reports`
- `profiles` 1—N `lista_compras` / `points_ledger` / `notifications`

## Regras aplicadas no banco (não no app)

O cliente é público e pode ser manipulado, então o que precisa ser confiável
vive aqui:

- **Perfil automático**: trigger `handle_new_user` cria a linha em `profiles`
  no signup.
- **Contadores** (`likes_count`, `comments_count`, `confirmations_count`,
  `reports_count`): `REVOKE` de coluna — nem o autor edita via UPDATE. Só
  triggers `SECURITY DEFINER` escrevem.
- **`promotions.status`**: `REVOKE UPDATE (status)` (migration `0014`) — impede
  o autor de reverter uma remoção automática por denúncia.
- **`profiles.reputation_score`**: sincronizado por trigger a partir de
  `points_ledger`, protegido por `REVOKE`. Pontuação: +10 publicar, +2 curtida
  recebida, +1 confirmação recebida.
- **Sem auto-interação**: a RLS bloqueia curtir e confirmar a própria promoção.
- **Notificações**: geradas exclusivamente por trigger; o cliente nunca insere.
- **Remoção automática**: ao atingir 5 denúncias de usuários **diferentes**, a
  promoção vira `status = 'removed'` por trigger.
- **Busca**: `search_vector` (`tsvector`) com índice GIN sobre
  `title`/`description`, consultada com `websearch` e config `portuguese`.
- **Funções `SECURITY DEFINER`**: todas com `REVOKE EXECUTE`, exceto
  `get_monthly_ranking`, que é pública de propósito. `set_updated_at` tem
  `search_path` fixo.
- **`lista_compras.purchased_at`**: mantido por trigger (`0016`), não pelo
  cliente — zera quando `is_purchased` volta a `false`, marca `now()` quando
  vira `true`. Evita depender do relógio do dispositivo ou do client lembrar
  de limpar ao desmarcar.

## Storage

Bucket `promotion-images` (migration `0006`) para as fotos de promoção. A policy
de listagem pública foi removida — a URL direta da imagem não depende de RLS.

## Ao mudar o schema

1. Criar uma migration nova em `supabase/migrations/` (nunca editar uma já
   aplicada).
2. Aplicar (`supabase db push`) e conferir com `supabase migration list` que
   local e remoto estão iguais.
3. Regerar `src/types/database.types.ts`.
4. Revisar a RLS da tabela afetada antes de considerar pronto
   (`.claude/skills/security/SKILL.md`).
5. Registrar a mudança em `.claude/memory/changelog.md` e, se for uma decisão
   de modelagem, em `decisions.md`.
