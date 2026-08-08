# Em Análise

> Propostas **ainda não decididas**. Nada aqui é compromisso, plano de trabalho
> ou arquitetura acordada — é estudo preliminar registrado para não se perder.
>
> Decisões efetivadas ficam em `decisions.md`. Trabalho planejado fica em
> `roadmap.md`. **Este arquivo não é nenhum dos dois.**

---

# Ofertaki Business — painel administrativo para supermercados

## ⚠️ Status: EM ANÁLISE — não validado

- **Não implementado.** Nenhuma linha de código, nenhuma migration.
- **Não validado.** Esta análise **só será avaliada depois que o app estiver
  pronto** — antes disso, não serve de base para decisão nem para começar
  trabalho.
- **Sujeito a mudança por completo.** O desenho abaixo pode ser descartado
  inteiro; ele existe para documentar o que foi investigado, não para ser
  seguido.
- Análise feita sobre o repositório do app em `test.design-local`, commit
  `ea90086`. Quanto mais o app evoluir, mais desatualizada ela fica.

## A ideia

Um segundo produto — **Ofertaki Business** — como painel web para os próprios
supermercados, com:

- **Dashboard**: ofertas ativas, visualizações, favoritos, gráficos de
  desempenho
- **Gerenciar ofertas**: listar, criar, editar, duplicar, excluir
- **Relatórios**: gráficos e tabelas de desempenho das promoções
- **Perfil da loja**: logo, nome, endereço, telefone, redes sociais

Com dois requisitos que definem o desenho:

1. As ofertas publicadas pela loja **aparecem automaticamente no app**
2. O dashboard é alimentado por **visualizações reais dos usuários**

## O que a análise encontrou no schema atual

### 1. O trigger de pontos destruiria o ranking (achado mais grave)

`supabase/migrations/0010_gamification.sql:42` — o trigger
`points_on_promotion_create` dá **+10 pontos a quem publica, em toda inserção
em `promotions`, sem exceção**.

Se o supermercado publica pelo painel, ele pontua e entra no ranking mensal. Um
mercado publicando em volume dominaria o ranking em dias, e a gamificação —
que é o motor de engajamento da comunidade — perderia o sentido.

Qualquer implementação do Business **precisa** resolver isso antes de existir.

### 2. `mercados` não tem dono nem perfil

`0007_mercados.sql` — a tabela é só `id`, `name`, `slug`, `is_active`.

- Não existe vínculo entre uma conta e um mercado: não dá para dizer "este
  usuário administra o Assaí".
- Não existem os campos de perfil que o painel quer editar (logo, endereço,
  telefone, redes sociais).

### 3. Não existe "publicado pela loja"

`0003_promotions.sql` — `user_id` é `not null` e referencia `profiles`. Toda
promoção pertence a uma pessoa da comunidade; não há como distinguir origem.

### 4. Não existe rastreamento de visualização

Nenhuma tabela do banco registra visualização de promoção. O requisito de
métricas reais não tem base hoje — precisaria ser construído do zero.

## Esboço de arquitetura (não é prescrição)

### Reusar o padrão de associação que já existe

`0019_lista_compartilhada.sql` já resolve exatamente esta classe de problema —
vários usuários com papéis diferentes sobre um recurso:

- tabela `lista_membros (lista_id, user_id, role check in ('dono','convidado'))`
- helpers `my_lista_id()` e `is_lista_dono()`, ambos `stable`,
  `security definer set search_path = public`, com
  `grant execute ... to authenticated`, chamados de dentro das policies
- `lista_convites` para entrada por código

O equivalente para o Business seria `mercado_membros (mercado_id, user_id,
role)` com helpers no mesmo formato — e o mesmo padrão de convite serviria para
a loja adicionar funcionários.

**O ponto conceitual**: a permissão vem da **associação usuário↔mercado**, não
de uma marca no usuário. Isso é o que permite vários funcionários por loja, uma
pessoa gerenciando mais de uma unidade, e revogar acesso apagando uma linha.

### Esboço do schema

```sql
-- quem administra qual loja
create table mercado_membros (
  mercado_id uuid references mercados(id),
  user_id    uuid references profiles(id),
  role       text check (role in ('dono','editor'))
);

-- perfil da loja
alter table mercados
  add column logo_url text,
  add column address  text,
  add column phone    text,
  add column social   jsonb;

-- origem da promoção
alter table promotions
  add column store_id uuid references mercados(id),
  add column source   text not null default 'community'
      check (source in ('community','store'));
```

Com `source`, o trigger de pontos ganha uma guarda (`if new.source = 'store'
then return new;`) e o ranking fica preservado.

### O painel não precisa de backend

Como toda a autorização do projeto já vive na RLS (44 policies, todas via
`auth.uid()`), o painel web seria **mais um cliente RLS** usando a `anon key` —
sem backend próprio e sem `service_role`. As policies distinguem quem é membro
de qual loja.

Isso também responde à pergunta que originou a análise ("dois backends sem
interferir"): aqui **não se separa em schemas**, porque os dois produtos operam
sobre as mesmas entidades (`promotions`, `mercados`) — separar criaria escrita
cruzada, que é pior que o problema que resolveria.

Risco a controlar: **um único repositório deve ser dono das migrations**. Dois
repositórios rodando `supabase db push` no mesmo banco brigam pela tabela de
controle de migrations.

### Métricas

Uma linha por visualização cresce rápido e o dashboard não pode fazer
`count(*)` nisso a cada carregamento. O padrão seria eventos crus +
agregação diária (`pg_cron`), com o painel lendo só o agregado.

Para "favoritos", o sinal já existe: `lista_compras` — quando alguém salva a
oferta na lista de compras. É a métrica mais valiosa disponível, porque indica
intenção real de compra.

## Questões em aberto (decisão humana, não técnica)

1. **Oferta de loja aparece igual à da comunidade no feed?** O app se sustenta
   em "preço confirmado por quem esteve na loja hoje". Oferta publicada pelo
   próprio mercado é publicidade. Misturar sem distinção pode corroer a
   confiança, que é o ativo do produto.
2. **Como verificar que quem se cadastrou como "Assaí" é mesmo o Assaí?** Sem
   isso, qualquer pessoa reivindica qualquer loja.
3. **A loja participa do ranking de alguma forma paralela, ou fica fora?**

## Se isto for validado um dia

A decisão migra para `decisions.md` no formato de ADR usado lá (Contexto /
Decisão / Alternativas / Consequências), e este registro é removido ou marcado
como superado. Enquanto estiver aqui, continua valendo o cabeçalho: **não
decidido**.
