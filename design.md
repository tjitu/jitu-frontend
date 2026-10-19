# DESIGN.md — Jitu (jituptn.com)

Single reference for the entire frontend visual system: landing page, student application, and admin portal. If a visual styling, layout, or component decision arises, this document is the authoritative standard. Document written in English.

---

> [!IMPORTANT]
> **Strict Separation of Concerns — Writing & Copywriting Policy**
> This document specifies **exclusively** visual design, layout structures, typography scales, design tokens, component styling, motion, and accessibility.
> 
> **DO NOT** place copywriting guidelines, editorial voice/tone rules, anti-AI copy instructions, Indonesian phrasing conventions, microcopy templates, or word budgets in this document.
> 
> 👉 **For all writing, voice, tone, microcopy, vocabulary, and copy rules, refer exclusively to [`writing.md`](file:///c:/JITU-ECOSYSTEM/jitu-frontend/writing.md).**

---

## 1. Design Principles

1. **Industrial / Neo-Brutalist Utility Aesthetic**
   Clean, precise, and utilitarian. Solid ink borders (2px), flat planes, and hard box shadows with zero blur. No rounded bubbles, no floating soft glows, and no decorative gradients.
2. **Blue Leads, Signal Yellow Marks the Action**
   The blue palette creates the academic, reliable environment. Signal yellow is reserved strictly for primary interactive focus (maximum one signal highlight per screen).
3. **Zero Radius Rule (`border-radius: 0px`)**
   Every component, card, button, input, modal, and badge uses sharp 90-degree corners. The only permitted exception is circular user avatars.
4. **Dense, Fast, and Mobile-First**
   Students take tests on mobile devices under real-world connection constraints. Interfaces must be compact, legible, fast to render, and resilient on low-bandwidth networks.
5. **Color is Never the Sole Signal**
   Every functional state (correct, wrong, blank, flagged, locked, pending) must combine color with a distinct icon, border pattern, or explicit label.

---

## 2. Color System & Design Tokens

### 2.1 Blue Scale (Primary & Ink)
The core brand identity and typographic hierarchy.

| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| `blue-50` | `#F3F6FC` | `bg-blue-50` | Default page background (paper tone) |
| `blue-100` | `#E4EBFA` | `bg-blue-100` | Table row hover, subtle card fills, inactive chips |
| `blue-200` | `#C7D4F5` | `bg-blue-200` | Soft dividers, selected radio/option backgrounds |
| `blue-300` | `#9DB0DC` | `text-blue-300` | Muted icons/text on dark backgrounds, disabled states |
| `blue-400` | `#5F83F0` | `bg-blue-400` | Secondary charts and graphic elements. *Not for body text* |
| `blue-500` | `#1747E8` | `bg-blue-500` | **Brand Accent**: interactive links, active tab lines, primary elevation shadows |
| `blue-600` | `#1239BD` | `bg-blue-600` | Button hover/pressed, "correct" status indicators |
| `blue-700` | `#0F2D96` | `text-blue-700` | High-contrast text on signal backgrounds, primary chart series |
| `blue-800` | `#12275F` | `bg-blue-800` | Dark surface containers (exam timer header, admin top bar) |
| `blue-900` | `#0B1B3F` | `bg-blue-900` / `text-blue-900` | **Ink**: primary typography, 2px borders, dark section backgrounds |

### 2.2 Slate Scale (Blue-Tinted Neutrals)
Neutral structural tokens tinted with cool blue undertones.

| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| `slate-300` | `#B9C5E2` | `border-slate-300` | 1px internal table and card divider lines |
| `slate-500` | `#7C8DB5` | `border-slate-500` | Dashed borders for empty or placeholder states |
| `slate-600` | `#3B4F80` | `border-slate-600` | Structural dividers on dark backgrounds |
| `slate-700` | `#34456B` | `text-slate-700` | Secondary body text and metadata labels |
| `white` | `#FFFFFF` | `bg-white` | Card backgrounds, text inputs, modal panels |

### 2.3 Accent, Status & Tier Tokens
Functional colors for user feedback and pricing highlights.

| Token | Hex | Tailwind Class | Meaning & Role |
|---|---|---|---|
| `signal` | `#FFD43B` | `bg-signal` / `bg-amber-400` | Primary action (CTA button), "unsure" test flag, active highlight |
| `signal-100` | `#FFF4C2` | `bg-signal-100` | Info and warning alert banner background |
| `signal-700` | `#7A5C00` | `text-signal-700` | High-contrast text on signal-100 surfaces |
| `warn` | `#C2410C` | `bg-warn` / `text-warn` | Errors, destructive actions, "wrong" question status (5:1 contrast) |
| `warn-100` | `#FDE7DA` | `bg-warn-100` | Error alert banner background |
| `emerald-600` | `#059669` | `border-emerald-600` | Best Value tier card border, success confirmation accents |
| `emerald-700` | `#047857` | `bg-emerald-700` | Best Value tier header banner, high-value highlights |

### 2.4 State Encoding Rules
- **Correct**: `blue-600` + Check icon (`Check`).
- **Wrong**: `warn` (`#C2410C`) + Cross icon (`X`).
- **Blank / Unanswered**: `slate-500` dashed border + dash indicator.
- **Unsure / Flagged**: `signal` (`#FFD43B`) + Flag icon (`Flag`).
- **Locked Section**: 8px diagonal stripe pattern (`blue-50`/`blue-100`) + Lock icon (`Lock`).
- Avoid arbitrary red/green pairings without accompanying iconography.

### 2.5 Surface Ratios & Visual Constraints
- Target distribution per screen: **70%** paper/white (`blue-50`/`white`), **20%** ink/brand (`blue-900`/`blue-500`), **10%** signal yellow or status accents.
- Contrast requirement: Minimum 4.5:1 for body copy; minimum 3:1 for large display text (≥24px).
- Strictly banned: Gradients, glowing drop-shadows, blurred glassmorphism (`backdrop-filter` blur used only for subtle header readability), and decorative soft corners.

---

## 3. Typography System

### 3.1 Font Families
| Role | Family | Fallbacks | Weights | Use Case |
|---|---|---|---|---|
| **Display** | `Bricolage Grotesque` | `sans-serif` | 800 (ExtraBold) | Hero headlines, major section headers, large score numbers |
| **Body & UI** | `Figtree` | `sans-serif` | 400, 500, 600, 700 | Primary interface text, questions, explanations, button labels |
| **Data & Code** | `DM Mono` | `monospace` | 400, 500 | Timers, question indices, prices, table numbers, metadata badges |

*Banned as primary typography: Inter, Roboto, Arial, System UI.*

### 3.2 Type Scale
| Level | Font & Weight | Size | Line Height | Tracking | Mobile Variant |
|---|---|---|---|---|---|
| `display-2xl` | Bricolage 800 | 84px | 1.00 | -0.03em | 44px |
| `display-xl` | Bricolage 800 | 56px | 1.02 | -0.025em | 34px |
| `display-lg` | Bricolage 800 | 34px | 1.10 | -0.025em | 26px |
| `display-md` | Bricolage 700/800 | 24px | 1.20 | -0.02em | 20px |
| `body-lg` | Figtree 400/500 | 18px / 20px | 1.60 | normal | 18px (Question text) |
| `body-md` | Figtree 400/500 | 15px / 16px | 1.50 | normal | 15px |
| `body-sm` | Figtree 400/500 | 13px / 14px | 1.45 | normal | 13px |
| `caption` | Figtree 400/500 | 12px | 1.40 | normal | 12px |
| `mono-label` | DM Mono 500 | 11px / 12px | 1.20 | +0.06em | 11px (Uppercase) |
| `mono-data` | DM Mono 400/500 | 14px – 28px | 1.20 | -0.01em | Tabular numbers |

---

## 4. Geometry, Grids & Hard Elevation

### 4.1 4px Spacing Scale
Values adhere strictly to multiples of 4:
`4px (1)`, `8px (2)`, `12px (3)`, `16px (4)`, `24px (6)`, `32px (8)`, `48px (12)`, `64px (16)`, `96px (24)`.

### 4.2 Containers & Breakpoints
- **Marketing / Landing Page**: Max width `1200px` (Horizontal padding: `16px` mobile, `32px` desktop).
- **Student Dashboard & Shop**: Max width `1120px`.
- **Test-Taking & Exam Column**: Max width `960px` (Single column focus).
- **Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). Mobile-first.

### 4.3 Borders & Corners
- **Corner Radius**: `0px` (`rounded-none`). All cards, inputs, buttons, chips, and modals have sharp 90-degree corners.
- **Primary Borders**: `2px solid var(--blue-900)`.
- **Inner Dividers**: `1px solid var(--slate-300)`.
- **Dashed State Borders**: `2px dashed var(--slate-500)` or `2px dashed var(--blue-500)`.

### 4.4 Hard Elevation (Offset Shadows, No Blur)
Shadows are flat geometric offsets using solid ink or brand colors:
- `--shadow-sm`: `2px 2px 0 var(--blue-900)` (Used for badges, small chips, secondary buttons).
- `--shadow-md`: `4px 4px 0 var(--blue-900)` (Used for standard cards, primary CTA buttons).
- `--shadow-lg`: `10px 10px 0 var(--blue-500)` (Used for active highlight cards, modals).
- `--shadow-emerald`: `4px 4px 0 #059669` (Used for Best Value tier card).

---

## 5. Pixel Art & Visual Asset Integration

To reinforce the retro-utility educational aesthetic, authentic 16-bit pixelated assets are integrated into key brand surfaces:

### 5.1 Pixel Coin Component (`PixelCoin`)
- Component: [`components/ui/pixel-coin.tsx`](file:///c:/JITU-ECOSYSTEM/jitu-frontend/components/ui/pixel-coin.tsx).
- Asset: Dedicated 16-bit gold coin sprite with blue center emblem (`/icons/coin-pixel.png`, `/icons/coin-pixel-64.png`, `/icons/coin-pixel-128.png`).
- Rendering: Crisp nearest-neighbor pixelated rendering via CSS `image-rendering: pixelated`.
- **Placement Rule**: Inside package and pricing cards, **exactly 1 coin** is placed directly to the left of the quantity number (e.g., `[🪙] 1 Coin`, `[🪙] 10 Coins`). No multi-coin stacks cluttering the card body.
- Small variants (`14px`–`16px`) are used in the navbar balance chip and modal confirmation headers.

### 5.2 Pixel Art Campus Illustration
- Asset: [`public/campus-pixel-art.png`](file:///c:/JITU-ECOSYSTEM/jitu-frontend/public/campus-pixel-art.png).
- Style: 16-bit architectural pixel illustration showcasing iconic Indonesian university landmarks (UI stepped pyramid, ITB curved heritage roof, UGM colonnade) with Bayer halftone dithering.
- Role: Displayed inside the pricing section banner to anchor the "16-Bit Retro Token System" aesthetic.

---

## 6. Component Specifications

### 6.1 Buttons
Minimum touch target: `44px` height. Border: `2px solid var(--blue-900)`. Radius: `0px`.
- **Primary Action (Signal)**:
  - Fill: `var(--signal)` (`#FFD43B`). Text: `var(--blue-900)` (`#0B1B3F`). Font: DM Mono bold uppercase or Figtree bold.
  - Shadow: `--shadow-md` (`4px 4px 0 var(--blue-900)`).
  - Hover: Shadow compresses to `2px 2px 0 var(--blue-900)` with `translate(2px, 2px)`.
  - Active: Shadow becomes `0` with `translate(4px, 4px)`.
- **Secondary Action (Blue)**:
  - Fill: `var(--blue-500)`. Text: `#FFFFFF`. Flat or `--shadow-sm`. Hover: `var(--blue-600)`.
- **Outline / Neutral**:
  - Fill: `#FFFFFF` or `transparent`. Text: `var(--blue-900)`. Border: `2px solid var(--blue-900)`. Hover: `bg-blue-50`.
- **Destructive**:
  - Fill: `var(--warn)`. Text: `#FFFFFF`. Border: `2px solid var(--blue-900)`.
- **Disabled State**:
  - Fill: `var(--blue-100)`. Text: `var(--slate-500)`. Border: `1px solid var(--slate-300)`. Shadow: `none`. Cursor: `not-allowed`.

### 6.2 Inputs, Textareas & Selects
- Height: `48px` (inputs), radius `0px`, border `2px solid var(--blue-900)`. Background: `#FFFFFF`.
- Label: Placed strictly **above** the input in 13px/14px Figtree semibold. Never use placeholder as the only label.
- Focus State: Visible `3px solid var(--blue-500)` outline with `2px` offset.
- Error State: Border changes to `var(--warn)` with inline error icon and text immediately below.

### 6.3 Cards & Containers
- Standard Card: Background `#FFFFFF`, border `2px solid var(--blue-900)`, shadow `--shadow-md`.
- Best Value Card: Border `2px solid var(--emerald-600)`, shadow `--shadow-emerald`, ring accent `ring-2 ring-emerald-500/20`.
- Header Stripe: Top bar with contrasting fill (`bg-blue-50`, `bg-blue-600`, or `bg-emerald-700`) separated by a `2px solid` bottom border.

### 6.4 Chips & Badges
- Height: `24px`–`28px`. Padding: `2px 8px`. Font: `DM Mono` 11px/12px uppercase tracking `0.06em`. Border: `1px` or `1.5px solid var(--blue-900)`.
- Variants:
  - Free: `bg-signal text-blue-900 border-blue-900`.
  - Active / Paid: `bg-blue-50 text-blue-900`.
  - Best Value: `bg-amber-400 text-slate-950 font-bold`.
  - Locked: `bg-white text-slate-700` + Lock icon.

### 6.5 Tables
- Header: Background `var(--blue-900)` or `var(--blue-50)` with `DM Mono` uppercase 12px text and 2px border underline.
- Rows: Divided by `1px solid var(--slate-300)`. Hover state `var(--blue-50)`.
- Data Alignment: Text left-aligned; numbers, dates, and currency right-aligned in tabular `DM Mono`.
- Mobile Adaptation: On screens `<640px`, tables collapse into stacked cards with clear key-value pairs.

### 6.6 Modals & Overlays
- Backdrop: `rgba(11, 27, 63, 0.6)` (`var(--blue-900)` at 60% opacity).
- Container: `#FFFFFF` surface, `2px solid var(--blue-900)`, `--shadow-lg`. Focus trapped, `Esc` dismisses.
- Responsive Behavior: Centered box (`max-w-lg`) on desktop; full-width bottom sheet on mobile screens.

### 6.7 Icons
- Library: `lucide-react` rendered as inline SVGs.
- Stroke Width: Uniform `1.75px` (or `2px` inside compact buttons).
- Size: Default `20px` / `24px`. Buttons: `16px` / `18px`.
- Color: Inherits `currentColor`. No decorative non-functional emojis in interface elements.

---

## 7. Screen Layout Architecture

### 7.1 Landing Page
- **Header**: Sticky white bar (`h-16`), brand logo left, navigation anchors middle, CTA button right.
- **Hero Section**: Two-column layout. Left: high-contrast headline (`display-xl`), supporting subhead, primary CTA. Right: interactive sample result card preview.
- **Weekly Schedule Section**: Dark background (`blue-900`), slot cards arranged in 3-column grid showing active and upcoming tryouts.
- **Pricing & Value Section (`#harga`)**:
  - Pixel art campus banner with "16-Bit Retro Token System" badge.
  - 4-column pricing cards (1, 3, 5, 10 coins) with single pixel coin beside amount and 10 coins package badged as Best Value.
  - Detailed side-by-side comparison table.
- **Footer**: High-contrast blue-900 background with quick links, copyright, and system status indicator.

### 7.2 Student Dashboard & Shell
- **Top Header**: Logo left, mono balance chip (`PixelCoin` + tabular count) right, user avatar.
- **Mobile Bottom Bar**: 56px height (`h-14`), 5-tab grid (Beranda, Tryout, Latihan, Coins, Akun).
- **Dashboard Body**: Next scheduled tryout card with countdown clock, quick practice banner, recent history.

### 7.3 Test-Taking Interface (Critical Focus)
- **Sticky Top Examination Bar**: Surface `blue-800` (`#12275F`). Subtest title left, question progress center, **countdown timer in 28px DM Mono** right. In the last 5 minutes, timer color shifts to `signal` with a clock icon (strictly non-blinking).
- **Central Question Workspace**: Max width `960px`. Clean typography (18px/20px, line height 1.6). Options A–E as full-width radio cards (min height 56px) with mono letter box.
- **Question Number Matrix**: 44px numbered squares. White = unanswered; Blue-500 = answered; Signal = flagged; Ink border + shadow = active.
- **Sticky Bottom Action Bar**: Navigation buttons (Previous, Flag, Next) with autosave status indicator. Submit triggers a summary modal (answered/flagged/blank tally).

### 7.4 Results & Solution Review
- **Summary Header**: Big IRT score block (`display-2xl`, `blue-500`) and subtest breakdown bars.
- **Locked Solution Overlay**: 8px diagonal striped pattern with lock icon and primary unlock button.
- **Detailed Solution View**: Filter tabs (All, Incorrect, Blank, Flagged). Each question shows chosen option vs key with step-by-step mathematical/conceptual explanation.

### 7.5 Coin Purchase & Payment
- 4 package tiers rendered as industrial cards with zero radius and solid borders.
- Modal QRIS checkout flow with countdown timer and automated payment status polling.

### 7.6 Admin Management Portal
- Desktop: Persistent `slate-900` / `blue-800` sidebar (64px collapsed / 256px expanded).
- Mobile: Top bar with hamburger navigation.
- High-density data tables, question batch editor, package price configuration, and payment reconciliation screens.

---

## 8. Motion & Micro-Interactions

- **Timing & Curves**:
  - Micro-interactions (hover, button press): `120ms` ease-out.
  - Structural overlays (modals, mobile sheets, dropdowns): `200ms` ease-out.
- **Permitted Properties**: Only `transform` and `opacity`. Never animate layout-triggering properties (`width`, `height`, `margin`, `padding`).
- **Button Feedback**: Hard shadow translates inward on press (`translate(2px, 2px)` / `translate(4px, 4px)`).
- **Prohibited Effects**: Parallax scrolling, bouncy spring physics, auto-playing video, or scroll-triggered entrance zooms.
- **Accessibility (`prefers-reduced-motion`)**: When active, all transitions and animations are disabled immediately (`transition: none; animation: none`).

---

## 9. Accessibility (A11y) Standards

- **Semantic HTML**: All interactive elements must use native `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` tags. Never attach click handlers to unstyled `<div>` elements.
- **Touch Targets**: Minimum `44px × 44px` physical interactive area on mobile viewports.
- **Focus Indicators**: Every interactive control must display a visible `3px solid var(--blue-500)` outline with `2px` offset when focused via keyboard.
- **Screen Reader Announcements**: The exam timer is announced once per minute (and at 5m/1m warnings) using `aria-live="polite"`. Never announce every elapsed second.
- **Form Association**: Every form field is programmatically associated with a distinct `<label>` via `htmlFor`/`id`.

---

## 10. CSS Implementation & Tokens Mapping

The design tokens are declared as CSS variables in [`app/globals.css`](file:///c:/JITU-ECOSYSTEM/jitu-frontend/app/globals.css) and exposed through Tailwind CSS:

```css
:root {
  /* Blue Scale */
  --blue-50:  #F3F6FC;
  --blue-100: #E4EBFA;
  --blue-200: #C7D4F5;
  --blue-300: #9DB0DC;
  --blue-400: #5F83F0;
  --blue-500: #1747E8;
  --blue-600: #1239BD;
  --blue-700: #0F2D96;
  --blue-800: #12275F;
  --blue-900: #0B1B3F;

  /* Slate Scale */
  --slate-300: #B9C5E2;
  --slate-500: #7C8DB5;
  --slate-600: #3B4F80;
  --slate-700: #34456B;

  /* Accent & Status */
  --signal:     #FFD43B;
  --signal-100: #FFF4C2;
  --signal-700: #7A5C00;
  --warn:       #C2410C;
  --warn-100:   #FDE7DA;

  /* Geometry & Elevation */
  --radius: 0px;
  --shadow-sm: 2px 2px 0 var(--blue-900);
  --shadow-md: 4px 4px 0 var(--blue-900);
  --shadow-lg: 10px 10px 0 var(--blue-500);

  /* Fonts */
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-body:    'Figtree', sans-serif;
  --font-mono:    'DM Mono', monospace;
}
```

---

## 11. Pre-Merge Visual Checklist

Run this checklist before merging any frontend PR or visual component update:

- [ ] **Token Compliance**: All colors use CSS variables / Tailwind tokens defined above; zero rogue hex codes.
- [ ] **Zero-Radius Enforced**: All buttons, cards, inputs, and modals have `rounded-none` / `border-radius: 0px`.
- [ ] **Hard Shadows Only**: Box-shadows use 0-blur offsets (`--shadow-sm`, `--shadow-md`, `--shadow-lg`); no soft blurred drop-shadows.
- [ ] **Typography Fonts**: Headlines use Bricolage Grotesque; body uses Figtree; metrics/timers/labels use DM Mono.
- [ ] **Pixel Coin Compliance**: Exactly 1 pixel coin icon positioned to the left of the quantity number inside pricing cards.
- [ ] **No Solitary Color Signals**: Statuses (correct, wrong, blank, flagged) always pair color with icon and text.
- [ ] **A11y & Contrast**: Minimum 4.5:1 text contrast verified; touch targets ≥ 44px; focus outlines visible.
- [ ] **Responsive Integrity**: Clean layout without horizontal scroll at `360px` viewport width.
- [ ] **Writing Authority Check**: No copywriting rules defined here; all text verified against [`writing.md`](file:///c:/JITU-ECOSYSTEM/jitu-frontend/writing.md).
