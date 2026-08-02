# Banco de Dados

Supabase (Postgres). A **fonte da verdade do schema são as migrations** em
`supabase/migrations/` (`0001`–`0019`) — nunca alterar o banco só pelo
dashboard. Os tipos TypeScript em `src/types/database.types.ts` são **gerados**
(`supabase gen types typescript`), não editados à mão.

## Tabelas

| Tabela | Papel |
|---|---|
| `profiles` | perfil do usuário, criado por trigger no signup |
| `categories` | tipo de estabelecimento (hoje só "Mercado" em uso, nunca exposta em UI) |
| `mercados` | supermercados (fonte do dropdown "Loja") |
| `departments` | departamento/seção do supermercado (fonte dos chips e do dropdown "Departamento") |
| `promotions` | promoções publicadas |
| `likes` | curtidas em promoção |
| `comments` | comentários em promoção |
| `confirmations` | confirmações de que o preço está correto |
| `ratings` | avaliação (1-5 estrelas) de uma promoção |
| `listas` | entidade "lista de compras" — dono + convidados (migration `0019`) |
| `lista_membros` | quem pertence a qual lista (dono/convidado); 1 lista por usuário por vez |
| `lista_convites` | código de convite ativo de uma lista (uso interno, não lida direto pelo client) |
| `lista_compras` | item de uma lista — colaborativa entre os membros dela |
| `points_ledger` | lançamentos de pontos (fonte da reputação) |
| `notifications` | notificações in-app |
| `reports` | denúncias de promoção |

## Colunas principais

**`profiles`** — `id` (= `auth.users.id`), `username`, `display_name`,
`avatar_url`, `bio`, `reputation_score`, `role`, `is_banned`, timestamps.

**`departments`** — `id`, `name`, `slug`, `icon` (nome do ícone Ionicons),
`sort_order`, `is_active`. Seed fixo: Alimentos, Bebidas, Higiene, Limpeza,
Açougue, Hortifruti (migration `0018`). Eixo diferente de `categories` —
`categories` é tipo de estabelecimento (Mercado/Farmácia/...), `departments`
é seção **dentro** do supermercado.

**`promotions`** — `id`, `user_id` → `profiles`, `market_id` → `mercados`,
`category_id` → `categories`, `department_id` → `departments` (**nullable** —
promoções anteriores à migration `0018` não têm valor; obrigatório só no
formulário de publicação, não no banco), `title`, `description`, `price`,
`original_price` (valor sem a promoção, obrigatório, `check (original_price
>= price)` — migration `0016`), `image_url`, `expires_at`, `status`,
contadores (`likes_count`, `comments_count`, `confirmations_count`,
`reports_count`), `avg_rating`/`ratings_count` (média e contagem de
avaliações, mantidos por trigger — migration `0017`), `search_vector`
(`tsvector`), timestamps.

**`ratings`** — `id`, `promotion_id`, `user_id`, `score` (`check (score
between 1 and 5)`), `unique (promotion_id, user_id)` — um usuário pode trocar
o próprio voto (`update`), não duplicar. Qualquer usuário logado avalia, a
qualquer momento, exceto o autor da própria promoção.

**`reports`** — `id`, `promotion_id`, `user_id`, `reason`
(`expired` | `fake` | `wrong_price` | `inappropriate` | `other`), `details`.

**`listas`** — só `id`/`created_at`. De propósito **sem** `owner_id`: quem é
dono/convidado vive inteiramente em `lista_membros`, pra não duplicar esse
fato em dois lugares (migration `0019`).

**`lista_membros`** — `lista_id`, `user_id`, `role` (`dono` | `convidado`),
`unique (user_id)` — cada usuário pertence a **no máximo uma lista por vez**
(sem suporte a múltiplas listas por usuário; decisão de produto, ver
`decisions.md`). Todo usuário ganha uma lista própria (como dono) na primeira
vez que abre a `ListaScreen`, via RPC `get_or_create_my_lista()`.

**`lista_convites`** — `lista_id` (`unique`), `code` (`unique`, 6 caracteres),
`created_by`. Sem nenhuma RLS policy de select/insert/update para o client —
só as RPCs abaixo tocam nela; o código sempre chega pelo `return` da função,
nunca por `select` direto na tabela.

**`lista_compras`** — item de uma lista (`lista_id`, não mais direto a um
usuário); `user_id` passou a significar **quem adicionou o item**, não mais
"dono exclusivo". `promotion_id` é **opcional** (o item pode ser texto livre).
`purchased_by` (migration `0019`) registra quem marcou como comprado —
existe pra manter a economia mensal **individual** mesmo numa lista
compartilhada (ver painel em `ListaScreen`). `purchased_at`/`purchased_by`
são mantidos por trigger (`set_lista_compras_purchased_at`), não pelo
cliente. Índice único `(lista_id, promotion_id)` evita duas pessoas da mesma
lista salvarem a mesma promoção duas vezes. `REPLICA IDENTITY FULL` (exigido
pra eventos de `DELETE` do Realtime carregarem `lista_id`, usado no filtro do
canal — ver `lista_compras.service.ts`/`useListaCompras.ts`).

## Relações

- `profiles` 1—N `promotions` (autor)
- `mercados` 1—N `promotions` · `categories` 1—N `promotions`
- `promotions` 1—N `likes` / `comments` / `confirmations` / `ratings` / `reports`
- `profiles` 1—N `points_ledger` / `notifications`
- `listas` 1—N `lista_membros` / `lista_compras`; `lista_membros`/`lista_compras` N—1 `profiles`

## Regras aplicadas no banco (não no app)

O cliente é público e pode ser manipulado, então o que precisa ser confiável
vive aqui:

- **Perfil automático**: trigger `handle_new_user` cria a linha em `profiles`
  no signup.
- **Contadores** (`likes_count`, `comments_count`, `confirmations_count`,
  `reports_count`, `avg_rating`, `ratings_count`): `REVOKE` de coluna — nem o
  autor edita via UPDATE. Só triggers `SECURITY DEFINER` escrevem.
  `avg_rating`/`ratings_count` são recalculados do zero (`avg`/`count` sobre
  `ratings`) a cada insert/update/delete — não são um delta incremental como
  os demais contadores, porque uma nota pode ser trocada (migration `0017`).
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
- **Funções `SECURITY DEFINER`**: a maioria tem `REVOKE EXECUTE` (uso só via
  trigger). As públicas de propósito (`GRANT` explícito pra `authenticated`):
  `get_monthly_ranking`, e as RPCs de lista compartilhada abaixo.
  `set_updated_at` tem `search_path` fixo.
- **`lista_compras.purchased_at`**: mantido por trigger (`0016`), não pelo
  cliente — zera quando `is_purchased` volta a `false`, marca `now()` quando
  vira `true`. Evita depender do relógio do dispositivo ou do client lembrar
  de limpar ao desmarcar. Desde `0019`, o mesmo trigger também marca/zera
  `purchased_by` a partir de `auth.uid()`.
- **Lista compartilhada (`0019`)**: `my_lista_id()`/`is_lista_dono()` são
  helpers `SECURITY DEFINER` usados **dentro das próprias RLS policies** de
  `listas`/`lista_membros`/`lista_compras` — evita que a policy precise
  fazer `EXISTS` na mesma tabela que está protegendo (padrão recomendado
  pelo Supabase contra recursão de RLS). RPCs públicas:
  `get_or_create_my_lista()` (cria a lista do usuário na primeira vez),
  `get_or_create_lista_convite()` / `regenerate_lista_convite()` (só o dono
  chama), `redeem_lista_convite(code)` (entra numa lista pelo código —
  **bloqueia** se a lista atual do usuário já tem itens ou outras pessoas,
  pra nunca abandonar dados em silêncio).

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
