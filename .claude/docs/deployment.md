# Deployment

Build e distribuição via **EAS Build** (`eas.json` na raiz).

## Perfis de build (`eas.json`)

| Perfil | Configuração | Uso |
|---|---|---|
| `development` | `developmentClient: true`, `distribution: internal` | dev client, desenvolvimento diário |
| `preview` | `distribution: internal` | build interna para QA antes de release |
| `production` | `autoIncrement: true` | build enviado às lojas |

`cli.appVersionSource: "remote"` — o número de build é controlado pelo EAS, não
pelo `app.json`.

## Configuração do app (`app.json`)

- Nome de exibição: **Ofertaki** · slug `ofertaki` · versão `1.0.0`
- `ios.bundleIdentifier` / `android.package`: **`com.ofertaki.app`** —
  **placeholder, confirmar antes de submeter às lojas**.
- `extra.eas.projectId` configurado; `owner: "kenieldotcoms-team"` — o projeto
  EAS vive sob a conta de **time** `kenieldotcoms-team`, não a conta pessoal.
- Plugins: `expo-font` e `expo-image-picker` (com textos de permissão de câmera
  e fototeca em pt-BR — obrigatório para build de loja, senão o app crasha ao
  pedir permissão).
- **Não adicionar `android.permissions` sem necessidade real** — `eas
  build:configure`/`expo prebuild` pode sugerir permissões (ex.:
  `RECORD_AUDIO`) que nada no app usa; removido em 2026-08-01 (ver
  `changelog.md`). Pedir permissão sem uso real levanta bandeira na revisão de
  loja.
- Ícones adaptativos Android e favicon web já configurados em `assets/`.

## Variáveis de ambiente

`src/config/env.ts` exige `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_ANON_KEY` e falha no carregamento se faltarem.

- **Local**: `.env` (gitignored). `.env.example` documenta as duas vars.
- **EAS**: o `.env` local **não** sobe para o build na nuvem — as vars precisam
  ser criadas com `eas env:create`. Ver `.claude/memory/roadmap.md`.

## Antes do primeiro build real

1. ~~`eas login` + `eas build:configure`~~ — feito em 2026-08-01, projeto EAS
   `c4ad1e76-89b1-4cda-b7be-73597d5e3d1e` sob `kenieldotcoms-team`.
2. `eas env:create` para as duas vars do Supabase — ainda pendente.
3. Confirmar o bundle id definitivo — ainda pendente.
4. Contas Apple Developer / Google Play, ícones de loja, screenshots e política
   de privacidade.

## Checklist de release

Antes de promover um build de `preview` para `production`: `.claude/memory/changelog.md`
atualizado, `npx tsc --noEmit` limpo, `supabase migration list` com local ==
remote, teste manual do fluxo principal (login → publicar → aparece no feed)
no build de `preview`.

## Segurança

Ver `.claude/skills/security/SKILL.md` — nenhum segredo commitado; a
`ANON_KEY` é pública por natureza (a proteção real é a RLS, não o segredo da
chave).
