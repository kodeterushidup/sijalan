---
name: SIJALAN
description: Internal government travel-management app; Indonesian official paperwork rendered as a calm, printable interface.
colors:
  ink: "#16323b"
  ink-soft: "#35525b"
  paper: "#f3efe4"
  surface: "#fffdf6"
  line: "#d6cfbc"
  muted: "#4d6065"
  accent: "#8a5a00"
  accent-deep: "#6f4900"
  accent-soft: "#f0e2b7"
  danger: "#9c2a20"
  danger-soft: "#f7e1dd"
  success: "#1d6247"
  success-soft: "#dcece2"
  info: "#1d5270"
  info-soft: "#dce9f1"
  warn: "#7a5200"
  warn-soft: "#f6e9c8"
typography:
  display:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "24px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.paper}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  chip-neutral:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: SIJALAN

## Overview

**Creative North Star: The Ledger Sheet.**

The interface behaves like a well-kept official register: warm off-white paper, near-black ink, a single engraved-ochre accent used only where the user must act or read a number. Serif headings come from the world of memoranda and SPPD letterhead; the sans body keeps dense tables and forms scannable. Nothing floats, nothing glows: surfaces are separated by a hairline rule, not a shadow, and the whole thing must survive `Ctrl+P` unchanged.

This is an **Operate** surface. The user's success is finishing a task — recording a trip, approving it, printing a numbered SPPD, uploading evidence — not admiring the page. Expression lives in the restraint: the exact warm grey of the divider, the consistency of a 44 px control height, the serif heading that makes an internal tool feel like an institution rather than a spreadsheet.

## Colors

### Primary

- **Ledger Ochre** (`#8a5a00`, deep `#6f4900`, soft `#f0e2b7`): the only interactive accent. Solid ochre = primary action; ochre text = link; ochre soft = selection, active nav, and the 2 px focus ring. White text on solid ochre measures 5.9:1; ochre text on paper 5.8:1.

### Neutral

- **Archive Ink** (`#16323b`): headings, primary text, the sidebar slab.
- **Soft Ink** (`#35525b`): secondary headings and chip text inside the sidebar.
- **Paper** (`#f3efe4`): page background. Everything sits on paper; nothing sits on white except fields.
- **Surface** (`#fffdf6`): cards, tables, the content plane. One step lighter than paper, never brighter than a field.
- **Rule** (`#d6cfbc`): every border in the system, 1 px. Dividers are the depth model.
- **Muted** (`#4d6065`): descriptions, metadata, table captions — 5.7:1 on paper, 6.5:1 on surface.

### Status

Semantic pairs only, each a deep text color plus a soft fill: **Verified Green** `#1d6247`/`#dcece2`, **Rejection Red** `#9c2a20`/`#f7e1dd`, **Notice Blue** `#1d5270`/`#dce9f1`, **Caution Amber** `#7a5200`/`#f6e9c8`. Status never uses the ochre accent; ochre means "click me".

### Named Rules

**The One Accent Rule.** Ochre appears on one primary action per screen region and on links. If two solid ochre buttons sit side by side, one of them is wrong.

**The No Pure White Rule.** White (`#ffffff`) is reserved for input fields and the printed page. Cards are `surface`, the page is `paper`.

## Typography

### Hierarchy

- **Display** (Instrument Serif, 400, 30 px mobile → 36 px desktop, 1.15): page titles via `PageHeader`, the sidebar wordmark, focal figures. Serif is the voice of the institution; it appears in headings and never in body copy or tables.
- **Title** (Instrument Sans, 600, 14–16 px): card headers, section titles, table column heads (uppercase, 11–12 px, letter-spaced, muted).
- **Body** (Instrument Sans, 400, 14 px, 1.5): table cells, form text, descriptions.
- **Label** (Instrument Sans, 500, 14 px): field labels, 6 px above their control.
- **Numeric** (Instrument Sans, 400, `tabular-nums`): every rupiah amount, date count, and page indicator.

### Named Rules

**The Serif Is a Signature Rule.** Instrument Serif is never used below 20 px and never for anything but a heading, the wordmark, or a hero figure. It does not set buttons, labels, badges, or table data.

**The Balanced Heading Rule.** Long titles carry `text-balance`; prose and printed dates carry `text-pretty`. Single-word headings get neither.

**The Tabular Number Rule.** Money, dates, and counters in tables and stat cards use `tabular-nums` so columns align and figures do not shimmer.

## Layout

Desktop-first (1280–1440 px is the working width), comfortable down to 360 px.

- Shell: fixed 15–16 rem `bg-ink` sidebar on `lg+`, single column below, with a sticky top bar holding page context and the account menu.
- Content column: `max-w-6xl`-class container, `px-4 sm:px-6 lg:px-8`, page title block with 32 px bottom margin, then stacked card sections with 24 px gaps.
- Data tables live inside a `card` with a `relative` scroll wrapper and `min-w-[720px]` so they scroll horizontally instead of squeezing. Every scroll wrapper must be `position: relative` or screen-reader-only spans escape and create page-level horizontal scroll.
- Forms: single column on mobile; two or three fields per row from `sm` up using grid with explicit `minmax(0,1fr)` tracks so inputs never collapse.
- Print: `.no-print` hides chrome; the SPPD and report pages target A4 with 2 cm margins.

Dials: energy 1 (still), rhythm 3 (regular, measured), motion 1 (state changes only).

## Elevation & Depth

Flat by doctrine. Depth is tonal plus a 1 px rule: `paper` behind, `surface` in front, `line` between. There are no drop shadows anywhere in the app; the only permitted elevation signal is a border color shift on hover (`line` → `ink-soft`).

### Named Rules

**The Hairline Depth Rule.** If a block needs separating, add one hairline border or change one surface step. Never a shadow, never a blur, never a gradient.

## Shapes

Corner radius is small and consistent: 4 px (`rounded-sm`) on buttons, inputs, chips and badges; 6 px (`rounded-md`) on cards, panels and table containers; 8 px (`rounded-lg`) only for overlays and dialogs. Borders are always exactly 1 px. Nothing is pill-shaped; nothing is fully square. Icons are 16–20 px strokes at 1.5–2 px weight, drawn as inline SVG in the page that uses them.

## Components

### Buttons

44 px minimum height, 4 px radius, 14 px semibold sans, 8 px × 16 px padding, icon + label with 8 px gap.

- **Primary**: solid `accent`, white label; hover and active darken to `accent-deep`; disabled becomes `line` fill with `muted` label.
- **Secondary**: `surface` fill, 1 px `line` border, `ink` label; hover shifts the border to `ink-soft` and the fill to `paper`.
- **Danger**: `danger-soft` fill, `danger` label and a 40 % `danger` border; hover strengthens the border.
- Transition is color-only, 150 ms. No lift, no scale.

### Chips

Status and role markers: 4 px radius, 2 px × 8 px padding, 12 px medium text, a soft status fill with its deep text color, and a 1 px border at 40 % of that color. Neutral chips use `paper` fill with `ink-soft` text. Chips are never clickable.

### Cards / Containers

`surface` fill, 1 px `line` border, 6 px radius, 16–24 px inner padding. Hover (only on clickable rows or cards) shifts the border to `line` → `ink-soft` and the fill to `paper/60`. Table containers keep their header row on `paper/60` with uppercase tracked muted labels.

### Inputs / Fields

44 px height, white fill, 1 px `line` border, 4 px radius, 14 px `ink` text, 12 px horizontal padding. Placeholder is `muted` (not faded). Focus swaps the border to `accent` and adds a 2 px `accent/25` ring; the global `:focus-visible` outline is 2 px `accent` at 2 px offset. Errors sit 6 px below the field in 14 px `danger`.

### Navigation

Sidebar on `ink`: links are 14 px, `white/70` at rest, white when active with an `accent-soft` left marker; the wordmark is `font-display` white at the top with a hairline `white/10` divider under the slab. Mobile navigation is a full-height overlay with `aria-modal`, body scroll locked, and Escape to close. The first Tab stop on every page is "Lewati ke konten".

### Stat card (signature component)

The dashboard's monthly figure is the one place the system raises its voice: a serif number at display scale, an uppercase tracked `muted` label above it, and — when the card links somewhere — an authored arrow that shifts 2 px on hover. Money uses `tabular-nums`.

## Do's and Don'ts

### Do

- Let a hairline rule and one surface step do the work of a shadow.
- Keep every interactive target at 44 px tall, including icon-only buttons.
- Set money and dates with `tabular-nums`, right-aligned in money columns.
- Use serif only for headings, the wordmark and hero figures.
- Give the first Tab stop to "Lewati ke konten"; keep the focus ring 2 px ochre at 2 px offset.
- Design the printed SPPD and report as first-class output: A4, 2 cm margins, no chrome.

### Don't

- Add a second accent color, a gradient, a glow, or a drop shadow.
- Use ochre on a status badge; status keeps its own semantic pair.
- Let a table squeeze below 720 px — scroll it inside a `relative` wrapper instead.
- Introduce a font outside Instrument Sans and Instrument Serif.
- Invent agency identity, logos, or statistics; the letterhead is the placeholder `Instansi Pemerintah`.
- Ship a screen that only works on hover or only works with a mouse.
