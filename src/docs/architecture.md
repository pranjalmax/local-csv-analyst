# Architecture overview

## High-level flow

```text
CSV file
  │
  ▼
CSV ingest (File API + parser)
  │
  ├─ Preview buffer (first N rows for UI)
  └─ Full row array in memory
  │
  ▼
Schema inference (`schemaInfer.ts`)
  - Column types (string / number / date-like / boolean)
  - Null counts and percentages
  - Unique counts and sample values
  │
  ▼
Smart question generation (`smartQuestions.ts`)
  - A few parameterized SQL templates targeting table `data`
  │
  ▼
DuckDB-wasm engine (`duckdbClient.ts`)
  - Initialize DuckDB in the browser
  - CREATE TABLE data (...)
  - INSERT all rows
  - runQuery(sql) → SQLResult
  │
  ▼
Result mapping
  - `chartSelector.ts` → ChartConfig (type, labels, datasets)
  - `narratives.ts` → narrative string
  │
  ▼
UI & state
  - React pages (Analyze, Data, Dashboard)
  - Zustand stores (`appStore`, `dashboardStore`)
  - Chart.js renders charts
  - localStorage persists dashboard cards


Key modules
lib/duckdbClient.ts

Responsible for:

Initializing the DuckDB-wasm instance in the browser.

Creating and loading the data table from the active CSV.

Executing SQL and returning results in a simple shape.

export interface SQLResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
}


The UI calls:

const result = await runQuery(sqlText);


and binds result to the grid + chart.

lib/schemaInfer.ts

Walks the preview rows and infers, per column:

Likely type (string / number / date-like / boolean).

Non-null count and null percentage.

Unique value count and a few sample values.

Output is “schema metadata” used by smartQuestions.ts to decide which smart questions make sense (e.g., group-by on categorical columns, counts on everything, trends on date-like columns).

lib/smartQuestions.ts

Reads the inferred schema and synthesizes a small set of smart questions.

Example smart question:

{
  id: "row-count",
  label: "Total rows in dataset",
  description: "Quick sanity check: how many rows are in the dataset?",
  sql: "SELECT COUNT(*) AS row_count FROM data;"
}


Another example for a categorical column:

{
  id: "count-by-category",
  label: "Count by Industry",
  description: "See how many rows fall into each Industry category.",
  sql: 'SELECT "Industry" AS category, COUNT(*) AS count FROM data GROUP BY 1 ORDER BY count DESC LIMIT 20;'
}


The Analyze page:

Shows these as buttons.

When clicked, sets the active SQL and runs it through runQuery.

lib/chartSelector.ts

Inspects the SQLResult and chooses a reasonable chart config:

1 numeric column → simple bar chart.

1 categorical + 1 numeric → bar chart with categories on X axis.

date-like + numeric → line chart.

Otherwise → fallback (table-only or simple bar).

Returns a Chart.js config object that ChartView renders.

lib/narratives.ts

Takes SQLResult and optional schema context.

Computes lightweight stats:

Min / max value

Mean / average

Top category by count

Fills in a 1–3 sentence template, e.g.:

“This query groups rows by category and summarizes count. Accounting/Finance has the highest count at 1.00. On average, count is around 1.00 across all category groups.”

No LLM is used; it is fully deterministic and local.

store/appStore.ts

Holds session-level state:

Currently loaded dataset name.

Basic stats like row count and column count.

The last SQL result shown in Analyze.

This lets the Analyze, Data, and Dashboard pages stay in sync without prop drilling.

store/dashboardStore.ts

Manages dashboard cards:

Each card contains:

id

title (e.g., “Count by Industry”)

SQL text

Chart config

Narrative text

Timestamp

Cards are persisted to localStorage so they reappear after refresh.

The Dashboard page just subscribes to this store and renders cards.

Data lifecycle

Import / ingest

User drops a CSV file or selects via file picker.

Browser parses rows; file never leaves the device.

Preview & schema

A small preview subset is stored for the Data tab.

Schema inference runs on the preview to keep it fast.

Engine load

Full rows are loaded into DuckDB as table data.

From this point on, all queries target data.

Analysis

Smart questions and custom SQL queries run through DuckDB-wasm.

Results feed the table grid, chart, and narrative.

Dashboard

Selected insights are turned into cards and stored via dashboardStore.

Cards live in localStorage, not on a server.

Deployment & hosting

Built with Vite, output goes to dist/.

base is set to /local-csv-analyst/ so the app works when hosted at:

https://<username>.github.io/local-csv-analyst/

Everything is static HTML/JS/CSS + WASM:

No backend.

Fully compatible with GitHub Pages.

Privacy notes

CSV data is only ever held in browser memory and DuckDB-wasm.

We don’t send data to any server or external API.

Dashboard state (cards) in localStorage contains only query results, chart configs, and narratives — not the raw CSV file itself.