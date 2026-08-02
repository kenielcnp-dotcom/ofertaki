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
**Objetivo**: descobrir promoções ativas. Lista paginada com busca full-text,
filtro por mercado + ordenação (mais recente/mais confirmado) via
`FilterModal`, e chips de departamento (`DepartmentChips`: Todas, Alimentos,
Bebidas, Higiene, Limpeza, Açougue, Hortifruti). Cabeçalho tem logotipo
bicolor ("Ofert" branco + "aki" laranja) e 3 ícones à direita — troféu
(Ranking), sino (Alertas, com bolinha quando há notificação não lida) e
perfil (Perfil) — atalho pras mesmas telas já acessíveis pelas abas de baixo.
**Dados**: `usePromotions` (`useInfiniteQuery`, páginas de 20, aceita
`departmentId`/`marketId`/`sort`), `useDepartments`, `useMarkets`,
`useNotifications` (só `unreadCount`, sem query nova — cache compartilhado).
**Estados**: skeleton (`PromotionCardSkeleton`), vazio (`EmptyState`), erro com
retry (`ErrorState`), pull-to-refresh, paginação ao chegar no fim.

### ListaScreen — "Lista"
**Rota**: `Lista` · **Objetivo**: lista de compras, colaborativa entre quem
foi convidado (migration `0019` — antes era 100% individual). Cabeçalho com
botão "pessoas" (abre `ShareListModal`) e bolinha com a contagem de membros
quando > 1. Itens vindos de uma promoção **ou** de texto livre; cada item
mostra quem adicionou. A `FlatList` principal mostra **só os pendentes**
(`!is_purchased`) — cada linha tem um botão único ("Aproveitei essa oferta",
laranja, para item ligado a promoção; "Marcar como comprado", verde, para
item de texto livre) que marca como comprado **e** tira o item da lista de
pendentes ao mesmo tempo (não existe mais checkbox + "Remover" separados).
Empty state muda conforme o caso: nunca teve item vs. "Tudo comprado por
aqui!" quando só falta o que já foi comprado. Mostra `SavingsPanel` no topo
(soma do `original_price - price` das promoções marcadas como compradas **por
mim** neste mês — a economia é sempre individual, mesmo numa lista
compartilhada) — some quando não há nenhum item comprado no mês (nem os sem
preço, usados só no histórico).
**Dados**: `useListaCompras` (itens + `monthlySavings.{total,count,items}` +
`listaId` — `items` do `monthlySavings` inclui compras de texto livre, sem
entrar no total/contagem de economia), `useListaCompartilhada` (membros,
código de convite, entrar/remover — usado tanto pelo badge do cabeçalho
quanto pelo `ShareListModal`). Sincroniza em tempo real via Realtime quando
outro membro mexe na lista.
**Estados**: skeleton, vazio (nunca teve item), vazio (tudo comprado), erro
com retry.

**`ShareListModal`** (`src/components/lista/ShareListModal.tsx`): lista de
membros (dono pode remover convidados), código de convite de 6 caracteres
(só o dono vê/gera — `Compartilhar código` via `Share` nativo do RN, sem
dependência nova) e campo "Entrar com um código" para trocar de lista. Não
existe deep link real ainda (app sem scheme configurado — ver
`known-issues.md`), então o convite é sempre um código colado à mão, não um
link clicável.

### CreatePromotionScreen — "Publicar"
**Rota**: `Publicar` (botão central da tab bar)
**Objetivo**: publicar uma promoção — foto tirada na hora pela câmera, título,
descrição, preço, **valor sem promoção** (obrigatório, precisa ser ≥ preço),
mercado (`MarketSelect`) e **departamento** (`DepartmentSelect`, obrigatório —
Alimentos/Bebidas/Higiene/Limpeza/Açougue/Hortifruti). Categoria "Mercado"
(tabela `categories`, eixo diferente) continua atribuída automaticamente.
Botão de foto abre a câmera direto (`launchCameraAsync`), não a galeria — ver
`.claude/memory/decisions.md`.
**Dados**: `useMarkets`, `useDepartments`, `useImageUpload` (Storage), `useCreatePromotion`.
**Estados**: validação por campo (inclui "valor sem promoção não pode ser
menor que o preço"), permissão de câmera negada (mensagem explicando o
motivo), upload em progresso, erro de envio.

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
