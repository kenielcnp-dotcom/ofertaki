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
Card da promoção no feed: preço em destaque com o valor original riscado,
selo de desconto (`discountPercent`), badge de confirmações sobre a foto,
selo 🔥 "Oferta quente" condicional (`isHotDeal`), título, mercado + "publicado
há X min", stats (curtidas/confirmações/comentários/nota) e botão de salvar
(ícone de marcador). Props `isSaved`/`onToggleSave` opcionais — quando
ausentes, some o botão de salvar (compatível com quem não passa a Lista).
`accessibilityLabel` inclui título + preço.

### PromotionCardSkeleton
Versão skeleton do `PromotionCard`, usada no carregamento do feed.

### DepartmentChips
Linha rolável horizontal no header da Home — "Todas" + cada `Department`
(ícone + nome), avatar circular com anel laranja quando ativo. `selectedId`
`null` = Todas.

### FilterModal
Bottom-sheet com "Mercado" (lista + "Todos os mercados") e "Ordenar por"
(Mais recente | Mais confirmado). Estado rascunho interno, só aplica no botão
"Aplicar filtros" — mesmo padrão visual de `MarketSelect`/`DepartmentSelect`.

### StarRating
Estrelas (1-5). Modo somente-leitura (`value` + `count` opcional, ex. "4,8
(152)") ou interativo (passar `onRate`, vira tocável). Usado no `PromotionCard`
(somente-leitura) e no `PromotionDetailScreen` (os dois modos: média geral +
widget pra avaliar).

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

### DepartmentSelect
Mesmo padrão do `MarketSelect`, pra `departments` — ícone do campo/opção vem
de `department.icon` (nome do Ionicons salvo na tabela).

## `src/components/lista/`

### SavingsPanel
Card de destaque no topo da `ListaScreen` com o total economizado no mês
(`original_price - price` somado das promoções compradas **pelo próprio
usuário** — sempre individual, mesmo numa lista compartilhada) e a contagem
de compras. Props `total`/`count`; retorna `null` quando `count === 0` (sem
economia registrada ainda no mês, evita mostrar "R$ 0,00" vazio).

### ShareListModal
Bottom sheet (mesmo padrão do `FilterModal`) para compartilhar a lista de
compras: membros atuais (dono pode remover convidados), código de convite de
6 caracteres (só visível/gerável pelo dono — `Compartilhar código` via
`Share` nativo do RN, sem lib nova) e campo "Entrar com um código" pra trocar
de lista. Componente puramente apresentacional — não busca dados sozinho,
recebe tudo via props de `ListaScreen` (que chama `useListaCompartilhada`).

## `src/components/auth/`

### AuthHeader
Cabeçalho curvo verde das telas de autenticação, com logo, título, subtítulo e
elementos decorativos. Respeita safe area.
