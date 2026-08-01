# Convenções de Código

## Nomenclatura

- Componentes: `PascalCase` (arquivo e export com o mesmo nome), **export
  nomeado** — o app não usa default export em componentes.
- Telas: `PascalCase` terminando em `Screen` (`FeedScreen`, `RankingScreen`).
- Hooks: `useAlgumaCoisa.ts`, sempre prefixo `use`.
- Services: `<entidade>.service.ts` (snake/lowercase), exportando um objeto
  `<entidade>Service` com os métodos.
- Utilitários/funções puras: `camelCase`.
- Tipos/interfaces: `PascalCase`, sem prefixo `I`.
- Constantes de módulo: `SCREAMING_SNAKE_CASE` (ex.: `PAGE_SIZE`).
- Rotas: `PascalCase` nos `ParamList` (`PromotionDetail`, `MainTabs`).

## Organização

- Uma pasta por área em `src/screens/` (`feed/`, `lista/`, `promotion/`...).
- `src/components/common/` para UI genérica; `src/components/<domínio>/` para
  UI específica.
- `StyleSheet.create` sempre no fim do arquivo do componente.
- Tipos de tabela sempre derivados de `database.types.ts`; tipos compostos em
  `src/types/`.

## Estilo de código

- TypeScript estrito (`strict: true`), sem `any` não justificado.
- Aspas simples, ponto e vírgula.
- Props tipadas direto (`type XProps = { ... }`), sem `React.FC`.
- Comentário só quando explica **por quê** (uma linha) — o código já diz o quê.
- Sem `console.log` em código commitado.

## Camadas (regra dura)

Tela → hook → service → supabase. Tela nunca importa o cliente do Supabase
direto. Detalhe em `.claude/skills/react-native-expo/SKILL.md`.

## Banco de dados

- Toda mudança de schema é uma **migration nova** e numerada em
  `supabase/migrations/` (`00NN_descricao.sql`) — nunca editar uma já aplicada.
- Depois de aplicar, regerar `src/types/database.types.ts`.
- Nomes de tabela/coluna em `snake_case`. Tabelas existentes usam pt-BR quando
  o termo é do domínio local (`mercados`, `lista_compras`) e en-US no resto
  (`promotions`, `likes`, `reports`) — manter o padrão da tabela vizinha ao
  adicionar algo relacionado.

## Idioma

- Código, nomes de arquivo e commits em **inglês**.
- Documentação, comentários e **todo texto visível ao usuário** em **pt-BR**.

## Commits

- Mensagens em inglês, modo imperativo (`add`, `fix`, `refactor`).
- Prefixo de tipo quando útil: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Um commit = uma unidade coerente de mudança.

## Verificação

- `npx tsc --noEmit` limpo antes de concluir qualquer tarefa.
- `supabase migration list` com local == remote quando houver migration nova.
- Testes automatizados ainda não existem no projeto — quando entrarem, arquivo
  ao lado do testado (`nome.test.ts(x)`), com nome descrevendo comportamento
  (`"mostra estado vazio quando a lista está vazia"`).
