# Navegação

Navegação via **React Navigation** (`@react-navigation/native-stack` +
`@react-navigation/bottom-tabs`). Não usamos Expo Router — as rotas são
declaradas em código, em `src/navigation/`.

## Estrutura

```
RootNavigator (src/navigation/RootNavigator.tsx)
│  escolhe pela sessão do AuthContext; mostra spinner enquanto loading
│
├── AuthStack (sem sessão)          headerShown: false
│   ├── Welcome            (inicial)
│   ├── Login
│   ├── SignUp
│   └── ForgotPassword     (header visível, título "Redefinir senha")
│
└── MainStack (com sessão)
    ├── MainTabs           headerShown: false
    │   ├── Home          → FeedScreen
    │   ├── Lista         → ListaScreen
    │   ├── Publicar      → CreatePromotionScreen   (botão central elevado)
    │   ├── Notificacoes  → NotificationsScreen     (label "Alertas")
    │   └── Perfil        → ProfileScreen
    ├── PromotionDetail    { promotionId: string }   título "Promoção"
    └── Ranking            título "Ranking"
```

## Tipos de rota

Definidos em `src/navigation/types.ts`: `AuthStackParamList`,
`MainTabParamList`, `RootStackParamList`. Telas dentro das abas usam
`MainTabScreenProps<T>` (`CompositeScreenProps`) porque precisam navegar para
rotas do stack pai (`PromotionDetail`, `Ranking`).

## Decisões de navegação

- **"Publicar" é o botão central elevado** da tab bar (laranja, `shadows.floating`),
  não uma aba comum — é a ação principal do app.
- **Busca faz parte da Home**, não é aba própria (a `SearchScreen` antiga foi
  removida).
- **Ranking é acessado pelo Perfil**, não pela tab bar.
- Racional completo em `.claude/memory/decisions.md`.

## Ao adicionar uma rota

1. Declarar a rota no `ParamList` correspondente em `types.ts`.
2. Registrar a `Stack.Screen`/`Tab.Screen` no arquivo do navigator.
3. Atualizar este documento e `.claude/docs/screens.md`.
