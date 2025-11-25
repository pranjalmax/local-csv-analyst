import Papa, { ParseResult } from "papaparse";

export interface ParsedCSV {
  fileName: string;
  delimiter: string;
  headers: string[];
  rows: string[][];
}

/**
 * Parse a CSV file using Papa Parse.
 *
 * - Auto-detects delimiter.
 * - Returns header row + up to `maxPreviewRows` body rows.
 * - All parsing happens in the browser.
 *
 * IMPORTANT:
 * We treat most PapaParse "errors" as non-fatal (e.g., delimiter warnings).
 * We only fail hard if the file is truly empty / unparsable.
 */
export function parseCSVFile(
  file: File,
  maxPreviewRows = 200
): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      preview: maxPreviewRows + 1, // +1 for header row
      worker: true,
      complete: (results: ParseResult<string[]>) => {
        try {
          // Log any parse warnings/errors for debugging,
          // but do NOT automatically reject on them.
          if (results.errors && results.errors.length > 0) {
            console.warn("PapaParse reported non-fatal issues:", results.errors);
          }

          const data = results.data || [];
          if (!data.length) {
            reject(
              new Error(
                "The CSV file appears to be empty or could not be parsed."
              )
            );
            return;
          }

          const [headerRow, ...bodyRows] = data;

          const headers = headerRow.map((h) => (h ?? "").toString().trim());
          const cleanedRows: string[][] = bodyRows
            .filter((row) => row && row.length > 0)
            .map((row) =>
              headers.map((_, colIdx) => {
                const val = row[colIdx];
                return val !== undefined && val !== null ? String(val) : "";
              })
            );

          resolve({
            fileName: file.name,
            delimiter: results.meta.delimiter || ",",
            headers,
            rows: cleanedRows
          });
        } catch (err) {
          console.error("Unexpected CSV parsing error:", err);
          reject(
            err instanceof Error ? err : new Error("Unknown CSV parsing error.")
          );
        }
      },
      error: (err) => {
        console.error("PapaParse fatal error:", err);
        reject(
          err instanceof Error ? err : new Error("Failed to parse CSV file.")
        );
      }
    });
  });
}
