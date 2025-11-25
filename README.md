# Local CSV Analyst

Drop a CSV → app suggests smart questions, runs SQL locally via DuckDB-wasm, renders interactive charts, and generates a short analyst-style narrative — all offline after first load.

- 🚫 **Zero cost**: No paid APIs or servers.
- 🧠 **Client-side only**: Data stays in the browser; CSVs are never uploaded.
- ⚡ **DuckDB-wasm**: Run SQL locally against your CSV.
- 📈 **Charts & narratives**: Auto-selected visualizations and template-based insights.
- 🎨 **AI aesthetic**: Dark theme, neon accents, glassmorphism, scroll-reactive video background.

---

## 60-second Quickstart

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


Then in the app:

Go to Data → drag & drop a CSV (for example industry.csv).

Inspect the preview and schema (types, null %, sample values).

Go to Analyze → click a Smart question and run it.

See:

SQL that runs in DuckDB-wasm

Result grid

Auto-selected chart

Template-based narrative

Optionally add the insight to Dashboard and export CSV or Markdown.

How it works (high level)

CSV ingest

Files are parsed in the browser (no upload).

We detect delimiter, read the first chunk of rows for preview, and infer basic types.

The full dataset is loaded into an in-memory DuckDB table called data.

Smart questions

Based on the inferred schema (numeric, categorical, date-like), we synthesize a few SQL templates:

Total row counts

Group-by counts

Simple aggregations / trends

Each template targets the data table.

SQL engine (DuckDB-wasm)

We spin up a DuckDB-wasm instance in the browser.

Smart questions and custom SQL both compile to queries on data.

Results are returned as { columns, rows, rowCount }.

Charts & narratives

We inspect the result shape and choose a chart config (bar/line/pie/line) using Chart.js.

A narrative engine computes simple stats (min/max/top category, averages) and fills in a text template.

Dashboard & export

Any insight (SQL + chart config + narrative + result) can be pinned to the Dashboard.

Cards are persisted to localStorage so they survive a refresh in the same browser.

You can export the result as CSV or copy a Markdown summary.

Tech stack

Framework: React + Vite

Styling: Tailwind CSS

Motion: Framer Motion

Icons: lucide-react

UI kit: shadcn/ui (Button, Card, Tabs, etc.)

Engine: DuckDB-wasm (in-browser SQL)

Charts: Chart.js

State: Zustand

Storage: localStorage for dashboard insights

Fonts: Inter (UI), JetBrains Mono (code) via Google Fonts

Project structure (simplified)
src/
  components/
  pages/
  store/
  lib/
public/
  csv-analyst-loop.mp4

Privacy & limitations

CSV files never leave your browser.

DuckDB-wasm runs entirely on the client; there is no backend.

Designed for CSVs in the 5–10 MB range. Larger files may work but will feel slower.

Narratives are template-based, not LLM-powered, so they are simple and deterministic.