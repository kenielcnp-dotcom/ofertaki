# Skill: UI Design

Regras visuais obrigatórias para o app Ofertaki. Fonte da verdade para os
valores concretos (cores, tamanhos) é `.claude/memory/design-system.md` —
esta skill define as regras de uso, não os valores.

## Escala de espaçamento

Usar sempre a escala definida em `design-system.md` (múltiplos de 4). Nunca
usar valores de padding/margin fora da escala.

## Tipografia

- No máximo 2 famílias de fonte no app (uma para títulos, uma para corpo —
  ou uma única família com pesos variados).
- Hierarquia clara: título de tela, título de seção, corpo, legenda —
  cada nível com tamanho/peso definido em `design-system.md`, sem variações
  ad-hoc.

## Cor

- Usar apenas os tokens de cor definidos em `design-system.md` (primária,
  secundária, neutras, semânticas de sucesso/erro/alerta).
- Contraste mínimo AA (4.5:1 para texto normal, 3:1 para texto grande) em
  qualquer combinação texto/fundo.
- Cor nunca é o único indicador de estado (ex.: desconto/economia deve ter
  ícone ou texto além da cor verde).

## Componentes

- Antes de criar um componente visual novo, checar `.claude/docs/components.md`
  — reaproveitar em vez de duplicar variantes.
- Estados obrigatórios para componentes interativos: default, pressed/hover,
  disabled, loading (quando aplicável).
- Área de toque mínima de 44x44pt em elementos interativos.

## Telas

- Todo estado de carregamento tem skeleton/placeholder, nunca tela em branco.
- Todo estado vazio (ex.: nenhuma oferta salva) tem ilustração/mensagem +
  ação clara (ex.: "buscar ofertas") — texto fornecido pelo `marketing`.
- Todo estado de erro tem mensagem compreensível + ação de retry quando
  aplicável.

## Acessibilidade

- Todo elemento interativo tem `accessibilityLabel`/`accessibilityRole`.
- Suportar Dynamic Type / escala de fonte do sistema sem quebrar layout.
- Não depender exclusivamente de gestos complexos para ações essenciais.

## Handoff

Specs de design devem referenciar tokens (ex. `spacing.md`, `color.primary`),
não descrições soltas ("um azul mais forte"). Isso evita ambiguidade na
implementação pelo `dev`.
