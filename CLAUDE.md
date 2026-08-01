# Ofertaki — Memória Principal do Projeto

Este arquivo é o ponto de entrada de todo trabalho feito com Claude Code neste
repositório. Toda conversa/tarefa deve começar lendo estas instruções antes de
tocar em código.

## O que é o Ofertaki

Ofertaki é um app mobile (React Native + Expo) de **promoções de supermercado
compartilhadas pela comunidade**. Os usuários publicam promoções que encontram
(foto, preço, mercado), e a comunidade curte, comenta e **confirma** se o preço
está correto. Cada usuário mantém uma lista de compras pessoal, ganha pontos por
contribuir e disputa um ranking mensal.

Detalhes de produto, público-alvo e features centrais: `.claude/docs/app-overview.md`.

## Stack

- **App**: React Native + Expo SDK 54, TypeScript
- **Navegação**: React Navigation (native-stack + bottom-tabs) — **não** Expo Router
- **Estado de servidor**: TanStack React Query
- **Estado de sessão**: `AuthContext` (Context API) + Supabase Auth
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime)
- **Estilo**: design system próprio em `src/theme/` — ver `.claude/memory/design-system.md`

Detalhe completo em `.claude/memory/architecture.md`. Decisões técnicas
relevantes (e o porquê) ficam em `.claude/memory/decisions.md` — sempre consulte
antes de propor uma mudança de arquitetura, e registre lá qualquer nova decisão
significativa.

## Branch de trabalho

O app real vive na branch **`test.design-local`** — é a branch default do
repositório e a única que reflete o estado atual do app. A `main` está
**obsoleta**: não usar como referência nem como base para trabalho novo.
Contexto em `.claude/memory/decisions.md`.

## Estrutura do projeto

```
ofertaki/
├── CLAUDE.md              # este arquivo — memória principal
├── .claude/
│   ├── memory/             # memória viva do projeto (arquitetura, decisões, roadmap...)
│   ├── docs/                # documentação técnica permanente
│   └── skills/               # conhecimento reutilizável por domínio
├── App.tsx                  # raiz do app (providers, fontes)
├── src/
│   ├── components/          # UI reutilizável
│   ├── contexts/            # AuthContext
│   ├── hooks/               # hooks de dados (React Query)
│   ├── navigation/          # stacks e tabs
│   ├── screens/             # telas
│   ├── services/            # acesso ao Supabase (um service por entidade)
│   ├── theme/               # tokens de design
│   ├── types/               # tipos (inclui database.types.ts gerado)
│   └── utils/               # formatação e validação
├── supabase/migrations/     # migrations SQL (fonte da verdade do banco)
└── assets/                  # imagens, ícones, fontes
```

Descrição detalhada de cada pasta: ver o `README.md` na raiz.

## Fluxo de trabalho esperado

```
Usuário
   │
   ▼
CLAUDE.md
   │
   ▼
Skills (.claude/skills/*)
   │
   ▼
Memory + Docs (.claude/memory/*, .claude/docs/*)
   │
   ▼
Implementação
```

1. Antes de implementar, consulte a **skill** relevante ao domínio da tarefa
   (`react-native-expo` para código, `ui-design` para telas/componentes,
   `security` para qualquer coisa que toque em auth/rede/armazenamento).
2. Toda decisão, convenção ou aprendizado novo é registrado em **memory**
   para persistir entre sessões — não repita decisões já tomadas, consulte-as
   (`.claude/memory/decisions.md`, `.claude/memory/known-issues.md`).
3. **docs** guarda o estado atual do produto/técnica (não o histórico —
   isso é papel do `.claude/memory/changelog.md`).
4. Ao concluir uma tarefa: rode lint/type-check, atualize a doc técnica
   afetada se algo mudou de contrato, e registre um resumo em
   `.claude/memory/changelog.md` (e em `decisions.md`/`known-issues.md` se
   aplicável).
5. Se o pedido for ambíguo o suficiente para gerar retrabalho, esclareça com
   o usuário antes de implementar, em vez de assumir.

## Regras gerais

- **Idioma**: documentação e comunicação em pt-BR; código, nomes de
  variáveis/funções/arquivos e commits em inglês. Texto visível ao usuário
  dentro do app é em pt-BR.
- **Expo SDK 54**: consultar a documentação versionada
  (https://docs.expo.dev/versions/v54.0.0/) antes de escrever código que
  dependa de API do Expo — a API mudou bastante entre versões.
- **Nunca** duplicar informação entre `memory/` e `docs/` — `docs/` descreve
  o "como é hoje" (referência), `memory/` descreve "como chegamos aqui e o
  que vem a seguir" (histórico e decisões).
- Antes de propor uma nova convenção, verifique se já existe uma em
  `.claude/memory/conventions.md`.
- **Banco de dados**: toda mudança de schema é uma migration nova em
  `supabase/migrations/` — nunca alterar o banco só pelo dashboard. Depois de
  aplicar, regerar `src/types/database.types.ts`.
- Toda mudança de arquitetura relevante deve gerar uma entrada em
  `.claude/memory/decisions.md` e, se aplicável, em `.claude/memory/changelog.md`.

## Sobre esta base de conhecimento

Esta é a versão **essencial** de uma estrutura mais ampla de conhecimento
Claude Code (que também incluía agentes especialistas, prompts reutilizáveis e
templates), mantida em `kenielcnp-dotcom/Claude.md`. Aqui ficou só a parte que
resolve o problema real de um projeto solo: persistir contexto entre sessões
(`memory/`) e documentação técnica de referência (`docs/` e `skills/`). Ver o
racional completo em `.claude/memory/decisions.md`.
