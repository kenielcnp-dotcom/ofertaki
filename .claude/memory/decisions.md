# Decisões (ADR log)

Registro de decisões técnicas e de produto relevantes, na ordem em que
foram tomadas. Formato por entrada:

```
## [AAAA-MM-DD] Título da decisão
**Contexto**: por que essa decisão precisou ser tomada.
**Decisão**: o que foi decidido.
**Alternativas consideradas**: o que mais foi avaliado e por que não foi escolhido.
**Consequências**: impacto esperado, o que fica mais difícil/fácil.
```

---

## [2026-08-02] Testes automatizados com Jest + RNTL v14 (Fase 6 parte 2)

**Contexto**: o projeto não tinha nenhum teste automatizado; a Fase 6 parte 1
(erro/retry, skeleton, acessibilidade, RLS) foi entregue com testes adiados
para uma rodada própria.

**Decisão**:
- `jest-expo` (preset) + `jest` + `@testing-library/react-native`, todos na
  versão pinada pelo SDK 54 (`npx expo install`), como devDependencies —
  ferramenta de teste não vai pro bundle.
- `"types": ["jest"]` no `tsconfig.json` pros globals dos testes.
- Testes começam pelas **utilidades puras** (`formatters`, `promotionInsights`,
  `validation`) — nenhum mock de rede, máquina de estados controlada com
  `jest.useFakeTimers()`/`jest.setSystemTime()` — e depois por componentes
  puros (`StarRating`).
- **RNTL v14 mudou a API**: `render` e `fireEvent` são **assíncronos**
  (retornam Promise). Convenção: `await render(...)` e `await
  fireEvent.press(...)` em todo teste. (A doc do Expo mostra `await render`
  justamente por causa disso — não é render async/concurrent, é o padrão novo.)
- `expo-asset` entrou como dependência direta: o `expo-font` hoisted não
  resolvia o pacote (estava aninhado em `node_modules/expo/node_modules/`),
  quebrando o Jest — o Metro tolera, o resolver do Jest não.

**Alternativas consideradas**: Detox/Maestro (E2E) — adiado, exige emulador e
muito setup; fica como possibilidade futura (ver `roadmap.md`).

**Consequências**: base para adicionar testes às telas/hooks conforme o app
cresce; o custo de mock do Supabase/React Navigation/Realtime fica para quando
um teste de tela for realmente necessário.

---

## [2026-08-02] Lista de compras vira compartilhável por código (`listas`/`lista_membros`/`lista_convites`)

**Contexto**: o usuário pediu pra validar a ideia de compartilhar a lista de
compras com convidados (ex: pessoas da mesma casa), mantendo o painel de
economia funcionando. Antes de codificar, uma prévia (Artifact) foi montada e
aprovada com três decisões de produto: (1) economia continua **individual**
mesmo numa lista compartilhada; (2) convite por **código**, não busca de
usuário; (3) qualquer convidado **edita de verdade** (adiciona/remove/marca
comprado), não é "convidado só lê". Isso supersede a decisão antiga "`lista_compras`
é lista de compras pessoal" — deixa de ser sempre privada, mas continua sendo
uma lista só (sem suporte a múltiplas listas por usuário, opção rejeitada
explicitamente em favor de "compartilhada com convidados").

**Decisão** (migration `0019`):
- Tabela nova `listas` — **de propósito sem `owner_id`**: quem é dono/convidado
  vive só em `lista_membros` (`lista_id`, `user_id`, `role`,
  `unique (user_id)`), pra não duplicar esse fato em dois lugares.
  `unique (user_id)` implica que cada usuário pertence a **no máximo uma
  lista por vez** — dono da própria ou convidado em uma de outra pessoa.
- Helpers `SECURITY DEFINER` (`my_lista_id()`, `is_lista_dono()`) usados
  **dentro das RLS policies** de `listas`/`lista_membros`/`lista_compras` —
  primeiro caso do projeto de uma policy que precisaria consultar a própria
  tabela que protege; o helper evita a recursão (padrão recomendado pelo
  Supabase).
- `lista_compras.user_id` muda de significado: era "dono exclusivo", passa a
  ser "quem adicionou o item". `purchased_by` (novo) registra quem marcou
  como comprado — é o que permite a economia mensal continuar somando só o
  que **o próprio usuário** comprou, mesmo com itens de outros membros na
  mesma lista.
- Convite é um **código de 6 caracteres**, não um link clicável de verdade —
  o app não tem deep link/scheme configurado ainda (mesma limitação já
  documentada pro reset de senha), então um link não abriria o app sozinho.
  `redeem_lista_convite(code)` **bloqueia** a troca de lista se a lista atual
  do usuário já tem itens ou outras pessoas — nunca abandona dados em
  silêncio; só deixa trocar quando a lista atual está genuinamente vazia.
- Só o dono gera/regenera o código e remove convidados (RPCs
  `get_or_create_lista_convite`/`regenerate_lista_convite` levantam exceção
  se quem chama não for dono da própria lista atual).

**Alternativas consideradas**:
- `listas.owner_id` como coluna própria — descartada: `lista_membros.role =
  'dono'` já é a mesma informação; manter as duas correria risco de
  divergência sem necessidade.
- Permitir múltiplas listas por usuário — rejeitada explicitamente pelo
  usuário ao escolher "compartilhada com convidados" em vez de "múltiplas
  listas por usuário" numa pergunta direta.
- Deep link real pro convite — adiado; ver `known-issues.md` (mesma
  dependência do reset de senha).

**Consequências**: `lista_compras` ganhou `REPLICA IDENTITY FULL` (exigido
pra eventos de `DELETE` do Realtime carregarem `lista_id`, usado no filtro do
canal). O índice único de "promoção já está na lista" passou de
`(user_id, promotion_id)` para `(lista_id, promotion_id)`. Testado
ponta-a-ponta com dois usuários reais (Playwright, dois `BrowserContext`
separados): item adicionado por A aparece pra B após entrar com o código,
compra marcada por B chega em A via Realtime, e o painel de economia de A
continua correto (não conta a compra de B).

---

## [2026-08-02] Cabeçalho da Home: departamentos reais em vez de reaproveitar `categories`

**Contexto**: o usuário mandou um modelo de header com chips "Alimentos /
Bebidas / Higiene / Limpeza / Açougue / Hortifruti" e pediu categorização de
verdade (escolher departamento ao publicar + filtrar a Home por ele). Já
existia uma tabela `categories` (Mercado/Farmácia/Eletrônicos/Casa/Outros),
mas ela representa **tipo de estabelecimento** — sempre fixada em "Mercado"
no MVP, nunca exposta em UI (a pendência "Filtro por categoria na Home" do
`roadmap.md` era sobre essa mesma tabela).

**Decisão**: tabela nova `departments` (migration `0018`), eixo diferente —
seção **dentro** do supermercado, não tipo de estabelecimento. `categories`
fica intocada. `promotions.department_id` é **nullable** (promoções antigas
não têm valor correto pra backfill); obrigatório só no formulário via `zod`,
mesmo padrão do `originalPrice`.

**Alternativas consideradas**: reaproveitar/repopular `categories` com os 6
departamentos — descartada porque misturaria dois conceitos diferentes
(tipo de loja vs. seção de produto) na mesma tabela, e `category_id`
continua sendo usado (fixo em "Mercado") pelo fluxo de publicação existente.

**Consequências**: resolve a pendência do `roadmap.md` sobre filtro de
categoria — mas para departamentos, não para a `categories` original (essa
continua igual, ainda fora de escopo).

## [2026-08-02] Sino e perfil duplicados no header da Home

**Decisão**: os ícones de notificações e perfil aparecem tanto no header da
Home quanto nas abas de baixo (Alertas, Perfil) — duplicação intencional,
pedida explicitamente pelo usuário ao revisar a prévia. O troféu de ranking
que já estava no header continua, não foi substituído.

## [2026-08-02] Card de promoção elaborado: avaliação, oferta quente e salvar

**Contexto**: o usuário mandou um modelo de card bem mais rico que o atual e
pediu pra usar como referência. Ele já tinha nota por estrelas, selo "oferta
quente" e botão "Salvar" — nenhum dos três existia no app.

**Decisão**:
- **Avaliação**: qualquer usuário logado pode avaliar (1-5 estrelas) a
  qualquer momento, um voto por usuário por promoção, pode trocar depois.
  Não exige ter confirmado a oferta antes.
- **Oferta quente**: regra automática, sem moderação — confirmações altas
  (`>= 10`) nas primeiras 24h desde a publicação. Calculado no cliente a
  partir de dados que já existem (`confirmations_count`, `created_at`), sem
  coluna nova.
- **Salvar**: em vez de uma tabela de favoritos nova, o botão "Salvar" do
  card reaproveita a Lista de compras já existente (`lista_compras` /
  `useListaCompras`) — pressionar adiciona a promoção à lista do usuário,
  pressionar de novo remove. **"Confirmar" continua servindo só pra validar
  que a oferta é real** — as duas ações ficam desacopladas.

**Alternativas consideradas**: tabela de favoritos separada pro "Salvar" —
descartada porque duplicaria o que a Lista de compras já faz (o usuário só
precisa de "isso eu quero comprar", que é exatamente o que a Lista já
representa).

**Consequências**: `avg_rating`/`ratings_count` viram mais dois contadores
protegidos por `REVOKE` em `promotions` (migration `0017`), recalculados do
zero a cada mudança em `ratings` (não são delta incremental, porque o voto
pode ser trocado). O limiar de "oferta quente" (10 confirmações / 24h) é uma
constante em `src/utils/promotionInsights.ts`, fácil de ajustar depois sem
migration.

## Hotbar: 5 abas com "Publicar" central

**Contexto**: o plano original tinha Busca e Ranking como abas próprias, o que
diluía a ação principal do app (publicar uma promoção).

**Decisão**: hotbar virou Home · Lista · **Publicar** · Alertas · Perfil, com
"Publicar" como botão central elevado. Busca passou a fazer parte da Home;
Ranking virou link a partir do Perfil.

**Consequências**: a ação de maior valor fica a um toque de qualquer lugar do
app; Ranking ficou menos visível (aceitável, é feature de engajamento
secundária).

---

## `lista_compras` é lista de compras pessoal, não "salvos"

> **Atualizado em 2026-08-02**: deixou de ser sempre privada — ver decisão
> "Lista de compras vira compartilhável por código" acima. A parte que
> continua valendo: é conceitualmente separada de like/comentário/confirmação,
> e itens podem ser texto livre.

**Contexto**: risco de confundir "salvar promoção" com curtir/confirmar.

**Decisão**: `lista_compras` é privada por usuário, com checkbox "comprado", e
é conceitualmente separada de like/comentário/confirmação. Itens podem vir de
uma promoção publicada **ou** ser texto livre (`promotion_id` é opcional).

**Consequências**: a Lista funciona mesmo para itens que ninguém publicou —
serve como lista de supermercado de verdade, não só como coleção de favoritos.

---

## Mercados: tabela normalizada `mercados`, não uma tabela por mercado

**Contexto**: o campo "Loja" era texto livre, gerando duplicatas ("Assai",
"Assaí", "assai"). Foi levantada a hipótese de criar uma tabela por mercado.

**Decisão**: tabela única `mercados` normalizada + `promotions.market_id` (FK)
+ índice. No app, "Loja" virou dropdown (`MarketSelect`). Categoria "Mercado" é
atribuída automaticamente (o MVP só cobre mercado, então os chips de categoria
saíram da tela de publicação).

**Alternativas consideradas**: uma tabela por mercado — descartada porque
quebraria a paginação do feed (precisaria de UNION entre N tabelas) e as FKs de
likes/comments/confirmations.

**Consequências**: seed inicial genérico (Carrefour, Extra, Assaí, Pão de
Açúcar, Dia) para ajustar pelo dashboard depois.

---

## Busca full-text em vez de `ilike`

**Contexto**: a busca da Home usava `ilike`, que não lida com acento, plural ou
ordem das palavras, e faz varredura de tabela.

**Decisão**: coluna `search_vector` (`tsvector`) com índice GIN sobre
`title`/`description`, consultada com `websearch` e configuração `portuguese`
(migration `0012`).

**Consequências**: busca tolerante a acento/flexão e com índice; a query passa a
depender do dicionário `portuguese` do Postgres.

---

## Notificações e status de promoção nunca são escritos pelo cliente

**Contexto**: se o cliente pudesse inserir notificação ou alterar
`promotions.status`, daria para forjar notificação e reverter uma remoção
automática por denúncia.

**Decisão**: `notifications` é gerada exclusivamente por trigger (curtida,
comentário, confirmação na promoção de alguém). `promotions.status` recebeu
`REVOKE UPDATE (status)` (migration `0014`). Contadores e `reputation_score`
seguem a mesma regra: só triggers `SECURITY DEFINER` escrevem.

**Consequências**: o cliente perde a capacidade de "otimizar" atualizando o
contador localmente — precisa invalidar a query e reler. É o custo aceito para
manter a integridade.

---

## `SECURITY DEFINER` de uso interno tem `REVOKE EXECUTE`

**Contexto**: o Database Linter do Supabase apontou funções `SECURITY DEFINER`
expostas. Uma delas era um problema real: `adjust_promotion_counter` era
chamável direto via `/rest/v1/rpc` por `anon`/`authenticated` e aceitava o nome
da coluna como texto livre — dava para reescrever qualquer coluna de
`promotions` (inclusive `price`) por fora da RLS.

**Decisão**: whitelist de coluna dentro da função + `REVOKE EXECUTE` em todas as
funções `SECURITY DEFINER` de uso interno (migration `0013`). Só
`get_monthly_ranking` continua pública, de propósito. `set_updated_at` ganhou
`search_path` fixo.

**Consequências**: funções internas passam a ser exclusivamente trigger-only;
qualquer função nova `SECURITY DEFINER` deve nascer com `REVOKE EXECUTE`.

---

## Tipo de retorno de `get_monthly_ranking`: `bigint`, não `integer`

**Contexto**: a RPC declarava `total_points integer`, mas `sum(pl.points)`
retorna `bigint` — toda chamada dava 400 (`structure of query does not match
function result type`) e a `RankingScreen` ficava presa no skeleton.

**Decisão**: corrigido na migration `0015`, com o tipo real.

**Consequências**: lembrete geral — o tipo declarado no `RETURNS TABLE` precisa
bater exatamente com o tipo da expressão; agregações mudam o tipo.

---

## `test.design-local` é a branch de trabalho; `main` está obsoleta

**Contexto**: o time de design entregou telas novas (Welcome com foto de fundo,
`AuthHeader` curvo, Login/SignUp redesenhadas) junto de um rebrand de cor
(verde `#1A5331` + laranja `#E77F43`) aplicado ao app inteiro. A entrega ficou
na branch `test.design-local` em vez de ser mergeada na `main`, e o
desenvolvimento seguiu por ali — as correções posteriores (preparação para
deploy, migration `0015`, `eas.json`, `.env.example`) foram todas para essa
branch.

**Decisão**: `test.design-local` passou a ser a branch que sustenta o app real e
é a **branch default do repositório** no GitHub (`origin/HEAD` aponta para ela).
A `main` ficou para trás e é considerada obsoleta — não serve mais como
referência do estado do app.

**Consequências**:
- Todo trabalho novo parte de `test.design-local`, não da `main`.
- Toda a documentação em `.claude/` descreve o estado dessa branch.
- Não existe mais a tarefa de "trazer o design para a `main`"; se um dia a
  `main` for realinhada, será por reset/substituição, não por merge — e isso
  precisa virar uma decisão própria aqui.

---

## Fora de escopo por decisão consciente

- **Filtro por categoria na Home**: hoje toda promoção usa a categoria "Mercado"
  fixa, então o filtro não teria efeito prático. Volta quando outras categorias
  entrarem.
- **Testes automatizados**: adiados para uma rodada própria (Jest/RNTL, e
  possivelmente Detox/Maestro depois).
- **Correção de contraste de cor**: pendência anotada para o time de design.

---

## Publicar: câmera direto em vez de galeria

**Contexto**: o fluxo de publicar promoção pedia pra escolher uma foto da
galeria; o caso de uso típico é fotografar a oferta na hora, no corredor do
mercado — abrir a galeria é um passo a mais sem necessidade.

**Decisão**: `useImageUpload` passou a abrir a câmera direto
(`launchCameraAsync`/`requestCameraPermissionsAsync`), substituindo o seletor
de galeria (`launchImageLibraryAsync`). O hook também passou a expor um estado
de `error` (permissão negada vs. bloqueada permanentemente vs. falha ao abrir),
porque antes a permissão negada falhava em silêncio.

**Alternativas consideradas**: manter os dois (câmera **e** galeria) com um
seletor — descartado por ora para priorizar velocidade no caminho principal;
pode voltar como opção extra se usuários pedirem (registrar aqui se
reconsiderado).

**Consequências**: publicar fica mais rápido no caso comum; quem quisesse usar
uma foto já existente da galeria não tem mais essa opção nesta tela.

---

## Valor sem promoção obrigatório; painel de economia mensal na Lista

**Contexto**: pedido do usuário para calcular quanto o usuário economiza
comprando pelo Ofertaki. Sem um "preço normal" registrado, não dá pra saber a
diferença — só o `price` da promoção existia.

**Decisão**: `promotions.original_price` (migration `0016`) é **obrigatório**
na publicação (`check (original_price >= price)`), decisão explícita do
usuário para que o painel de economia reflita 100% das compras confirmadas,
sem itens de fora da conta por falta de dado. `lista_compras.purchased_at`
(mesma migration) é mantido por trigger, não pelo client, para o painel poder
filtrar "este mês" de forma confiável. O cálculo em si
(`useListaCompras.monthlySavings`) é derivado em memória a partir dos dados
que a tela já busca — não criou RPC nem query nova.

**Alternativas consideradas**: campo opcional — descartado pelo usuário
porque deixaria o painel subestimando a economia real sempre que alguém não
preenchesse; calcular via RPC/view no banco — descartado por enquanto porque
o volume de itens por usuário é pequeno o suficiente para computar no client
sem custo perceptível (revisitar se a lista de compras crescer muito).

**Consequências**: publicar fica com mais um campo obrigatório (mais fricção
no fluxo), mas o painel de economia é sempre uma soma exata do que foi
confirmado como comprado, sem excluir itens.

---

## Projeto EAS sob a conta de time; sem `RECORD_AUDIO`

**Contexto**: ao rodar `eas login` + `eas build:configure`, o `app.json` ganhou
`extra.eas.projectId`, `owner` e, sem necessidade aparente,
`android.permissions: ["RECORD_AUDIO"]` — nada no app grava áudio.

**Decisão**: manter o projeto sob a conta de **time** `kenieldotcoms-team`
(não a pessoal) e o novo `slug: "ofertaki"` (confirmados pelo usuário).
Remover `android.permissions`/`RECORD_AUDIO` — sem uso real, e pedir
permissão de microfone sem motivo é bandeira vermelha na revisão de loja.

**Consequências**: builds futuros (`eas build`) usam o projeto
`c4ad1e76-89b1-4cda-b7be-73597d5e3d1e`. Se algum dia o app precisar de áudio
de verdade, adicionar a permissão de volta nessa hora, com justificativa.

---

## Base de conhecimento Claude Code: versão essencial, sem agentes/prompts/templates/hooks

**Contexto**: uma estrutura completa de conhecimento Claude Code (`CLAUDE.md` +
`.claude/agents/` [manager, dev, design, marketing] + `.claude/skills/` +
`.claude/memory/` + `.claude/docs/` + `.claude/prompts/` + `.claude/templates/`
+ `.claude/hooks/`) foi preparada num repositório à parte
(`kenielcnp-dotcom/Claude.md`), pensada para times com múltiplos
especialistas/subagentes coordenados por um "manager".

**Decisão**: adotar só o essencial no `ofertaki-app`: `CLAUDE.md` +
`.claude/memory/` + `.claude/docs/` + `.claude/skills/`. Deixar de fora
`.claude/agents/`, `.claude/prompts/`, `.claude/templates/` e `.claude/hooks/`.

**Alternativas consideradas**: estrutura completa — descartada porque os
arquivos de `agents/` não têm o formato que o Claude Code reconhece como
subagente de verdade (sem front-matter `name`/`description`/`tools`), então
funcionariam só como documentação, não como roteamento real; para um projeto
com uma pessoa trabalhando por vez, o "manager" roteando entre
dev/design/marketing tende a ser teatro. `prompts/` e `templates/` são baratos
mas de valor menor sem os agentes que os referenciam como fluxo.

**Consequências**: `memory/` (arquitetura, decisões, convenções, design
system, known issues, roadmap, changelog) e `docs/` (estado técnico atual) são
a parte que resolve o problema real — persistir contexto entre sessões — sem
inflar o repositório com processo que não vai ser seguido de verdade. Se no
futuro houver motivo real para subagentes (ex.: sessões paralelas
design/dev), a estrutura completa pode ser revisitada a partir do repositório
`Claude.md`.
