# DESIGN.md — Jitu (jituptn.com)

Single reference for the whole frontend: landing page, student app, and admin. If a component decision conflicts with this file, this file wins. UI copy stays in Indonesian; this document is in English.

## 1. Principles
1. **An exam sheet, not a SaaS template.** Hard lines, grids, mono numbers, square corners.
2. **Blue leads, yellow marks the action.** One yellow highlight per screen.
3. **Honest.** Real data only. No fake scarcity, invented testimonials, or claims we can't prove.
4. **Dense but readable.** Students take tests on phones, often on bad connections. Fast, light, clear.
5. **Color is never the only signal.** Always pair it with an icon or text.

References: sainsin.com (product UI as the hero, plain pricing and free-vs-paid comparison), siakjuara.com (slot grid with real data, worked price example, casual voice).

## 2. Color

### 2.1 Blue scale (primary)
| Token | Hex | Use |
|---|---|---|
| blue-50 | #F3F6FC | page background (paper) |
| blue-100 | #E4EBFA | subtle fills, row hover, locked-area stripes |
| blue-200 | #C7D4F5 | soft borders, selected-answer fill |
| blue-300 | #9DB0DC | muted text/icons on dark, disabled |
| blue-400 | #5F83F0 | illustration, secondary chart series. **Not for text** (contrast < 4.5) |
| blue-500 | #1747E8 | **brand**: links, blue buttons, big numbers, card shadow |
| blue-600 | #1239BD | hover/pressed for blue-500, "correct" status |
| blue-700 | #0F2D96 | blue text on yellow, primary chart series |
| blue-800 | #12275F | second dark surface (timer header, admin sidebar) |
| blue-900 | #0B1B3F | **ink**: primary text, borders, dark sections |

### 2.2 Slate (blue-tinted neutrals)
| Token | Hex | Use |
|---|---|---|
| slate-300 | #B9C5E2 | 1px table lines |
| slate-500 | #7C8DB5 | dashed placeholder borders, neutral icons |
| slate-600 | #3B4F80 | borders on dark backgrounds |
| slate-700 | #34456B | secondary text |
| white | #FFFFFF | cards, inputs |

### 2.3 Accent and status
| Token | Hex | Meaning |
|---|---|---|
| signal | #FFD43B | primary action (CTA), "unsure" status, the one highlight |
| signal-100 | #FFF4C2 | light info/warning banner background |
| signal-700 | #7A5C00 | text on signal-100 |
| warn | #C2410C | wrong, error, destructive (5:1 on white) |
| warn-100 | #FDE7DA | error message background |

Question and result states: **correct** = blue-600 + check icon. **wrong** = warn + cross icon. **blank** = dashed slate-500. **unsure** = signal + flag icon. Avoid red-green pairs.

### 2.4 Rules
- Surface ratio roughly 70% blue-50/white, 20% blue-900/500, 10% signal.
- Body text 4.5:1 minimum; text at 24px and above 3:1.
- No purple, no gradients, no glow. The 8px diagonal stripe pattern (blue-50/blue-100) is only for locked areas.
- Multi-series charts: separate by lightness (blue-300, 500, 700, 900), not hue. One highlighted series may use signal.

## 3. Typography
| Role | Font | Spec |
|---|---|---|
| Display | Bricolage Grotesque 800 | tracking -0.025em, line-height 1.02 |
| Body, UI | Figtree 400/600/700 | line-height 1.5 |
| Data, labels, timer, question numbers | DM Mono 400/500 | labels 12px uppercase, tracking .06em |

Scale: 12 / 14 / 16 / 18 / 22 / 34 / 56 / 84. On phones H1 84 → 44 and H2 56 → 34. Question text: 18px mobile / 20px desktop, line-height 1.6. Numbers are always DM Mono and tabular. Banned as the main font: Inter, Roboto, Arial, system-ui.

## 4. Spacing, grid, shape
- 4px spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Containers: marketing 1200px (padding 32), app 1120px, test-taking page 960px. Phone padding 16.
- Breakpoints: 640 (sm), 1024 (lg), 1280 (xl). Mobile-first.
- Radius **0** everywhere. Only exception: round avatars.
- Borders: 2px ink for primary components, 1px slate-300 for inner dividers, 2px dashed blue-500/slate-500 for empty or locked states.
- Elevation is hard shadow only, no blur: `sm 2px 2px 0 ink`, `md 4px 4px 0 ink`, `lg 10px 10px 0 blue-500`.
- Z-index: content 0, sticky 10, dropdown 20, modal 30, toast 40.

## 5. Components

**Button** (min height 44px, padding 14×22, 2px ink border)
- Primary: signal fill, ink text, md shadow. Hover: shadow shrinks to 2px. Active: shadow 0 and shift 4px.
- Blue: blue-500 fill, white text, no shadow (secondary action, e.g. "Buka · 1 kuota").
- Secondary: transparent, ink border. Destructive: warn fill, white text.
- Disabled: blue-100 fill, slate-500 text, no shadow. Loading: label becomes "Memproses…", not clickable.

**Input, textarea, select**: white, 2px ink border, 48px tall, label above (never placeholder-as-label). Focus: 3px blue-500 outline, 2px offset. Error: warn border plus a message with icon below. Helper text 14px slate-700.

**Radio and checkbox**: 24px square, 2px ink border; selected = blue-500 fill with white check. The whole row is clickable.

**Card**: white, 2px ink border. Highlight variant: lg shadow in blue-500 (max one per screen). No colored left borders.

**Table**: mono uppercase 12px header with 2px ink underline; rows separated by 1px slate-300; hover blue-50; numbers right-aligned. On phones it collapses into a stacked list.

**Chip / badge**: 1.5px ink border, padding 3×8, mono 12px uppercase. Free = signal, Locked = white + lock icon, Done = blue-100.

**Tabs**: 16px/600 text, 3px blue-500 underline for active. **Pagination**: 44px mono numbered squares.

**Modal**: white panel, 2px ink border, lg shadow, ink 60% overlay. Focus trapped, Esc closes, primary action bottom-right. On phones it becomes a full-width bottom sheet.

**Toast**: bottom-left, 2px ink border, icon + text, dismisses after 5s (errors stay).

**Banner**: signal-100 for info/warning, warn-100 for error, icon on the left, no thick left border.

**Skeleton**: static blue-100 blocks with slow opacity pulse. No gradient shimmer.

**Icons**: 1.75px stroke SVG, 24px (20px inside buttons), `currentColor`, inline. Icon-only buttons need `aria-label`. No emoji.

## 6. Screens

### 6.1 Landing (marketing)
Nav → hero (copy left, sample result card right) → schedule (slot grid on ink) → how to pay (explainer + price table) → social proof (300+ students, 14 schools, story placeholders) → blue-500 CTA band → footer. Visual reference: the landing artboard.

### 6.2 Auth (sign up, log in, forgot password)
Single 420px column, white card, centered. Sign up: name, email or WhatsApp, password, school. Inline per-field errors; password has show/hide. One signal CTA per screen.

### 6.3 Student dashboard
- App header: "jitu." logo left; quota balance (mono chip) and avatar right. Phones: bottom tab bar (Beranda, Tryout, Riwayat, Akun), 56px tall.
- Top: next tryout (large slot card with mono countdown) and a Kerjakan button.
- Middle: tryout schedule grid (slot component, section 7). Bottom: history and quota balance, buy-quota button.

### 6.4 Test-taking (most critical)
- **Sticky top bar** (blue-800, white text): tryout title, active subtest, **timer in DM Mono 28px**. Last 5 minutes: timer turns signal with a clock icon. It must not blink.
- **Question column** (max 960px): mono question number, question text 18–20px, images full width with alt text. Options A–E as large radio rows (min 56px) with the letter in a mono box. Selected = blue-200 fill + blue-500 border.
- **Number panel**: grid of 44px squares (desktop: right side; phone: bottom sheet opened by a "Nomor" button). States: unanswered = white, answered = blue-500 with white text, unsure = signal with flag, current = 3px ink border plus blue shadow.
- **Sticky bottom bar**: Sebelumnya, Tandai ragu, Berikutnya. Answers autosave; show a mono "Tersimpan" / "Menyimpan…" indicator. Offline: signal-100 banner "Tidak ada koneksi, jawaban disimpan di perangkat".
- **Submit**: summary modal (answered / unsure / blank), then confirm. No submit button in the top bar, so it can't be tapped by accident.
- Visual reference: the Tryout artboard.

### 6.5 Results
- **Free (no quota used)**: three boxes Benar / Salah / Kosong plus a striped locked block (IRT score and explanations) with a blue button "Buka · 1 kuota".
- **After unlocking**: total IRT score (display 84px, blue-500), per-subtest bars (blue-300/500/700/900 with mono values at the end), then a question list filterable by Semua / Salah / Kosong / Ragu. Each question shows status, your answer vs key, and a collapsible text explanation.
- Unlock confirmation modal: "Pakai 1 kuota untuk membuka Tryout #n? Sisa kuota jadi x." State clearly that it can't be undone.

### 6.6 Buy quota
Same price table as the landing (1 / 3 / 5 / 10 quota = Rp15.000 / 35.000 / 55.000 / 95.000, per-tryout price computed automatically). Pick pack → summary → payment. The cheapest per-tryout pack gets the signal highlight.

### 6.7 Admin
Blue-800 sidebar (desktop) or top menu (phone). Contents: filterable tables, forms with labels above, question import, tryout status chips (Draf, Terjadwal, Berjalan, Selesai). Dense and functional, same tokens, no decoration.

## 7. Slot (shared component)
Box with 2px border, mono `#n` label, 34px display date. States: open/active = signal fill; upcoming = white; done = blue-100 + check; missed = dashed. Used on the landing and the dashboard.

## 8. States and feedback
- **Loading**: skeletons for lists and cards; buttons show a progress label. No label-less spinner longer than 2s.
- **Empty**: dashed slate-500 box, one sentence, one CTA. Example: "Belum ada tryout yang dikerjakan. Tryout #1 dibuka 2 Nov."
- **Error**: say what happened and what the user can do. Never blame the user.
- **Locked**: diagonal stripes + lock icon + the exact cost ("1 kuota").

## 9. Motion
- 120ms (hover, press), 200ms (modal, sheet), ease-out. Animate only `transform` and `opacity`.
- Buttons: shadow shrinks on hover and press. No parallax, bounce, or scroll-triggered entrance animation.
- Respect `prefers-reduced-motion`: everything except instant state changes is off.

## 10. Accessibility
- Every control is a native element (`button`, `a`, `input` + `label`). No `div` with onClick.
- Touch targets at least 44×44px. Focus is always visible. Tab order follows visual order.
- Question states (correct, wrong, blank, unsure) use icon + text + color.
- Announce the timer to screen readers once per minute, not every second.
- Contrast: see 2.4.

## 11. Voice and microcopy
Casual Indonesian, short sentences, verb first, no jargon. "Kamu", never "Anda".
- Good: "Kerjakan gratis. Bayar kalau mau tahu salahnya di mana."
- Buttons: Daftar gratis, Kerjakan, Buka · 1 kuota, Kumpulkan.
- Avoid: "Revolusioner", "Tingkatkan potensimu", "Unlock", excessive exclamation marks, emoji.
- Format: Rp15.000 (dot thousands), dates "2 Nov 2026", 24-hour time.

## 12. Implementation

```css
:root {
  --blue-50:#F3F6FC; --blue-100:#E4EBFA; --blue-200:#C7D4F5; --blue-300:#9DB0DC;
  --blue-400:#5F83F0; --blue-500:#1747E8; --blue-600:#1239BD; --blue-700:#0F2D96;
  --blue-800:#12275F; --blue-900:#0B1B3F;
  --slate-300:#B9C5E2; --slate-500:#7C8DB5; --slate-600:#3B4F80; --slate-700:#34456B;
  --signal:#FFD43B; --signal-100:#FFF4C2; --signal-700:#7A5C00;
  --warn:#C2410C; --warn-100:#FDE7DA;
  --font-display:'Bricolage Grotesque',sans-serif;
  --font-body:'Figtree',sans-serif;
  --font-mono:'DM Mono',monospace;
  --shadow-sm:2px 2px 0 var(--blue-900);
  --shadow-md:4px 4px 0 var(--blue-900);
  --shadow-lg:10px 10px 0 var(--blue-500);
}
```

Tailwind: map the tokens above into `theme.extend.colors`, `fontFamily`, and `boxShadow`; set default `borderRadius` to `0`. Load fonts from Google Fonts with `display=swap` and keep `sans-serif` / `monospace` fallbacks.

## 13. Pre-merge checklist
- [ ] Only tokens from this file, no loose hex values
- [ ] No gradients, glow, glassmorphism, or colored left-border cards
- [ ] No emoji icons; no Inter/Roboto/Arial
- [ ] No lorem ipsum, invented numbers, or fake testimonials
- [ ] Status never distinguished by color alone
- [ ] 44px touch targets, visible focus, 4.5:1 contrast
- [ ] Clean at 360px width; test-taking page checked on a slow connection
- [ ] One signal highlight per screen
