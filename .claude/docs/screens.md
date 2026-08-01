# Inventário de Telas

> Atualizar sempre que uma tela nova for criada. Mapa de rotas:
> `.claude/docs/navigation.md`.

## Autenticação (`src/screens/auth/`)

### WelcomeScreen
**Rota**: `Welcome` (inicial do `AuthStack`)
**Objetivo**: primeira impressão da marca e escolha entre entrar ou criar conta.
Foto de fundo + logo.

### LoginScreen
**Rota**: `Login` · **Objetivo**: entrar com e-mail e senha.
Inputs com ícone e toggle de senha; link para "esqueci a senha" e para cadastro.

### SignUpScreen
**Rota**: `SignUp` · **Objetivo**: criar conta.
O perfil é criado automaticamente pelo trigger `handle_new_user`. Quando o
Supabase já devolve sessão ativa (confirmação de e-mail desligada), vai direto
para o app — o aviso de "confirme seu e-mail" só aparece quando realmente não
veio sessão.

### ForgotPasswordScreen
**Rota**: `ForgotPassword` (header visível) · **Objetivo**: enviar e-mail de
redefinição. O usuário redefine no navegador e volta para logar manualmente
(sem deep link ainda — ver `known-issues.md`).

## Principais (`MainTabs`)

### FeedScreen — "Home"
**Rota**: `Home` · **Arquivo**: `src/screens/feed/FeedScreen.tsx`
**Objetivo**: descobrir promoções ativas. Lista paginada (mais recentes
primeiro) com busca full-text integrada ao cabeçalho.
**Dados**: `usePromotions` (`useInfiniteQuery`, páginas de 20).
**Estados**: skeleton (`PromotionCardSkeleton`), vazio (`EmptyState`), erro com
retry (`ErrorState`), pull-to-refresh, paginação ao chegar no fim.

### ListaScreen — "Lista"
**Rota**: `Lista` · **Objetivo**: lista de compras pessoal e privada.
Itens vindos de uma promoção **ou** de texto livre; checkbox "comprado" com
`hitSlop` para alvo de toque acessível.
**Dados**: `useListaCompras`.
**Estados**: skeleton, vazio, erro com retry.

### CreatePromotionScreen — "Publicar"
**Rota**: `Publicar` (botão central da tab bar)
**Objetivo**: publicar uma promoção — foto tirada na hora pela câmera, título,
descrição, preço e mercado (`MarketSelect`). Categoria "Mercado" é atribuída
automaticamente. Botão de foto abre a câmera direto (`launchCameraAsync`), não
a galeria — ver `.claude/memory/decisions.md`.
**Dados**: `useMarkets`, `useImageUpload` (Storage), `useCreatePromotion`.
**Estados**: validação por campo, permissão de câmera negada (mensagem
explicando o motivo), upload em progresso, erro de envio.

### NotificationsScreen — "Alertas"
**Rota**: `Notificacoes` · **Objetivo**: ver quem interagiu com suas promoções.
Atualiza em tempo real (Supabase Realtime); marcar como lida e marcar todas.
**Dados**: `useNotifications`.
**Estados**: skeleton, vazio, erro com retry.

### ProfileScreen — "Perfil"
**Rota**: `Perfil` · **Objetivo**: dados do próprio usuário, reputação, acesso
ao Ranking e logout.
**Dados**: `AuthContext` (`profile`).

## Stack (`MainStack`)

### PromotionDetailScreen
**Rota**: `PromotionDetail` (`{ promotionId }`) · **Objetivo**: detalhe da
promoção — imagem, preço, mercado, autor, comentários, e as ações de curtir /
confirmar (`ActionPill`) e denunciar (`ReportModal`).
**Dados**: `usePromotionDetail`, `useReportPromotion`.
**Estados**: skeleton, erro com retry, ações em `loading`. Curtir/confirmar a
própria promoção é bloqueado (RLS + UI).

### RankingScreen
**Rota**: `Ranking` (acessada pelo Perfil) · **Objetivo**: ranking mensal Top 50
com medalhas para os três primeiros; se o usuário estiver fora do Top 50, sua
posição aparece separadamente.
**Dados**: `useMonthlyRanking` (RPC `get_monthly_ranking`).
**Estados**: skeleton, vazio, erro com retry.
