import type { SQLResult } from "./duckdbClient";

export type ChartType = "bar" | "line" | "pie" | "scatter";

export interface ChartConfig {
  type: ChartType;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
  xLabel?: string;
  yLabel?: string;
  description: string;
}

/**
 * Very small heuristic to pick a chart type & config from a SQLResult.
 * We only handle a few shapes for now:
 *
 *  - 1 column numeric       -> single-bar chart
 *  - 1 string + 1 numeric   -> bar or pie chart
 *  - 1 date + 1 numeric     -> line chart
 */
export function buildChartConfig(result: SQLResult): ChartConfig | null {
  if (!result.columns.length || !result.rows.length) return null;

  const cols = result.columns;
  const sampleRow = result.rows[0];

  // Helper to peek column types from first non-null value
  const colTypes = cols.map((_, idx) => inferType(firstNonNull(result.rows, idx)));

  // Case: single numeric column, e.g. SELECT COUNT(*) AS row_count
  if (cols.length === 1 && (colTypes[0] === "number" || colTypes[0] === "integer")) {
    const values = result.rows.map((r) => toNumberSafe(r[0])).filter((v) => v != null) as number[];

    return {
      type: "bar",
      labels: [cols[0]],
      datasets: [
        {
          label: cols[0],
          data: [values[0] ?? 0]
        }
      ],
      xLabel: "Metric",
      yLabel: cols[0],
      description: `Single metric value returned for ${cols[0]}.`
    };
  }

  // Case: two columns, dimension + metric
  if (cols.length === 2) {
    const [c0Type, c1Type] = colTypes;

    const dimIdx = c0Type === "string" ? 0 : c1Type === "string" ? 1 : 0;
    const metricIdx = dimIdx === 0 ? 1 : 0;

    const labels: string[] = result.rows.map(
      (r) => String(r[dimIdx] ?? "(null)")
    );

    const data: number[] = result.rows.map((r) => toNumberSafe(r[metricIdx]) ?? 0);

    // Decide chart type: if dimension looks categorical, use bar; if it's date-like, line.
    const dimSample = sampleRow[dimIdx];
    const dimLooksLikeDate = looksLikeDate(dimSample);

    const type: ChartType = dimLooksLikeDate ? "line" : "bar";

    return {
      type,
      labels,
      datasets: [
        {
          label: cols[metricIdx],
          data
        }
      ],
      xLabel: cols[dimIdx],
      yLabel: cols[metricIdx],
      description:
        type === "line"
          ? `Trend of ${cols[metricIdx]} over ${cols[dimIdx]}.`
          : `Breakdown of ${cols[metricIdx]} by ${cols[dimIdx]}.`
    };
  }

  // Fallback: treat first column as x, second as y numeric if possible
  const labels: string[] = result.rows.map((r) => String(r[0] ?? ""));
  const data: number[] = result.rows.map((r) => toNumberSafe(r[1]) ?? 0);

  return {
    type: "bar",
    labels,
    datasets: [
      {
        label: cols[1] ?? "value",
        data
      }
    ],
    xLabel: cols[0],
    yLabel: cols[1],
    description: `Basic bar chart using ${cols[0]} as categories and ${
      cols[1] ?? "values"
    } as the metric.`
  };
}

type SimpleType = "string" | "number" | "integer" | "date" | "unknown";

function firstNonNull(rows: any[][], colIdx: number): any | null {
  for (const row of rows) {
    const v = row[colIdx];
    if (v !== null && v !== undefined) return v;
  }
  return null;
}

function inferType(value: any): SimpleType {
  if (value == null) return "unknown";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }
  if (value instanceof Date) return "date";
  if (typeof value === "string") {
    if (looksLikeDate(value)) return "date";
    const n = Number(value);
    if (!Number.isNaN(n)) {
      return Number.isInteger(n) ? "integer" : "number";
    }
    return "string";
  }
  return "unknown";
}

function looksLikeDate(v: any): boolean {
  if (typeof v !== "string") return false;
  // quick-and-dirty: 2024-01-01, 01/02/2023, etc.
  return /\d{4}-\d{1,2}-\d{1,2}/.test(v) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v);
}

function toNumberSafe(v: any): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}
