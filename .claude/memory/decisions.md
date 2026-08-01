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
