# Camada de Dados (API)

**Não existe API REST própria.** O app fala direto com o Supabase através do
cliente oficial (`@supabase/supabase-js`), e a autorização é feita por RLS no
banco — não por um servidor intermediário.

```
Tela → hook (React Query) → service (*.service.ts) → supabase client → Postgres + RLS
```

## Cliente

`src/services/supabase/client.ts` — instância única do Supabase, configurada com
`src/config/env.ts`, que lê `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_ANON_KEY` e **falha no carregamento** se alguma faltar
(erro explícito é melhor do que erro silencioso em runtime).

Variáveis documentadas em `.env.example`. O `.env` real é gitignored — para
build na nuvem, as vars precisam existir no EAS (ver `deployment.md`).

## Services

Um arquivo por entidade em `src/services/`:

| Service | Responsabilidade |
|---|---|
| `auth.service.ts` | signup, login, logout, reset de senha |
| `profile.service.ts` | leitura/atualização de perfil |
| `promotions.service.ts` | listagem paginada + busca, detalhe, criação |
| `mercados.service.ts` | lista de mercados (dropdown de "Loja") |
| `categories.service.ts` | categorias (hoje só "Mercado") |
| `likes.service.ts` | curtir/descurtir |
| `comments.service.ts` | listar/criar comentário |
| `confirmations.service.ts` | confirmar/desconfirmar preço |
| `lista_compras.service.ts` | itens da lista de compras (escopo: `lista_id`) |
| `listas.service.ts` | RPCs de lista compartilhada (criar/entrar/convite/membros) |
| `ranking.service.ts` | chama a RPC `get_monthly_ranking` |
| `notifications.service.ts` | listar, marcar como lida, subscription Realtime |
| `reports.service.ts` | denunciar promoção |
| `storage.service.ts` | upload de imagem para o bucket `promotion-images` |

## Padrão de service

Exemplo real (`promotions.service.ts`):

```ts
const PAGE_SIZE = 20;
const SELECT_WITH_MARKET = '*, mercados (name)';

export const promotionsService = {
  async list({ page = 0, search } = {}) {
    let query = supabase
      .from('promotions')
      .select(SELECT_WITH_MARKET)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (search) {
      query = query.textSearch('search_vector', search, {
        type: 'websearch',
        config: 'portuguese',
      });
    }

    const result = await query;
    return { ...result, data: result.data as PromotionWithMarket[] | null };
  },
  // ...
};
```

Regras:

- O service **retorna** `{ data, error }` — quem lança o erro é o hook, para o
  React Query saber que a query falhou.
- Relações vêm por `select` aninhado (`'*, mercados (name)'`), tipadas com um
  tipo composto em `src/types/` (ex.: `PromotionWithMarket`).
- Paginação por `.range()`, com o tamanho de página exportado para o hook usar
  no `getNextPageParam`.

## Padrão de hook

`src/hooks/` envolve o service com React Query. Exemplo (`usePromotions.ts`):
`useInfiniteQuery` com `queryKey: ['promotions', search ?? '']`, `pageParam`
numérico, e `getNextPageParam` que devolve `undefined` quando a página veio
menor que `PAGE_SIZE`.

Hooks existentes: `useAuth`, `usePromotions`, `usePromotionDetail`,
`useCreatePromotion`, `useMarkets`, `useListaCompras`, `useMonthlyRanking`,
`useNotifications`, `useReportPromotion`, `useImageUpload`.

## RPC

Única função chamada por RPC: `get_monthly_ranking` (Top 50 do mês + posição do
usuário fora do Top 50). Todas as outras funções `SECURITY DEFINER` do banco têm
`REVOKE EXECUTE` e só rodam como trigger — ver `database.md`.

## Ao adicionar um endpoint/consulta

1. Criar/estender o service correspondente (nunca chamar `supabase` da tela).
2. Criar o hook em `src/hooks/` com a `queryKey` certa e invalidação
   consistente.
3. Se envolver tabela/coluna nova: migration + regerar
   `src/types/database.types.ts`.
4. Verificar RLS: a policy garante que o usuário só lê/escreve o que deveria?
   (`.claude/skills/security/SKILL.md`)
