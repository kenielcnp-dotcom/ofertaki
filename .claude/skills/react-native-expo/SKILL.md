# Skill: React Native + Expo

Padrões de desenvolvimento do Ofertaki. Consultar antes de implementar qualquer
feature, tela ou componente.

## Expo SDK 54

A API do Expo mudou bastante entre versões. Consultar a **documentação
versionada** (https://docs.expo.dev/versions/v54.0.0/) antes de escrever código
que dependa de API do Expo — não confiar em memória nem em exemplo de blog.

## Estrutura de pastas

| Pasta | Conteúdo |
|---|---|
| `src/screens/` | uma pasta por área (`feed/`, `lista/`, `promotion/`...) |
| `src/navigation/` | stacks, tabs e `types.ts` com os `ParamList` |
| `src/components/common/` | UI genérica, sem lógica de dados |
| `src/components/<domínio>/` | UI específica (`promotion/`, `ranking/`, `forms/`, `auth/`) |
| `src/hooks/` | um hook por caso de uso, envolvendo services com React Query |
| `src/services/` | acesso ao Supabase — um `*.service.ts` por entidade |
| `src/contexts/` | Context API (hoje só `AuthContext`) |
| `src/theme/` | tokens de design |
| `src/types/` | tipos; `database.types.ts` é **gerado**, não editar à mão |
| `src/utils/` | funções puras (formatação, validação) |

## Regra de camadas (a mais importante)

```
Tela → hook → service → supabase
```

- **Tela nunca chama `supabase` direto.** Se precisar de dado novo, criar/estender
  um service e um hook.
- **Service devolve `{ data, error }`**; quem lança o erro é o hook, para o
  React Query registrar a falha.
- **Regra de negócio que precisa ser confiável vive no banco** (RLS, triggers),
  não no cliente — o cliente é público e pode ser manipulado.

## Componentes

- Componentes funcionais com TypeScript, tipando as props direto (sem
  `React.FC`), export **nomeado** (`export function Button(...)`).
- Um componente por arquivo, nome do arquivo = nome do componente (PascalCase).
- `StyleSheet.create` no fim do arquivo, sempre usando os tokens de
  `src/theme/` — nunca hex, spacing ou radius solto.
- Ícones: `Ionicons` de `@expo/vector-icons`, tipados com
  `keyof typeof Ionicons.glyphMap`.

## Estado

- **Servidor/cache**: TanStack React Query. Listas paginadas usam
  `useInfiniteQuery` com `getNextPageParam` devolvendo `undefined` quando a
  página vier menor que o `PAGE_SIZE`.
- **Sessão/perfil**: `useAuthContext()` — não duplicar sessão em estado local.
- **UI local**: `useState`/`useReducer`.
- Depois de uma mutação, **invalidar a query** em vez de escrever contador na
  mão — os contadores são calculados por trigger no banco.

## Dados e tipos

- Nunca `any`. Tipos de tabela vêm de `database.types.ts`; tipos compostos
  (com relação aninhada) ficam em `src/types/` (ex.: `PromotionWithMarket`).
- Ao mudar o schema: migration → aplicar → **regerar** `database.types.ts`.
- Validação de formulário com Zod, em `src/utils/validation.ts`.

## Performance

- Listas sempre com `FlatList` — nunca `.map` dentro de `ScrollView`.
- Imagens remotas com dimensão explícita e skeleton durante o carregamento.
- Memoizar componente de item de lista.

## Estados de tela (obrigatórios)

Toda tela que carrega dados precisa dos quatro:
**loading** (`Skeleton`/`PromotionCardSkeleton`, não `ActivityIndicator` solto),
**vazio** (`EmptyState`), **erro** (`ErrorState` com retry) e **sucesso**.

## Acessibilidade

- Todo elemento interativo com `accessibilityRole` e `accessibilityLabel`.
- Alvo de toque mínimo ~44px — usar `hitSlop`/`minHeight` quando o visual for
  menor.
- Imagem decorativa: `accessibilityElementsHidden` /
  `importantForAccessibility="no-hide-descendants"`.

## Texto

Todo texto visível é em pt-BR. Formatação de preço, tempo relativo e pontos usa
`src/utils/formatters.ts` (`formatPrice`, `formatRelativeTime`, `formatPoints`)
— não reimplementar.

## Verificação antes de concluir

`npx tsc --noEmit` limpo. Testes automatizados ainda não existem (ver
`.claude/memory/roadmap.md`).

## Antes de abrir mão de um padrão existente

Se a implementação exigir fugir de algo descrito aqui, registrar o porquê em
`.claude/memory/decisions.md` em vez de divergir silenciosamente.
