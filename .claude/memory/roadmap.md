# Roadmap

> Próximas funcionalidades e pendências. Mover item para `changelog.md` ao ser
> concluído. Problemas técnicos conhecidos (que não são features) ficam em
> `known-issues.md`.

## Bloqueia o lançamento

- [ ] **Confirmar `com.ofertaki.app`** como bundle id / package definitivo (hoje
      é placeholder) antes de submeter às lojas.
- [ ] Ficha das lojas: contas Apple Developer / Google Play, screenshots,
      política de privacidade (fora do que dá para automatizar aqui).
- [ ] **Ícone adaptativo Android "de verdade"**: hoje usa a logo inteira (com
      fundo já embutido) como `foregroundImage`, funcional mas não é o ideal —
      precisa de um glifo transparente recortado dentro da safe zone, mais um
      `monochromeImage` (ícone temático do Android 13+). Depende de asset de
      design, não só de config.

## A seguir

- [ ] **Fase 6 (parte 2)**: testes automatizados — Jest + React Native Testing
      Library, e possivelmente Detox/Maestro depois.
- [ ] **Deep link no reset de senha**: hoje o usuário redefine no navegador e
      volta para logar manualmente. Funcional, mas não é o fluxo ideal —
      depende de scheme/deep linking entrar em escopo.
- [ ] **Leaked password protection** no Supabase (checagem HaveIBeenPwned):
      exige plano Pro, a API retorna 402 no free tier atual.

## Depois

- [ ] **Filtro por categoria na Home**: adiado de propósito — hoje toda promoção
      usa a categoria "Mercado" fixa, então o filtro não teria efeito prático.
      Volta quando outras categorias entrarem.
- [ ] Outras categorias além de "Mercado" (farmácia, pet, etc.).
- [ ] Perfil público de outro usuário (hoje o Perfil é só o do próprio usuário).
- [ ] Histórico de preço por produto/mercado.

## Sem data definida

- [ ] Moderação com painel administrativo (hoje a remoção por denúncia é
      automática ao atingir 5 denúncias de usuários diferentes).
- [ ] Notificações push de verdade (hoje as notificações são in-app, via
      Realtime).
- [ ] Programa de indicação.
