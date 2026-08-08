# Prompt: Fundação do Ofertaki Business

> Prompt de implementação para preparar o banco e o app para o **Ofertaki
> Business** — o painel administrativo web dos supermercados.
>
> **Escopo deste prompt**: só a fundação (banco + app). O frontend web é um
> projeto separado, que fica destravado quando isto estiver pronto.
>
> Análise que originou este prompt: `.claude/memory/em-analise.md`.

---

## Antes de começar: 4 decisões que são do dono do produto

**Não comece a implementar sem respostas para estas.** Elas mudam o schema, não
só a UI. Se você é o agente executando isto, pergunte ao usuário antes de
escrever a primeira migration.

1. **Oferta de loja aparece igual à da comunidade no feed?**
   O app se sustenta em "preço confirmado por quem esteve na loja hoje". Oferta
   publicada pelo próprio mercado é publicidade. Recomendação: manter no mesmo
   feed, mas **visualmente distinta** ("Oferta oficial").

2. **A comunidade pode curtir/confirmar oferta de loja?**
   Recomendação: **sim para confirmar** (a comunidade validando o preço
   anunciado é justamente o que pega propaganda enganosa), e curtir também.
   Mas **nenhum membro da loja** pode curtir/confirmar oferta da própria loja.

3. **Denúncia em oferta de loja derruba automaticamente?**
   Hoje 5 denúncias de usuários diferentes = `status = 'removed'` por trigger.
   Num contexto comercial isso vira vetor de ataque: concorrente organiza 5
   denúncias e tira a oferta do ar. Recomendação: **oferta de loja não é
   removida automaticamente** — vai para revisão manual.

4. **Como verificar que quem se cadastrou como "Assaí" é mesmo o Assaí?**
   Sem isso, qualquer pessoa reivindica qualquer loja. Recomendação para o
   começo: **verificação manual** — a loja se cadastra, fica `pendente`, e
   alguém aprova. Nada automático.

---

## Contexto técnico obrigatório

- **Repositório**: `kenielcnp-dotcom/ofertaki`
- **Branch de trabalho**: `test.design-local` (a `main` está obsoleta)
- **Stack**: React Native + Expo SDK 54, TypeScript, React Navigation,
  TanStack React Query, Supabase
- **Última migration**: `0021_feed_relevance_phase1.sql` → as novas começam em
  **`0022`**
- Consultar `CLAUDE.md` e `.claude/memory/` antes de qualquer coisa

### Regras do projeto que valem aqui

- Toda mudança de schema é **migration nova**; nunca editar uma já aplicada
- Depois de aplicar: **regerar** `src/types/database.types.ts`
- Função `SECURITY DEFINER` de uso interno nasce com **`REVOKE EXECUTE`**;
  só é pública se houver motivo explícito
- Regra de negócio confiável vive **no banco** (RLS/trigger), não no cliente
- Camadas: tela → hook (React Query) → service → supabase. Tela nunca chama o
  Supabase direto
- Código e commits em inglês; texto visível ao usuário em pt-BR
- `npx tsc --noEmit` limpo antes de considerar qualquer etapa pronta
- Já existem testes (Jest + RNTL) — adicionar teste para lógica pura nova

### Padrão a REUSAR (importante)

`supabase/migrations/0019_lista_compartilhada.sql` já resolve exatamente a
classe de problema "vários usuários com papéis diferentes sobre um recurso".
**Copie a forma dele**, não invente outra:

- tabela `lista_membros (lista_id, user_id, role check in ('dono','convidado'))`
- helpers `my_lista_id()` / `is_lista_dono()`, ambos:
  `language sql`, `stable`, `security definer set search_path = public`,
  com `grant execute on function ... to authenticated`
- policies chamando esses helpers em vez de repetir subquery
- `lista_convites` para entrada por código
- `listas`/`lista_membros` **não têm policy de insert/update** — só funções
  `SECURITY DEFINER` escrevem (mesmo padrão de `notifications`/`points_ledger`)

---

## Etapa 1 — Propriedade da loja (`0022`)

**Objetivo**: saber quem administra qual mercado.

Criar `mercado_membros`, espelhando `lista_membros`:

```sql
create table public.mercado_membros (
  id         uuid primary key default gen_random_uuid(),
  mercado_id uuid not null references public.mercados (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null check (role in ('dono', 'editor')),
  created_at timestamptz not null default now(),
  unique (mercado_id, user_id)
);

alter table public.mercado_membros enable row level security;

-- helpers no mesmo formato de my_lista_id()/is_lista_dono()
create function public.my_mercado_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$ select mercado_id from public.mercado_membros where user_id = auth.uid(); $$;

create function public.is_mercado_membro(p_mercado_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.mercado_membros
    where user_id = auth.uid() and mercado_id = p_mercado_id
  );
$$;

grant execute on function public.my_mercado_ids() to authenticated;
grant execute on function public.is_mercado_membro(uuid) to authenticated;
```

> Diferente de `my_lista_id()` (que retorna **uma** lista), aqui retorna
> `setof` — uma pessoa pode administrar mais de uma unidade de uma rede.

Policies: membro lê os próprios vínculos. **Insert/update sem policy** — só
função `SECURITY DEFINER` escreve (cadastro/convite), igual a `lista_membros`.

**Verificação**: um usuário sem vínculo não enxerga nada em `mercado_membros`;
um membro enxerga só os vínculos das lojas dele.

---

## Etapa 2 — Perfil da loja (`0023`)

**Objetivo**: dar onde morar aos campos que o painel edita.

```sql
alter table public.mercados
  add column logo_url    text,
  add column address     text,
  add column phone       text,
  add column social      jsonb not null default '{}'::jsonb,
  add column status      text not null default 'pending'
      check (status in ('pending', 'verified', 'rejected'));
```

- `status` implementa a **decisão 4** (verificação manual). Só loja `verified`
  publica oferta.
- `mercados_select_public` já existe e continua valendo (o app precisa ler o
  nome).
- Nova policy de **update**: membro com `role = 'dono'` atualiza os campos de
  perfil da própria loja. **`status` fica de fora** — `REVOKE UPDATE (status)`,
  senão a loja se auto-aprova. Mesmo padrão de `promotions.status` em `0014`.

**Verificação**: dono edita telefone da própria loja; não consegue editar o de
outra; não consegue mudar o próprio `status`.

---

## Etapa 3 — Origem da promoção + correção do ranking (`0024`)

**Esta é a etapa crítica.** Sem ela, o Business quebra a gamificação do app.

```sql
alter table public.promotions
  add column store_id uuid references public.mercados (id),
  add column source   text not null default 'community'
      check (source in ('community', 'store'));

-- integridade: oferta de loja tem store_id; oferta da comunidade não tem
alter table public.promotions
  add constraint promotions_source_store_consistency
  check ((source = 'store' and store_id is not null)
      or (source = 'community' and store_id is null));

create index promotions_store_id_idx on public.promotions (store_id)
  where store_id is not null;
```

### Corrigir o trigger de pontos

`0010_gamification.sql:42` — `points_on_promotion_create` dá **+10 a quem
publica, sem exceção**. Recriar a função com a guarda:

```sql
create or replace function public.award_points_create_promo()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Oferta de loja é publicidade, não contribuição da comunidade:
  -- não pontua e não entra no ranking mensal.
  if new.source = 'store' then
    return new;
  end if;

  insert into public.points_ledger (user_id, points, reason)
  values (new.user_id, 10, 'create_promotion');
  return new;
end;
$$;
```

Fazer o mesmo para `award_points_receive_like` e
`award_points_receive_confirmation` — curtida/confirmação recebida em oferta de
loja **não** deve gerar ponto para o funcionário que publicou.

### Policies de promoção para a loja

- **Insert**: membro de loja `verified` insere com `source = 'store'` e
  `store_id` entre os seus (`public.my_mercado_ids()`); `user_id` continua sendo
  `auth.uid()` (rastreabilidade de quem publicou)
- **Update/Delete**: qualquer membro da loja edita/exclui oferta da própria loja
  — não só quem publicou (o funcionário pode sair da empresa)
- **Select**: `promotions_select_active_or_own` precisa ser estendida — o painel
  tem que ver ofertas `expired`/`removed` da própria loja para montar
  relatórios, não só as `active`

### Anti auto-interação (decisão 2)

`likes_insert_own_not_author` e `confirmations_insert_own_not_author` hoje
comparam com `promotions.user_id`. Para oferta de loja isso não basta: um
colega da mesma loja passaria. Estender para bloquear **qualquer membro da
loja**, usando `public.is_mercado_membro(promotions.store_id)`.

### Denúncia (decisão 3)

Ajustar o trigger de remoção automática para **não** derrubar quando
`source = 'store'` — marcar para revisão em vez de remover.

**Verificação**:
- publicar oferta como loja → **não** aparece novo lançamento em
  `points_ledger`, `reputation_score` não muda, ranking mensal inalterado
- publicar como usuário comum → +10 normalmente (não regrediu nada)
- membro da loja não consegue curtir/confirmar oferta da própria loja
- constraint impede `source='store'` sem `store_id`

---

## Etapa 4 — Métricas reais (`0025`)

**Objetivo**: alimentar o dashboard com visualização real, sem derrubar o banco.

Uma linha por visualização cresce rápido e o dashboard **não pode** fazer
`count(*)` nisso a cada carregamento. Padrão: evento cru + agregado diário.

```sql
-- evento cru (alto volume, podável)
create table public.promotion_views (
  id           bigserial primary key,
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id      uuid references public.profiles (id) on delete set null,
  viewed_at    timestamptz not null default now()
);

-- agregado que o dashboard lê
create table public.promotion_stats_daily (
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  day          date not null,
  views        integer not null default 0,
  saves        integer not null default 0,  -- vindos de lista_compras
  likes        integer not null default 0,
  primary key (promotion_id, day)
);
```

- Registro da visualização por **RPC** (`record_promotion_view`), não insert
  direto — permite deduplicar (ex.: 1 view por usuário/promoção/hora) e evita
  inflar métrica com scroll
- Agregação diária via **`pg_cron`**; o painel lê só `promotion_stats_daily`
- Poda de `promotion_views` depois de N dias
- **RLS**: `promotion_stats_daily` só é legível por membro da loja dona da
  promoção. `promotion_views` não é legível pelo cliente

**"Favoritos" já existe**: é `lista_compras` — quando alguém salva a oferta na
lista de compras. É a métrica mais valiosa do painel, porque indica intenção
real de compra. Alimentar a coluna `saves` a partir dali.

**Instrumentação no app**: chamar a RPC ao abrir `PromotionDetailScreen`
(`src/screens/promotion/PromotionDetailScreen.tsx`), via hook novo em
`src/hooks/`, seguindo o padrão hook → service. **Não** bloquear a renderização
nem quebrar a tela se a chamada falhar — métrica não pode derrubar UX.

---

## Etapa 5 — App: distinguir oferta de loja

Depende da **decisão 1**.

1. Regerar `src/types/database.types.ts`
2. `src/types/promotion.ts`: `PromotionWithMarket` ganha `source` e `store_id`
3. `src/components/promotion/PromotionCard.tsx`: selo visual para
   `source === 'store'` (ex.: `Badge` com tom `primary`, texto "Oferta
   oficial"). Usar o componente `Badge` existente, não criar outro
4. `src/screens/promotion/PromotionDetailScreen.tsx`: mesma distinção, e
   esconder ações que não fazem sentido para membro da loja
5. `0021_feed_relevance_phase1.sql` — avaliar se oferta de loja entra no
   score de relevância com peso diferente. **Se mudar, é migration nova**
6. Acessibilidade: o selo precisa de `accessibilityLabel` — não pode ser só cor
   (regra de `.claude/skills/ui-design/SKILL.md`)

---

## Etapa 6 — Documentação (não opcional)

- `.claude/memory/decisions.md` — ADR novo (Contexto / Decisão / Alternativas /
  Consequências) para cada decisão de 1 a 4 que foi efetivada
- `.claude/memory/em-analise.md` — remover a seção do Ofertaki Business ou
  marcá-la como superada
- `.claude/memory/changelog.md` — entrada da mudança
- `.claude/docs/database.md` — tabelas e regras novas
- `.claude/docs/components.md` / `screens.md` — se a UI mudou
- `.claude/memory/roadmap.md` — o painel web vira item de roadmap

---

## Critérios de aceite

- [ ] As 4 decisões de produto foram respondidas pelo usuário **antes** do código
- [ ] `supabase migration list` com local == remote
- [ ] `src/types/database.types.ts` regerado, sem diff pendente
- [ ] `npx tsc --noEmit` limpo
- [ ] Testes passando; teste novo para a lógica pura adicionada
- [ ] **Loja publicando não gera ponto nem move o ranking** (verificado com
      dado real, não presumido)
- [ ] Usuário comum publicando continua ganhando +10 (nada regrediu)
- [ ] Membro da loja não curte/confirma oferta da própria loja
- [ ] Loja só edita a própria loja; não altera o próprio `status`
- [ ] Dashboard consegue ler métricas só da própria loja
- [ ] Database Linter do Supabase sem achado novo
- [ ] Documentação atualizada conforme Etapa 6

## Regras de execução

- Uma etapa por vez, **em ordem** — cada uma depende da anterior
- Uma migration por etapa, numerada em sequência a partir de `0022`
- Não avançar para a etapa seguinte com a anterior falhando
- Ao encontrar divergência entre este prompt e o estado real do código,
  **o código vence** — este prompt foi escrito sobre o commit `ea90086` e pode
  ter envelhecido. Avise antes de seguir
