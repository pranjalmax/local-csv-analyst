import type { ColumnStats, ColumnType } from "./schemaInfer";

export interface SmartQuestion {
  id: string;
  label: string;
  description: string;
  sql: string;
}

/**
 * Generate 3–5 smart questions based on inferred schema.
 * The SQL assumes the CSV will be loaded into DuckDB as a table named "data".
 */
export function generateSmartQuestions(schema: ColumnStats[]): SmartQuestion[] {
  if (!schema.length) return [];

  const questions: SmartQuestion[] = [];

  const numericCols = schema.filter((c) =>
    c.type === "integer" || c.type === "number"
  );
  const dateCols = schema.filter((c) => c.type === "date");
  const catCols = schema.filter(
    (c) =>
      c.type === "string" &&
      c.uniqueCount > 1 &&
      c.uniqueCount <= Math.max(50, Math.round(c.nonNullCount * 0.8))
  );

  const fallbackStringCols = schema.filter((c) => c.type === "string");

  const firstMetric = numericCols[0];
  const secondMetric = numericCols[1];
  const firstCat = catCols[0] ?? fallbackStringCols[0];
  const firstDate = dateCols[0];

  // Q1: Count rows
  questions.push({
    id: "row-count",
    label: "Total rows in dataset",
    description:
      "Quick sanity check: how many rows are in the dataset after loading?",
    sql: `SELECT COUNT(*) AS row_count FROM data;`
  });

  // Q2: Category breakdown
  if (firstCat) {
    questions.push({
      id: `count-by-${sanitizeId(firstCat.name)}`,
      label: `Count by ${firstCat.name}`,
      description: `See how many rows fall into each ${firstCat.name} category.`,
      sql: `SELECT "${firstCat.name}" AS category, COUNT(*) AS count
FROM data
GROUP BY 1
ORDER BY count DESC
LIMIT 20;`
    });
  }

  // Q3: Top categories by metric
  if (firstMetric && firstCat) {
    questions.push({
      id: `top-${sanitizeId(firstCat.name)}-by-${sanitizeId(firstMetric.name)}`,
      label: `Top 10 ${firstCat.name} by avg ${firstMetric.name}`,
      description: `Rank ${firstCat.name} by the average ${firstMetric.name}.`,
      sql: `SELECT "${firstCat.name}" AS category,
       AVG("${firstMetric.name}") AS avg_${sanitizedMetric(firstMetric.name)}
FROM data
GROUP BY 1
ORDER BY avg_${sanitizedMetric(firstMetric.name)} DESC
LIMIT 10;`
    });
  }

  // Q4: Time trend
  if (firstMetric && firstDate) {
    questions.push({
      id: `trend-${sanitizeId(firstMetric.name)}-by-month`,
      label: `Trend of ${firstMetric.name} by month`,
      description: `Track how ${firstMetric.name} evolves over time at the monthly level.`,
      sql: `SELECT DATE_TRUNC('month', "${firstDate.name}") AS month,
       AVG("${firstMetric.name}") AS avg_${sanitizedMetric(firstMetric.name)}
FROM data
GROUP BY 1
ORDER BY month ASC;`
    });
  }

  // Q5: Metric distribution
  if (firstMetric) {
    questions.push({
      id: `distribution-${sanitizeId(firstMetric.name)}`,
      label: `Distribution of ${firstMetric.name}`,
      description:
        "Look at the value distribution and spot any skew or outliers.",
      sql: `SELECT "${firstMetric.name}" AS value
FROM data
WHERE "${firstMetric.name}" IS NOT NULL
ORDER BY value;`
    });
  }

  // Optional: correlation between two metrics
  if (firstMetric && secondMetric) {
    questions.push({
      id: `scatter-${sanitizeId(firstMetric.name)}-vs-${sanitizeId(
        secondMetric.name
      )}`,
      label: `${firstMetric.name} vs ${secondMetric.name}`,
      description:
        "See whether there is a simple linear relationship between two numeric metrics.",
      sql: `SELECT "${firstMetric.name}" AS x,
       "${secondMetric.name}" AS y
FROM data
WHERE "${firstMetric.name}" IS NOT NULL
  AND "${secondMetric.name}" IS NOT NULL;`
    });
  }

  // Limit to max 5
  return questions.slice(0, 5);
}

function sanitizeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "col";
}

function sanitizedMetric(name: string): string {
  return sanitizeId(name).replace(/-/g, "_");
}
