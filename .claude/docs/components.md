# Inventário de Componentes

> Atualizar sempre que um componente novo for criado ou um existente mudar de
> contrato. Todos usam os tokens de `src/theme/` — nunca valores soltos.

## `src/components/common/`

### Button
Botão principal. Variantes `primary` | `secondary` | `accent` | `ghost` |
`danger`; tamanhos `sm` (40) | `md` (50) | `lg` (56); suporta `icon`
(Ionicons), `loading`, `disabled`, `fullWidth`.

### IconButton
Botão só de ícone, circular. Tons `neutral` | `primary` | `danger` | `onDark`.
Exige `label` (vira `accessibilityLabel`), tem `hitSlop`.

### Input
Campo de texto sobre `TextInputProps`. Suporta `label`, `error`, `hint`, `icon`,
toggle de senha automático quando `secureTextEntry`, estado de foco, e variante
`rounded` para as barras de busca.

### Card
Superfície de conteúdo. `padded` (padrão) e `elevated` (sombra `card`); quando
não elevado, usa borda.

### Avatar
Foto do usuário com fallback para a inicial do nome. `size` configurável e
`ring` opcional.

### Badge
Etiqueta compacta com ícone opcional. Tons `neutral` | `primary` | `accent` |
`success` | `danger` | `warning`.

### ScreenHeader
Cabeçalho de tela com `title`, `subtitle`, slot `right` e `children`. Tom
`brand` (verde, usado na Home) ou `light`. Respeita safe area.

### SectionHeader
Cabeçalho de seção dentro de uma tela: `title`, `caption` e slot `right`.

### EmptyState
Estado vazio: ícone em círculo, título, mensagem e ação opcional
(`actionLabel` + `onAction`).

### ErrorState
Estado de erro com ícone, mensagem e botão "Tentar novamente" (`onRetry`
obrigatório). Usado em toda tela que carrega dados.

### Skeleton
Bloco de carregamento com animação de opacidade. Oculto para leitores de tela.
Base para os skeletons compostos.

## `src/components/promotion/`

### PromotionCard
Card da promoção no feed: imagem, título, preço formatado, mercado e as três
estatísticas (curtidas, confirmações, comentários). `accessibilityLabel` inclui
título + preço.

### PromotionCardSkeleton
Versão skeleton do `PromotionCard`, usada no carregamento do feed.

### ActionPill
Pílula de interação social (curtir / confirmar) do detalhe da promoção. Tem
estado `active` com ícone alternativo, `count`, `loading` e `disabled`. Tons
`primary` | `accent`.

### ReportModal
Modal de denúncia com os cinco motivos (expirada, falsa, preço errado,
impróprio, outro) + campo de detalhes. Recebe `submitting` e `error`.

## `src/components/ranking/`

### RankingItem
Linha do ranking mensal: posição, avatar, nome, pontos formatados. Os três
primeiros ganham medalha (ouro/prata/bronze); a linha do próprio usuário é
destacada.

## `src/components/forms/`

### MarketSelect
Dropdown de mercado ("Loja"): campo pressionável que abre um modal com a lista
de `mercados`. Suporta `error`.

## `src/components/auth/`

### AuthHeader
Cabeçalho curvo verde das telas de autenticação, com logo, título, subtítulo e
elementos decorativos. Respeita safe area.
