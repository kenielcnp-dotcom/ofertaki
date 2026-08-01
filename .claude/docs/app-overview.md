# Visão Geral do App

## Proposta de valor

Ofertaki é um app de **promoções de supermercado compartilhadas pela
comunidade**. Quem encontra uma boa promoção publica (foto, preço, mercado); os
outros usuários curtem, comentam e **confirmam** se o preço está correto. Quem
contribui ganha pontos e sobe no ranking mensal.

O diferencial não é agregar promoção de site — é a **confirmação em campo**: um
preço confirmado por outros usuários vale mais do que um encarte, porque alguém
esteve na loja hoje.

## Público-alvo

Pessoas que fazem compras de supermercado com atenção a preço, especialmente em
regiões com várias lojas concorrentes próximas, e que já compartilham achados de
promoção em grupos de mensagem — só que de um jeito desorganizado e que se perde.

## Problema que resolve

- Encarte de supermercado desatualiza rápido e nem sempre reflete a loja da
  esquina.
- Promoções boas circulam em grupos de WhatsApp e se perdem no scroll.
- Não dá para saber se o preço ainda está valendo sem ir até a loja.
- A lista de compras vive num app separado do lugar onde a promoção apareceu.

## Funcionalidades implementadas

1. **Feed de promoções** — lista paginada de promoções ativas, mais recentes
   primeiro, com busca full-text.
2. **Publicar promoção** — foto tirada na hora pela câmera, título, descrição,
   preço e mercado (dropdown).
3. **Interação social** — curtir, comentar e **confirmar** o preço. Não é
   possível curtir ou confirmar a própria promoção.
4. **Lista de compras pessoal** — privada, com checkbox "comprado". Itens podem
   vir de uma promoção publicada ou ser texto livre.
5. **Gamificação e ranking** — +10 por publicar, +2 por curtida recebida, +1 por
   confirmação recebida. Ranking mensal Top 50 com medalhas, acessível pelo
   Perfil.
6. **Notificações in-app** — geradas quando sua promoção recebe curtida,
   comentário ou confirmação. Chegam em tempo real (Supabase Realtime), com
   marcar como lida / marcar todas.
7. **Denúncia de promoção** — motivo (expirada, falsa, preço errado, impróprio,
   outro). Ao atingir 5 denúncias de usuários diferentes, a promoção é removida
   automaticamente.
8. **Conta** — cadastro, login, logout e redefinição de senha.

## Escopo atual

O MVP cobre **apenas a categoria "Mercado"** — a categoria é atribuída
automaticamente na publicação, e por isso não existe filtro por categoria na
Home ainda (ver `.claude/memory/decisions.md`).

## Fora de escopo (por ora)

- Compra/checkout dentro do app — o Ofertaki mostra onde está barato, não vende.
- Integração com API de rede de supermercado — o dado vem da comunidade.
- Notificação push do sistema — as notificações hoje são in-app.
- Perfil público de outro usuário.

Próximos passos: `.claude/memory/roadmap.md`.
