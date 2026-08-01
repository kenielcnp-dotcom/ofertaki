# Arquitetura Atual

> Este arquivo descreve o estado atual da arquitetura. O porquê de cada
> escolha fica em `decisions.md`; o histórico de mudanças em `changelog.md`.

## Stack

| Camada | Escolha |
|---|---|
| App | React Native 0.81 + Expo SDK 54 |
| Linguagem | TypeScript (strict) |
| Navegação | React Navigation — `native-stack` + `bottom-tabs` |
| Estado de servidor/cache | TanStack React Query v5 |
| Estado de sessão/usuário | `AuthContext` (Context API) |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Autenticação | Supabase Auth, sessão persistida em AsyncStorage |
| Validação | Zod |
| Fontes | `@expo-google-fonts` (Outfit + DM Sans), carregadas em `App.tsx` |
| Imagens | `expo-image-picker` + `expo-image-manipulator` → Supabase Storage |
| Build/release | EAS Build (`eas.json` com development/preview/production) |

## Estrutura de pastas

```
App.tsx           # providers: SafeArea → QueryClient → Auth → RootNavigator
index.ts          # registerRootComponent
src/
  components/
    common/       # Button, Input, Card, Avatar, Badge, EmptyState, ErrorState,
                  # IconButton, ScreenHeader, SectionHeader, Skeleton
    promotion/    # PromotionCard, PromotionCardSkeleton, ActionPill, ReportModal
    ranking/      # RankingItem
    forms/        # MarketSelect
    auth/         # AuthHeader
  config/env.ts   # lê EXPO_PUBLIC_* e falha cedo se faltar
  contexts/       # AuthContext (sessão + perfil)
  hooks/          # um hook por caso de uso, envolvendo os services com React Query
  navigation/     # RootNavigator, AuthStack, MainStack, MainTabs, types
  screens/        # auth/, feed/, lista/, notifications/, profile/, promotion/, ranking/
  services/       # um *.service.ts por entidade + supabase/client.ts
  theme/          # colors, spacing, radius, typography (+ fonts, shadows)
  types/          # database.types.ts (gerado), promotion, user, ranking
  utils/          # formatters (preço/tempo/pontos), validation
supabase/migrations/  # 0001–0015, fonte da verdade do schema
```

Convenções de nomenclatura dentro dessa estrutura:
`.claude/memory/conventions.md`.

## Fluxo de dados

```
Tela (src/screens)
   │
   ▼
Hook de dados (src/hooks) — React Query: cache, loading, erro, paginação
   │
   ▼
Service (src/services/*.service.ts) — monta a query
   │
   ▼
supabase client (src/services/supabase/client.ts)
   │
   ▼
Postgres + RLS (supabase/migrations)
```

Regras que sustentam esse fluxo:

- **Telas não chamam o Supabase direto** — sempre via hook → service.
- **Services não contêm regra de negócio crítica** — a regra que precisa ser
  confiável vive no banco (RLS, triggers, `SECURITY DEFINER`), porque o cliente
  é público e pode ser manipulado.
- **Contadores e pontuação nunca são escritos pelo cliente**: `likes_count`,
  `confirmations_count`, `comments_count`, `reports_count`,
  `promotions.status` e `profiles.reputation_score` têm `REVOKE` de coluna e
  só são alterados por triggers.

## Navegação (alto nível)

```
RootNavigator  (escolhe pela sessão)
├── AuthStack   → Welcome · Login · SignUp · ForgotPassword
└── MainStack   → MainTabs · PromotionDetail · Ranking
                   └── MainTabs: Home · Lista · Publicar · Alertas · Perfil
```

Mapa detalhado: `.claude/docs/navigation.md`.

## Integrações externas

- **Supabase** — único backend (banco, auth, storage de imagens, realtime das
  notificações).
- Nenhum analytics, crash reporting ou serviço de push externo configurado
  ainda. Registrar aqui quando entrar.
