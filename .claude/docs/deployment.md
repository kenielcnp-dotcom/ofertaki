# Deployment

Build e distribuição via **EAS Build** (`eas.json` na raiz). Atualizações de
JS/assets sem gerar build novo via **EAS Update** (mesmo arquivo).

## Perfis de build (`eas.json`)

| Perfil | Configuração | Canal de update | Uso |
|---|---|---|---|
| `development` | `developmentClient: true`, `distribution: internal` | `development` | dev client, desenvolvimento diário |
| `preview` | `distribution: internal` | `preview` | build interna para QA antes de release |
| `production` | `autoIncrement: true` | `production` | build enviado às lojas |

`cli.appVersionSource: "remote"` — o número de build é controlado pelo EAS, não
pelo `app.json`.

## EAS Update (OTA)

Configurado em 2026-08-01 (`eas update:configure`) para não precisar gerar
build nativo a cada mudança de código JS/React.

- `expo-updates` instalado; `app.json` ganhou `updates.url` e
  `runtimeVersion: { policy: "appVersion" }` (a versão de runtime segue
  `app.json` → `version`; builds com o mesmo `version` conseguem receber a
  mesma atualização).
- Cada perfil de build em `eas.json` tem um `channel` (`development` /
  `preview` / `production`) — o build só recebe updates publicados nesse
  canal.
- **Publicar uma atualização**: `eas update --channel <canal> --message
  "descrição da mudança"`. Ex.: `eas update --channel preview --message "fix:
  ..."` atualiza instantaneamente (próxima vez que o app abrir/voltar do
  background) todo build de `preview` já instalado — sem passar pela loja
  nem gerar `.apk`/`.ipa` novo.
- **Limite importante**: só funciona pra mudanças de **JS/assets**. Qualquer
  mudança nativa (nova permissão, novo plugin do Expo, ícone, splash, nome do
  app, bundle id) exige `eas build` novo — o update não alcança essas
  mudanças e pode até ficar incompatível se o `runtimeVersion` mudar.
- **Builds anteriores ao `update:configure`** (ex.: o primeiro APK de
  `preview` gerado em 2026-08-01) não têm o cliente `expo-updates` embutido —
  não recebem OTA, só um `eas build` novo os substitui por um que recebe.
- **Achado ao configurar**: `eas update:configure` reintroduziu
  `android.permissions: ["RECORD_AUDIO"]` (duplicado) no `app.json`, mesmo
  achado da migration EAS anterior — removido de novo. Ver
  `.claude/memory/known-issues.md`.

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
- Ícone (`icon.png`) e o `foregroundImage` do adaptive icon Android usam a
  logo real (`assets/logo.png`, mesma usada na `WelcomeScreen`) desde
  2026-08-02; `backgroundColor` do adaptive icon é o verde da marca
  (`#1A5331`). **Falta**: um `foregroundImage` de verdade (glifo transparente
  dentro da safe zone do Android) e um `monochromeImage` (ícone temático do
  Android 13+) — hoje o adaptive icon usa a logo inteira (com fundo já
  embutido) como foreground, funcional mas não é o ideal; não tem
  `monochromeImage` configurado (cai no fallback do ícone normal). Favicon web
  ainda é o placeholder padrão do Expo.

## Variáveis de ambiente

`src/config/env.ts` exige `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_ANON_KEY` e falha no carregamento se faltarem.

- **Local**: `.env` (gitignored). `.env.example` documenta as duas vars.
- **EAS**: o `.env` local **não** sobe para o build na nuvem — as vars vivem no
  EAS (`eas env:set`, comando atual; `eas env:create` está deprecated).
  Configuradas em 2026-08-01 nos três ambientes (`development`, `preview`,
  `production`), visibilidade `plaintext` (a anon key é pública por natureza).
  Conferir com `eas env:list --environment <nome>`.

## Antes do primeiro build real

1. ~~`eas login` + `eas build:configure`~~ — feito em 2026-08-01, projeto EAS
   `c4ad1e76-89b1-4cda-b7be-73597d5e3d1e` sob `kenieldotcoms-team`.
2. ~~`eas env:create` para as duas vars do Supabase~~ — feito em 2026-08-01.
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
