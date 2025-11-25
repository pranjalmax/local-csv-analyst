# Design & UX spec

## Visual language

- **Theme**: Dark-first, “AI aesthetic”
- **Background**: Animated gradient mesh with subtle motion and a scroll-reactive video.
- **Cards**: Glassmorphism style:
  - Background: `#0F172A` with translucent overlays.
  - Borders: subtle lines with accent glows.
  - Shadow: soft glow on hover / focus.

### Color tokens

- Base
  - `bg`: `#0B0F19`
  - `card`: `#0F172A`
  - `text`: `#E2E8F0`
  - `muted`: `#94A3B8`
- Accents
  - `accent-violet`: `#8B5CF6`
  - `accent-cyan`: `#22D3EE`
  - `accent-mint`: `#34D399`
  - `accent-warn`: `#F59E0B`
  - `accent-error`: `#F43F5E`
- Radii
  - Cards: `1.25rem`
  - Pills / chips: `9999px`
- Shadows
  - Hover/focus glow using accent colors blurred into the background.

### Typography

- **Inter**
  - `400` for body text
  - `600` for headings and key labels
- **JetBrains Mono**
  - SQL blocks
  - Code-style snippets in the UI (e.g., column names, table names)

---

## Layout

### Header

- Left: product pill **“LOCAL CSV ANALYST”** with neon ring and small icon.
- Right: pill badges, e.g.:
  - “Client-side only”
  - “DuckDB-wasm & charts”

Sits on top of the animated gradient + scroll video background.

### Global navigation

- Three tabs centered under the title:
  - **Analyze**
  - **Data**
  - **Dashboard**

Active tab uses a glowing pill with accent-violet, inactive tabs are low-contrast.

---

## Page layouts

### Analyze tab

Primary analysis workspace.

- **Left column**
  - “Smart questions” card
  - Each question is a pill-like button with:
    - Title
    - Short description
    - Small “Active” chip when selected

- **Center panel**
  - SQL workspace:
    - Mode toggle: *Guided* / *Custom SQL*
    - SQL textarea in JetBrains Mono
    - “Run query” button in accent-cyan gradient
  - Badge row showing:
    - “Runs in your browser via DuckDB-wasm”
    - Current status: Initializing / Ready / Error

- **Lower section**
  - Result grid (striped rows, sticky header).
  - Chart preview (Chart.js canvas inside a card).
  - Insight narrative block with a small “Template-based, no AI calls” label.
  - Export actions:
    - Download CSV
    - Copy Markdown
    - Add to dashboard

### Data tab

Data ingestion & schema inspection.

- **Left card**
  - Drag-and-drop area with icon.
  - “Drop a CSV here or click to browse” text.
  - Secondary line: “Local-only. No uploads.”
  - Button: “Choose file”

- **Center**
  - Preview table card:
    - Shows first N rows
    - Scrollable with sticky header

- **Right card**
  - “Schema & stats”
  - For each column:
    - Name
    - Inferred type badge (String / Number / Date / Boolean)
    - Non-null count + null %
    - Unique count
    - Small sample values

### Dashboard tab

Saved insights.

- Card grid (single column on mobile, 2–3 columns on larger screens).
- Each **dashboard card** contains:
  - Title (from smart question or custom label).
  - Mini chart (Chart.js).
  - Short narrative paragraph.
  - Footer:
    - Timestamp
    - Delete icon button
- “Clear all” button at the top right of the dashboard.

---

## Motion & micro-interactions

Using **Framer Motion** + Tailwind transitions.

- Durations
  - Hover / press: `180–240ms`
  - Card/page enter: `400–600ms`

- Examples
  - Cards:
    - Slight `y` lift and shadow on hover.
    - Accent glow ring when focused via keyboard.
  - Tabs:
    - Animated pill underline that slides between tabs.
  - Buttons:
    - Gradient shift on hover.
    - Subtle scale on press.

- Respect `prefers-reduced-motion`
  - When enabled, reduce / disable background movement and card float.
  - Keep essential transitions (focus outlines) but remove decorative animations.

---

## Scroll video background

- Video: data/visualization / analytic themed loop.
- Positioned fixed behind all content with dark overlay.
- **Scroll behavior**:
  - Playback tied to scroll progress of the main page.
  - Content cards remain fully readable; video is low-opacity and blurred.

---

## Accessibility

- **Keyboard**
  - All buttons, tabs, and links reachable via `Tab`.
  - Visible focus ring (`outline` + ring) using accent-cyan.

- **ARIA**
  - Tabs use proper `role="tablist"`, `role="tab"`, `role="tabpanel"`.
  - Icon-only buttons (e.g., delete on dashboard card) have `aria-label`.

- **Contrast**
  - Body text on card background meets WCAG AA.
  - Accent colors used primarily for borders, icons, and highlights — not small, low-contrast text.

---

## Component styling rules

- **Buttons**
  - Primary:
    - Gradient from `accent-cyan` → `accent-mint`.
    - White text, rounded-full.
  - Secondary:
    - Transparent background, subtle border (`#1E293B`), text in `#E2E8F0`.
  - Destructive:
    - Border and text use `accent-error`.

- **Cards**
  - Minimum padding: `1rem`–`1.5rem`.
  - Rounded corners: `1.25rem`.
  - Subtle border plus inner shadow on dark background.

- **SQL editor**
  - JetBrains Mono.
  - Slightly darker background than surrounding card.
  - Clear focus outline on click or keyboard.

- **Tables**
  - Sticky header row.
  - Alternating row background.
  - Compact padding for dense data display.

- **Charts**
  - Legend uses small font.
  - Axis labels rotated when category labels are long.
  - Use accent-violet / accent-cyan for main series.
