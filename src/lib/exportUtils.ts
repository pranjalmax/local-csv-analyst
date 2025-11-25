// src/lib/exportUtils.ts
// Helpers to export SQL results as CSV, and to copy Markdown summaries.

import type { SQLResult } from "./duckdbClient";

/**
 * Convert a SQLResult into a CSV string.
 */
export function resultToCsv(result: SQLResult): string {
  const { columns, rows } = result;

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escape).join(",");
  const body = rows.map((row) => row.map(escape).join(",")).join("\n");

  return `${header}\n${body}`;
}

/**
 * Trigger a CSV download in the browser.
 */
export function downloadResultAsCsv(result: SQLResult, baseName: string) {
  const csv = resultToCsv(result);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const safeBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "query-result";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeBase}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy a Markdown summary (title + SQL + narrative) to the clipboard.
 */
export async function copyMarkdownToClipboard(params: {
  title: string;
  sql: string;
  narrative: string;
}) {
  const { title, sql, narrative } = params;

  const markdown = [
    `### ${title || "Query insight"}`,
    "",
    "**Query**",
    "",
    "```sql",
    sql.trim(),
    "```",
    "",
    "**Summary**",
    "",
    narrative.trim()
  ].join("\n");

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(markdown);
    } else {
      // Fallback: create a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  } catch (err) {
    console.error("Failed to copy Markdown to clipboard:", err);
    throw err;
  }
}
