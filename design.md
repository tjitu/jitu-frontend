# design.md

Visual language for a web product: marketing site, app UI, dashboards. Style only; no business context. Drop it into any project and rename the tokens' prefix if needed.

**Character:** calm, confident, a little warm. Blue does the work, one yellow accent adds reward and emphasis, cool-tinted neutrals keep everything quiet. Borders over shadows, real content over decoration.

> **Provenance.** Hex values are a reconstruction of the blue-and-yellow palette family seen on jituptn.com (blue brand, yellow pixel-coin accent). Replace them with your exact brand tokens if they differ; the structure and rules below don't change.

---

## 1. Principles

1. **One primary color.** Blue is for actions, links, focus and brand. Nothing else competes with it.
2. **Accent is rare.** Yellow marks one thing: a reward, a highlight, a "recommended". If it appears more than a few times per screen, remove some.
3. **Quiet chrome, loud content.** UI frames stay neutral so content (media, data, product visuals) carries the color.
4. **Structure from borders and space**, not shadows, gradients or glass.
5. **Show real things.** Real screenshots, real numbers, real photos. No abstract blobs, no glowing orbs, no generic "AI" imagery.
6. **Accessible by default.** Visible focus, 4.5:1 text contrast, 44px touch targets.

## 2. Color

### 2.1 Primitive scales

**Blue (primary)**

| Token | Hex | Typical use |
|---|---|---|
| `blue-50` | `#EFF5FF` | Tinted section background, selected row |
| `blue-100` | `#DBE8FF` | Hover on tinted surfaces, soft badges |
| `blue-200` | `#BFD6FF` | Borders on blue surfaces, focus halo |
| `blue-300` | `#93BAFF` | Disabled primary, decorative strokes |
| `blue-400` | `#5E95FA` | Dark-mode primary, secondary chart series |
| `blue-500` | `#3A72F0` | Primary hover |
| `blue-600` | `#2557DB` | **Brand, primary button, links** |
| `blue-700` | `#1D44B8` | Pressed, link hover |
| `blue-800` | `#1C3A92` | Headings on blue-50, dark surfaces |
| `blue-900` | `#1B3475` | Footer, dark hero |
| `blue-950` | `#121F47` | Dark-mode background |

**Yellow (accent)**

| Token | Hex | Typical use |
|---|---|---|
| `yellow-100` | `#FFF3C4` | Accent chip background |
| `yellow-300` | `#FFD84D` | Highlight, "recommended" ribbon |
| `yellow-400` | `#FFC81F` | **Accent fill, icon fill** |
| `yellow-500` | `#F5B000` | Hover |
| `yellow-700` | `#A86F00` | Accent text on `yellow-100` |

**Neutral (cool-tinted)**

| Token | Hex | Typical use |
|---|---|---|
| `white` | `#FFFFFF` | Cards, inputs |
| `ink-25` | `#FAFBFD` | Page background |
| `ink-50` | `#F4F6FA` | Panels, sidebar, zebra rows |
| `ink-100` | `#E9EDF4` | Dividers, skeletons |
| `ink-200` | `#D8DEE9` | Borders |
| `ink-300` | `#B9C2D3` | Disabled borders, placeholder icons |
| `ink-500` | `#6B778C` | Secondary text |
| `ink-700` | `#3A4458` | Body text |
| `ink-900` | `#151B2B` | Headings |

**Status**

| Role | Solid | Soft bg | Text on soft |
|---|---|---|---|
| Success | `#1F9D63` | `#E3F5EC` | `#14724A` |
| Warning | `yellow-400` | `yellow-100` | `yellow-700` |
| Danger | `#D9363E` | `#FCE8E9` | `#A5242B` |
| Info | `blue-600` | `blue-50` | `blue-800` |

### 2.2 Semantic tokens (use these in components, not primitives)

| Token | Light | Dark |
|---|---|---|
| `--bg` | `ink-25` | `blue-950` |
| `--surface` | `white` | `#1A2748` |
| `--surface-muted` | `ink-50` | `#16223F` |
| `--border` | `ink-200` | `#2A3A63` |
| `--text` | `ink-900` | `#E9EDF4` |
| `--text-body` | `ink-700` | `#C5CEE0` |
| `--text-muted` | `ink-500` | `#8D9BB8` |
| `--primary` | `blue-600` | `blue-400` |
| `--primary-hover` | `blue-500` | `#7DA9FB` |
| `--primary-pressed` | `blue-700` | `blue-300` |
| `--on-primary` | `white` | `blue-950` |
| `--accent` | `yellow-400` | `yellow-400` |
| `--on-accent` | `ink-900` | `ink-900` |
| `--focus` | `blue-600` | `blue-300` |

### 2.3 Rules

- One primary button per view.
- Text on yellow is always `ink-900`. Text on `blue-600` and darker is white.
- Body-size text on white must be `blue-600` or darker when blue. Never `blue-500` or lighter.
- No gradients on UI chrome. No blue-to-purple. If a hero needs depth, use a flat `blue-900` field with a real image.
- Never use color alone to convey status; pair with an icon or label.

### 2.4 Data visualization

Series order: `blue-600`, `yellow-400`, `blue-300`, `ink-500`, `#1F9D63`, `blue-900`. Max 5 series per chart; beyond that, group or small-multiple. Direct-label lines and bars instead of relying on a legend. Gridlines `ink-100`, axis text `ink-500` at 12px.

## 3. Typography

- **Sans:** Plus Jakarta Sans for UI and headings. Fallback `system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Mono (rare):** JetBrains Mono for code, shortcuts, tokens.
- Enable tabular figures for prices, stats, tables.
- Sentence case everywhere. Uppercase only for small labels.

Fluid scale (min → max across 360px → 1280px):

| Style | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| Display | `clamp(2.25rem, 1.6rem + 2.8vw, 3.75rem)` | 1.08 | 800 | -0.02em |
| H1 | `clamp(1.875rem, 1.5rem + 1.6vw, 2.75rem)` | 1.15 | 700 | -0.015em |
| H2 | `clamp(1.5rem, 1.3rem + 0.8vw, 2rem)` | 1.2 | 700 | -0.01em |
| H3 | `1.25rem` | 1.4 | 600 | 0 |
| Body | `1rem` | 1.625 | 400 | 0 |
| Small | `0.875rem` | 1.5 | 400 | 0 |
| Label | `0.75rem` | 1.33 | 600, uppercase | +0.06em |

Max line length 68ch. Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## 4. Space, layout, shape, depth

- **Spacing base 4px:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Section rhythm:** 64px vertical padding on mobile, 96-128px on desktop.
- **Container:** max 1200px, 20px side padding on mobile, 32px from 768px up. Reading column max 720px.
- **Grid:** 4 columns under 768px, 8 at 768px, 12 from 1024px; 24px gutters.
- **Breakpoints:** 480, 768, 1024, 1280.
- **Radius:** 6 chips and inputs · 10 buttons · 16 cards · 24 hero media and large panels · full for pills and avatars.
- **Borders first.** Default card: `1px solid var(--border)` on `--surface`.
- **Shadows (floating layers only):**
  - `shadow-float`: `0 8px 24px rgba(21, 27, 43, 0.10)`
  - `shadow-modal`: `0 24px 64px rgba(18, 31, 71, 0.22)`
- **Z-index:** base 0 · sticky 10 · dropdown 20 · modal 30 · toast 40.

## 5. Components

**Button**
- Primary: `--primary` fill, `--on-primary` text, 10px radius, 44px tall (48px for hero CTAs). Hover `--primary-hover`, pressed `--primary-pressed`.
- Secondary: `--surface` fill, `1px --border`, `--text` label. Hover `--surface-muted`.
- Ghost: transparent, `--primary` label. Hover `blue-50`.
- Accent (rare): `yellow-400` fill, `ink-900` label. At most once per page.
- Destructive: `--danger` fill, white label; always confirm.
- Loading: spinner replaces the icon, label stays, width doesn't jump. Disabled: `blue-300` fill, no pointer.

**Input, select, textarea:** white, `1px --border`, radius 10, 44px tall, 12px horizontal padding. Hover border `ink-300`. Focus: border `--primary` plus `0 0 0 3px blue-200`. Error: border `--danger`, message below in `--danger` text with icon. Helper text 14px `--text-muted`. Labels above, never placeholder-only.

**Card:** `--surface`, `1px --border`, radius 16, 24px padding. Interactive cards: border becomes `blue-300` on hover, no lift, no scale.

**Badge / chip:** 24px tall, radius full, 12px/600 text, status soft backgrounds from 2.1. Accent chip: `yellow-100` bg, `yellow-700` text.

**Link:** `--primary`, underline on hover and always underlined inside running text.

**Tabs / segmented control:** 2px bottom border in `--primary` for active tab; segmented control uses `--surface-muted` track with a white pill and `1px --border`.

**Table:** 48px rows, `ink-50` header with Label style, `1px ink-100` row dividers, numeric columns right-aligned with tabular figures. No zebra unless more than 10 rows.

**Modal / popover:** `--surface`, radius 16 (24 for modals), `shadow-modal`, scrim `rgba(18, 31, 71, 0.5)`. Esc closes, focus is trapped and returned on close.

**Toast:** `ink-900` bg, white text, radius 10, bottom-center, 4s auto-dismiss, one optional action (e.g. Undo).

**Banner / alert:** soft status background, 1px border in the solid status color at 30% opacity, icon + title + optional action.

**Empty state:** one illustration or icon, one sentence on what goes here, one primary action.

**Skeleton:** `ink-100` shapes with a 1.4s shimmer; same dimensions as the loaded content to avoid layout shift.

**Navigation:** 64px top bar, white, `1px` bottom border; collapses to a drawer under 768px. Active item gets `blue-50` bg and `blue-700` text.

**Pricing / plan cards (if used):** equal height, recommended plan gets `2px --primary` border and a `yellow-300` ribbon; per-unit price in `--text-muted` under the total.

## 6. Iconography and imagery 

- **Icons:** stroke style, 1.75px stroke, 20px grid (24px in nav and empty states), rounded caps and joins. `ink-700` default, `--primary` when active.
- **Accent icon:** at most one filled, colored icon family in the whole UI, fill `yellow-400` with a 1.5px `ink-900` outline so it reads on white and blue.
- **Logo:** single flat color: `blue-600` on light, white on dark.
- **Photography:** documentary, daylight, people doing real things. No 3D gloss, no robots or brains, no stock handshake.
- **Illustration (optional):** pixel-art scenes for empty states, 404 and onboarding only. Keep the grid crisp with `image-rendering: pixelated` and integer scaling.
- **Image treatment:** radius 16-24, `1px --border` on light backgrounds, no filters or duotone overlays.

## 7. Motion

- Durations: 120ms hover, 200ms panels and toasts, 320ms entering elements.
- Easing: `cubic-bezier(0.2, 0, 0, 1)`; exit uses `cubic-bezier(0.4, 0, 1, 1)`.
- Entering content: fade + 8px rise. Lists stagger 40ms per item, max 6 items.
- Animate only `opacity` and `transform`.
- No parallax, no auto-playing carousels, no scroll-jacking.
- `prefers-reduced-motion`: drop movement, keep opacity fades at 100ms.

## 8. Accessibility

- Text contrast 4.5:1 (3:1 for 18px+ bold or 24px+ regular). UI boundaries and icons 3:1.
- Focus ring: `2px solid var(--focus)` with `2px` offset, on every interactive element; never `outline: none` without a replacement.
- Touch targets at least 44x44px; 8px minimum gap between adjacent targets.
- Honor `prefers-color-scheme`, `prefers-reduced-motion` and 200% browser zoom without horizontal scroll.
- Every icon-only button has an accessible name. Form errors are announced and tied to their field.

## 9. Writing in the UI

- Short verbs on buttons: "Save", "Continue", "Download". No "Submit".
- Say what happens and what it costs in the same place as the action.
- Errors say what went wrong and what to do next. No blame, no exclamation marks.
- No hype words ("magic", "revolutionary", "seamless", "supercharge").

## 10. Anti-slop checklist

- [ ] One primary color, and it is `blue-600`.
- [ ] Yellow appears in at most a few places per screen.
- [ ] No gradient backgrounds, glassmorphism, glow, or blob shapes.
- [ ] No row of three identical icon-title-text cards as the main explanation; show the real product or data.
- [ ] No emoji as icons.
- [ ] Real numbers and real visuals in every section.
- [ ] Focus state, hover state, disabled state and loading state exist for every control.
- [ ] Contrast verified, including on dark mode and on `yellow` surfaces.

## 11. Tokens

### CSS

```css
:root {
  /* primitives */
  --blue-50:#EFF5FF; --blue-100:#DBE8FF; --blue-200:#BFD6FF; --blue-300:#93BAFF;
  --blue-400:#5E95FA; --blue-500:#3A72F0; --blue-600:#2557DB; --blue-700:#1D44B8;
  --blue-800:#1C3A92; --blue-900:#1B3475; --blue-950:#121F47;
  --yellow-100:#FFF3C4; --yellow-300:#FFD84D; --yellow-400:#FFC81F;
  --yellow-500:#F5B000; --yellow-700:#A86F00;
  --ink-25:#FAFBFD; --ink-50:#F4F6FA; --ink-100:#E9EDF4; --ink-200:#D8DEE9;
  --ink-300:#B9C2D3; --ink-500:#6B778C; --ink-700:#3A4458; --ink-900:#151B2B;
  --success:#1F9D63; --success-soft:#E3F5EC; --success-text:#14724A;
  --danger:#D9363E;  --danger-soft:#FCE8E9;  --danger-text:#A5242B;

  /* semantic (light) */
  --bg:var(--ink-25); --surface:#fff; --surface-muted:var(--ink-50);
  --border:var(--ink-200);
  --text:var(--ink-900); --text-body:var(--ink-700); --text-muted:var(--ink-500);
  --primary:var(--blue-600); --primary-hover:var(--blue-500); --primary-pressed:var(--blue-700);
  --on-primary:#fff; --accent:var(--yellow-400); --on-accent:var(--ink-900);
  --focus:var(--blue-600);

  /* shape, depth, type */
  --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-xl:24px;
  --shadow-float:0 8px 24px rgba(21,27,43,.10);
  --shadow-modal:0 24px 64px rgba(18,31,71,.22);
  --ease:cubic-bezier(.2,0,0,1);
  --font-sans:"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:"JetBrains Mono", ui-monospace, monospace;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg:var(--blue-950); --surface:#1A2748; --surface-muted:#16223F;
    --border:#2A3A63;
    --text:#E9EDF4; --text-body:#C5CEE0; --text-muted:#8D9BB8;
    --primary:var(--blue-400); --primary-hover:#7DA9FB; --primary-pressed:var(--blue-300);
    --on-primary:var(--blue-950); --focus:var(--blue-300);
  }
}
:root[data-theme="dark"] { /* same values as the dark block above */ }

:focus-visible { outline:2px solid var(--focus); outline-offset:2px; }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration:.01ms !important; transition-duration:.01ms !important; }
}
```

### Tailwind (v3 `theme.extend`)

```js
colors: {
  blue:   { 50:'#EFF5FF',100:'#DBE8FF',200:'#BFD6FF',300:'#93BAFF',400:'#5E95FA',500:'#3A72F0',600:'#2557DB',700:'#1D44B8',800:'#1C3A92',900:'#1B3475',950:'#121F47' },
  yellow: { 100:'#FFF3C4',300:'#FFD84D',400:'#FFC81F',500:'#F5B000',700:'#A86F00' },
  ink:    { 25:'#FAFBFD',50:'#F4F6FA',100:'#E9EDF4',200:'#D8DEE9',300:'#B9C2D3',500:'#6B778C',700:'#3A4458',900:'#151B2B' },
},
borderRadius: { sm:'6px', md:'10px', lg:'16px', xl:'24px' },
fontFamily: { sans:['"Plus Jakarta Sans"','system-ui','sans-serif'], mono:['"JetBrains Mono"','ui-monospace','monospace'] },
```
