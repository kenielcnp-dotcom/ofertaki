# Skill: Security

Checklist obrigatório para features que lidam com dados do usuário,
autenticação, banco ou storage. Aplicar antes de considerar uma tarefa do `dev`
concluída.

## Princípio central

**O cliente é público e pode ser manipulado.** Qualquer regra que precise ser
confiável tem que estar no banco (RLS, trigger, `REVOKE`), não no app. Validação
no cliente é conveniência de UX, nunca segurança.

## Row Level Security (RLS)

Ao criar ou alterar uma tabela, responder antes de considerar pronto:

- [ ] RLS está **habilitada** na tabela?
- [ ] Existe policy de `SELECT`, `INSERT`, `UPDATE` e `DELETE` — e cada uma
      restringe ao dono do dado quando for o caso?
- [ ] Um usuário consegue ler/alterar dado de **outro** usuário trocando o `id`
      na requisição? (testar mentalmente, não presumir)
- [ ] Colunas que só o servidor deve escrever (contadores, `status`, pontuação)
      têm `REVOKE` de coluna?

Exemplos reais já aplicados no projeto (ver `.claude/docs/database.md`):
contadores de `promotions`, `promotions.status`, `profiles.reputation_score` —
todos com `REVOKE`, escritos só por trigger. RLS bloqueia auto-curtida e
auto-confirmação. `notifications` é gerada só por trigger.

## Funções do banco

- Toda função `SECURITY DEFINER` de uso interno (trigger-only) nasce com
  **`REVOKE EXECUTE`** de `anon`/`authenticated`. Só `get_monthly_ranking` é
  pública, de propósito.
- Função `SECURITY DEFINER` com `search_path` fixo.
- **Nunca** aceitar nome de coluna/tabela como texto livre em função —
  usar whitelist. (Foi exatamente esse o bug de `adjust_promotion_counter`, que
  permitia reescrever qualquer coluna de `promotions`, inclusive `price`.)
- Rodar o **Database Linter** do Supabase depois de mudanças de schema.

## Segredos e configuração

- Nenhuma chave, token ou credencial hardcoded no código.
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` vêm do ambiente
  via `src/config/env.ts`. `.env` é gitignored; `.env.example` documenta as vars
  sem valores reais.
- A `ANON_KEY` é **pública por natureza** (vai no bundle do app) — a proteção é
  a RLS, não o sigilo da chave. Nunca embarcar a `service_role` key no app.
- Para build na nuvem, as vars vivem no EAS (`eas env:create`), não no `.env`.

## Autenticação e sessão

- Sessão gerenciada pelo Supabase Auth, persistida em AsyncStorage pelo próprio
  SDK — não reimplementar armazenamento de token à mão.
- Logout deve limpar o estado local do perfil (o `AuthContext` já zera `profile`
  quando a sessão cai).
- Nunca confiar em checagem client-side para autorizar ação sensível — a policy
  do banco é quem decide.

## Upload de imagem

- Bucket `promotion-images` com policy explícita; não deixar bucket com listagem
  pública sem necessidade.
- Validar tipo/tamanho antes do upload; redimensionar com
  `expo-image-manipulator` em vez de subir o original da câmera.

## Permissões do dispositivo

- Pedir só o necessário (câmera e fototeca, para publicar promoção), com texto
  de justificativa em pt-BR no `app.json` — sem isso o app crasha no build de
  loja ao pedir permissão.
- Pedir no momento do uso, nunca no primeiro load sem contexto.

## Dependências

- Antes de adicionar lib nova: resolve um problema real? é mantida?
- `npm audit` antes de releases; o que não for corrigível registra-se em
  `.claude/memory/known-issues.md` com o motivo.

## Antes de finalizar uma feature

Perguntar: "o que acontece se este dado vier manipulado, nulo, ou de um usuário
não autorizado?" Se a resposta não for clara, tratar antes de concluir.
