# Local CSV Analyst

**Local CSV Analyst** is a browser-only data analysis playground:

> Drop a CSV → app suggests smart questions, runs SQL locally via DuckDB-wasm, renders interactive charts, and generates a short analyst-style narrative — all offline after first load.

- 🚫 **Zero cost** – No paid APIs, no servers, no data leaving your browser.
- 🧠 **Local SQL engine** – DuckDB-wasm runs all queries against your CSV in memory.
- 📊 **Smart questions & charts** – Guided SQL templates plus auto-selected Chart.js views.
- 📝 **Narratives & exports** – Template-based insight blurbs, CSV export, and Markdown copy.
- 🎨 **AI aesthetic** – Dark neon gradients, glass cards, scroll-reactive background video.

---

## Live Demo

Hosted on GitHub Pages:

**https://pranjalmax.github.io/local-csv-analyst/**

![Local CSV Analyst Demo](./public/local_csv_gif.gif)

> All CSV data stays in your browser. Reloading the page clears the active dataset but keeps your saved dashboard cards (in localStorage).

---

## 60-Second Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# open http://localhost:5173

# 3. Build for production
npm run build

# 4. Preview production build locally (optional)
npm run preview
# open http://localhost:4173
```

Then in the app:

1. Go to the **Data** tab.
2. Drag & drop a CSV (e.g. `samples/product_sales.csv` or your own `industry.csv`).
3. Inspect the **Preview** (first rows) and **Schema & stats** (types, null %, unique counts).
4. Go to **Analyze**:
   - Click a **Smart question** (e.g. "Count by Industry").
   - Hit **Run query**.
   - See:
     - SQL that runs in DuckDB-wasm (table name: `data`)
     - Result grid
     - Auto-selected Chart.js view
     - Short narrative under **Insight narrative**
   - If it's useful, click **Add to dashboard**.
5. Visit the **Dashboard** tab to see your saved insight cards.

---

## How It Works

### 1. CSV Ingest (Client-Side Only)

- Files are loaded via the browser File API (drag & drop + file picker).
- Parsing happens entirely in the browser; nothing is uploaded.
- A small subset of rows is kept as preview for the Data tab.
- The full row array is loaded into an in-memory DuckDB table named `data`.

### 2. Schema Inference

`src/lib/schemaInfer.ts` walks the preview rows and infers, per column:

- Likely type: `string | number | date | boolean`
- Non-null count and null %
- Unique count (cardinality)
- A handful of sample values

This schema powers the smart question generator.

### 3. Smart Questions

`src/lib/smartQuestions.ts` reads the schema and synthesizes a small set of SQL templates, e.g.:

- Total rows in dataset
- Count by {category}
- Simple numeric summaries
- Trends over date-like columns

Each question has:

- `id`
- `label`
- `description`
- `sql` (text template targeting `FROM data`)

The Analyze tab renders these as pill buttons. Selecting a question shows the underlying SQL and lets you run it instantly.

### 4. Local SQL Engine (DuckDB-wasm)

`src/lib/duckdbClient.ts`:

- Boots a DuckDB-wasm instance in the browser.
- Creates table `data` with the inferred schema.
- Inserts rows from the active CSV.
- Exposes:

```typescript
runQuery(sql: string): Promise<SQLResult>;
```

where `SQLResult` is a simple object:

```typescript
interface SQLResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
}
```

No API calls, no backend – it's all WebAssembly in your tab.

### 5. Chart Selection & Rendering

`src/lib/chartSelector.ts` maps `SQLResult` → Chart.js config:

- 1 categorical + 1 numeric → bar chart
- date + numeric → line chart
- simple aggregations → bar or pie, depending on shape
- otherwise → conservative fallback

`src/components/ChartView.tsx` renders the chosen config using react-chartjs-2.

### 6. Narrative Generation

`src/lib/narratives.ts` generates a short insight paragraph using:

- Simple stats (min, max, top category, row count)
- Column names and chart type

Example:

> "This query groups rows by Industry and counts entries per category. Technology has the highest count at 42 rows, followed by Finance and Retail. Use this to spot dominant segments in the dataset."

No LLMs are involved; it's deterministic, template-based text.

### 7. Dashboard

`src/store/dashboardStore.ts` (Zustand):

- Persists "cards" with:
  - title, description
  - SQL query text
  - Result snapshot
  - Chart config
  - Narrative
  - Timestamp
- Uses localStorage for persistence in the current browser.

The Dashboard tab renders these cards in a responsive grid so you can revisit insights quickly.

---

## Tech Stack

- **Framework** – React + Vite
- **Styling** – Tailwind CSS
- **Motion** – Framer Motion (card/section transitions, hover lifts)
- **Icons** – lucide-react
- **UI kit** – shadcn/ui (Button, Card, Tabs, etc.)
- **State** – Zustand stores for app and dashboard state
- **Engine** – DuckDB-wasm (SQL in the browser)
- **Charts** – Chart.js + react-chartjs-2
- **Storage** – localStorage for saved dashboard cards
- **Fonts** – Inter (UI) & JetBrains Mono (code blocks)
- **Deploy** – GitHub Pages (vite build + gh-pages deploy script)

---

## Accessibility & UX

### Keyboard Friendly

- Tab through all buttons, tabs, and controls.
- Visible focus ring using an accent cyan ring.

### Accessible Tabs

- Proper `role="tablist"`, `role="tab"`, `role="tabpanel"` via shadcn/ui Tabs.

### Contrast

- Dark background (#0B0F19) with light text (#E2E8F0).
- Accent colors reserved for emphasis, not low-contrast text.

### Motion

- Framer Motion for enter/hover transitions.
- Respects `prefers-reduced-motion` to keep things comfortable.

---

## Project Structure (Simplified)

```
src/
  components/
    ChartView.tsx
    GradientBackground.tsx
    NavBar.tsx
    NarrativePanel.tsx
    UploadDropzone.tsx
    SchemaInspector.tsx
    ...
  pages/
    AnalyzePage.tsx
    DataPage.tsx
    DashboardPage.tsx
  store/
    appStore.ts        # active dataset, engine status
    dashboardStore.ts  # saved insight cards
  lib/
    csvUtils.ts        # CSV parsing helpers
    schemaInfer.ts     # basic type + stats inference
    smartQuestions.ts  # guided SQL templates
    duckdbClient.ts    # DuckDB-wasm wiring
    chartSelector.ts   # SQLResult -> Chart.js config
    narratives.ts      # template-based narrative engine
    exportUtils.ts     # CSV & Markdown export helpers

public/
  background-video.mp4           # scroll-reactive background loop
  local-csv-analyst-icon.svg     # favicon

samples/
  product_sales.csv
  timeseries_daily.csv

docs/
  architecture.md
  design.md
```

---

## Privacy & Limits

- ✅ **Data stays local** – CSVs are never uploaded.
- ✅ **No tracking** – No analytics or error reporting calls.
- Designed to comfortably handle 5–10 MB CSVs in modern browsers.
- Larger files may still work but will feel slower / heavier in memory.
- This is a demo/portfolio tool, not a production BI replacement.

---

## For Recruiters / Hiring Managers

This project is meant to showcase:

- Comfort with modern React tooling (Vite, Tailwind, Framer Motion, shadcn/ui).
- Ability to integrate a non-trivial engine (DuckDB-wasm) fully client-side.
- Designing and implementing:
  - Schema inference
  - Smart question templates
  - Result-to-chart mapping
  - Narrative generation without LLMs
- Attention to UX & accessibility:
  - Dark AI-styled interface
  - Smooth motion with respect for reduced motion
  - Keyboard and screen-reader-friendly layout
- Shipping a fully static app (GitHub Pages) that still feels like a mini analytics product.

If you're reviewing this repo and want a quick walkthrough, start with:

- `docs/architecture.md` – data and control flow
- `src/lib/duckdbClient.ts` – local SQL engine
- `src/pages/AnalyzePage.tsx` – main analysis workflow
- `src/store/dashboardStore.ts` – how insights are persisted