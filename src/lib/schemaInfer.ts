export type ColumnType = "integer" | "number" | "date" | "string";

export interface ColumnStats {
  name: string;
  type: ColumnType;
  nonNullCount: number;
  nullCount: number;
  uniqueCount: number;
  sampleValues: string[];
}

/**
 * Infer a simple schema from CSV headers + rows.
 * We look at:
 * - type (integer/number/date/string)
 * - non-null vs null count
 * - unique count
 * - a few sample values
 */
export function inferSchema(
  headers: string[],
  rows: string[][]
): ColumnStats[] {
  const rowCount = rows.length;

  return headers.map((header, colIdx) => {
    let nonNullCount = 0;
    let nullCount = 0;
    let numericCount = 0;
    let integerCount = 0;
    let dateCount = 0;
    let stringishCount = 0;

    const unique = new Set<string>();
    const samples: string[] = [];

    for (let i = 0; i < rowCount; i++) {
      const raw = rows[i]?.[colIdx] ?? "";
      const value = raw.trim();

      if (!value) {
        nullCount++;
        continue;
      }

      nonNullCount++;
      unique.add(value);
      if (samples.length < 3 && !samples.includes(value)) {
        samples.push(value);
      }

      // Simple type heuristics
      const maybeNumber = Number(value);
      const isNumeric = !Number.isNaN(maybeNumber) && value !== "";

      if (isNumeric) {
        numericCount++;
        if (Number.isInteger(maybeNumber)) {
          integerCount++;
        }
        continue;
      }

      const timestamp = Date.parse(value);
      if (!Number.isNaN(timestamp)) {
        dateCount++;
        continue;
      }

      stringishCount++;
    }

    const type = chooseColumnType({
      numericCount,
      integerCount,
      dateCount,
      stringishCount,
      nonNullCount
    });

    return {
      name: header || `(column ${colIdx + 1})`,
      type,
      nonNullCount,
      nullCount,
      uniqueCount: unique.size,
      sampleValues: samples
    };
  });
}

interface TypeCounts {
  numericCount: number;
  integerCount: number;
  dateCount: number;
  stringishCount: number;
  nonNullCount: number;
}

function chooseColumnType(counts: TypeCounts): ColumnType {
  const { numericCount, integerCount, dateCount, stringishCount, nonNullCount } = counts;

  if (nonNullCount === 0) {
    return "string";
  }

  const scored: { type: ColumnType; score: number }[] = [
    { type: "number", score: numericCount },
    { type: "integer", score: integerCount },
    { type: "date", score: dateCount },
    { type: "string", score: stringishCount }
  ];

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];

  if (top.type === "number" && integerCount === numericCount) {
    return "integer";
  }

  return top.type;
}
