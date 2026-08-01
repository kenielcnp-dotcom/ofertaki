# Design System — Identidade Visual

> Fonte da verdade em código: `src/theme/` (`colors.ts`, `spacing.ts`,
> `radius.ts`, `typography.ts`). Este arquivo espelha esses tokens; ao mudar um,
> mudar nos dois lugares. `skills/ui-design` define as **regras de uso**.
>
> Conceito da paleta: verde "feira" + laranja "etiqueta de preço".
>
> Os valores abaixo são os da branch **`test.design-local`**, que é a branch de
> trabalho do app (ver `decisions.md`).

## Cores (`src/theme/colors.ts`)

### Superfícies
| Token | Valor |
|---|---|
| `background` | `#FFFFFF` |
| `backgroundAlt` | `#F7F8F7` |
| `surface` | `#F5F6F8` |
| `surfaceElevated` | `#FFFFFF` |
| `overlay` | `rgba(15, 51, 30, 0.45)` |

### Texto
| Token | Valor |
|---|---|
| `text` | `#1A1D1F` |
| `textMuted` | `#6B7280` |
| `textSubtle` | `#9AA3AE` |
| `textInverse` | `#FFFFFF` |

### Marca — verde (ação principal)
| Token | Valor |
|---|---|
| `primary` | `#1A5331` |
| `primaryLight` | `#2E7D4E` |
| `primaryDark` | `#0F331E` |
| `primaryBg` | `#EAF4EE` |
| `primaryText` | `#FFFFFF` |

### Marca — laranja (destaque de preço / CTA secundário)
| Token | Valor |
|---|---|
| `secondary` | `#E77F43` |
| `secondaryLight` | `#F09C6B` |
| `secondaryDark` | `#C45D25` |
| `secondaryBg` | `#FDF2EB` |
| `secondaryText` | `#FFFFFF` |

### Linhas e estados
| Token | Valor | Uso |
|---|---|---|
| `border` | `#E5E7EB` | divisores |
| `borderStrong` | `#D3D8DE` | borda de ênfase |
| `danger` / `dangerBg` | `#EF4444` / `#FEECEC` | erro, denúncia |
| `success` / `successBg` | `#10B981` / `#E7F8F1` | confirmação |
| `warning` / `warningBg` | `#F59E0B` / `#FEF4E2` | alerta |

### Ranking
| Token | Valor |
|---|---|
| `gold` | `#E0B106` |
| `silver` | `#9CA3AF` |
| `bronze` | `#B0703C` |

## Tipografia (`src/theme/typography.ts`)

Fontes carregadas em `App.tsx` via `@expo-google-fonts`:
**Outfit** (títulos e números de preço) e **DM Sans** (texto de interface).

| Token | Fonte | Tamanho / line-height |
|---|---|---|
| `display` | Outfit Bold | 30 / 36 |
| `title` | Outfit Bold | 24 / 30 |
| `subtitle` | Outfit SemiBold | 18 / 24 |
| `sectionLabel` | DM Sans Bold | 12 / 16, uppercase, tracking 0.8 |
| `body` | DM Sans Regular | 15 / 22 |
| `bodyStrong` | DM Sans Medium | 15 / 22 |
| `caption` | DM Sans Regular | 13 / 18 |
| `captionStrong` | DM Sans Medium | 13 / 18 |
| `micro` | DM Sans Medium | 11 / 14 |
| `price` | Outfit Bold | 22 / 26 |
| `priceLarge` | Outfit Bold | 32 / 38 |
| `button` | DM Sans Bold | 15 / 20 |

## Espaçamento (`src/theme/spacing.ts`)

Escala base 4: `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 32` · `xxl 40` ·
`xxxl 56`. Nunca usar padding/margin fora dessa escala.

## Raio de borda (`src/theme/radius.ts`)

`sm 8` · `md 12` · `lg 16` · `xl 24` · `pill 999`

## Sombras (`shadows` em `typography.ts`)

`card` (elevação leve, cards do feed) · `raised` (elementos destacados) ·
`floating` (botão central "Publicar"). Multiplataforma: `shadow*` no iOS,
`elevation` no Android, cor base `#0F331E`.

## Ícones

`@expo/vector-icons` — família **Ionicons** em todo o app.
