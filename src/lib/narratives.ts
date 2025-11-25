import type { SQLResult } from "./duckdbClient";
import type { ChartConfig } from "./chartSelector";

/**
 * Generate a short, template-based narrative for the current result + chart.
 * No LLM calls; just simple stats on the query output.
 */
export function generateNarrative(
  result: SQLResult | null,
  config: ChartConfig | null
): string {
  if (!result || !config || !result.rows.length) {
    return "Run a smart question to see a short, analyst-style narrative of the result here.";
  }

  const { columns, rows, rowCount } = result;

  // Single metric summary, e.g. SELECT COUNT(*) AS row_count FROM data;
  if (columns.length === 1) {
    const col = columns[0];
    const value = rows[0]?.[0];
    return `This query returns a single summary metric: ${col} = ${formatNumber(
      value
    )}, based on ${rowCount} row${rowCount === 1 ? "" : "s"} in the dataset.`;
  }

  // Two-column breakdown: dimension + metric (the most common case for charts)
  if (columns.length === 2) {
    const dimCol = columns[0];
    const metricCol = columns[1];

    let maxRow = rows[0];
    let minRow = rows[0];
    let total = 0;
    let nonNullCount = 0;

    for (const r of rows) {
      const vRaw = r[1];
      const v = Number(vRaw);
      if (!Number.isFinite(v)) continue;

      if (!Number.isFinite(Number(maxRow[1])) || v > Number(maxRow[1])) {
        maxRow = r;
      }
      if (!Number.isFinite(Number(minRow[1])) || v < Number(minRow[1])) {
        minRow = r;
      }

      total += v;
      nonNullCount += 1;
    }

    const avg = nonNullCount ? total / nonNullCount : null;
    const topLabel = String(maxRow[0]);
    const topValue = maxRow[1];
    const lowLabel = String(minRow[0]);
    const lowValue = minRow[1];

    let sentence = `This query groups ${rowCount} row${
      rowCount === 1 ? "" : "s"
    } by ${dimCol} and summarizes ${metricCol.toLowerCase()}. `;

    sentence += `${topLabel} has the highest ${metricCol.toLowerCase()} at ${formatNumber(
      topValue
    )}.`;

    if (lowLabel !== topLabel) {
      sentence += ` ${lowLabel} shows the lowest value at ${formatNumber(
        lowValue
      )}.`;
    }

    if (avg != null) {
      sentence += ` On average, ${metricCol.toLowerCase()} is around ${formatNumber(
        avg
      )} across all ${dimCol.toLowerCase()} groups.`;
    }

    return sentence;
  }

  // Fallback for wider result sets
  return `This query returns ${rowCount} row${
    rowCount === 1 ? "" : "s"
  } across ${columns.length} columns. The chart highlights one of the key numeric metrics; consider refining the SQL if you want a more focused slice of the data.`;
}

function formatNumber(value: any): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? "0");

  const abs = Math.abs(n);

  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  if (abs >= 100) return n.toFixed(0);
  if (abs >= 1) return n.toFixed(2);
  if (abs === 0) return "0";

  return n.toPrecision(2);
}
