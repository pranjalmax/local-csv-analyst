import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Table } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { UploadDropzone } from "../components/UploadDropzone";
import { ParsedCSV } from "../lib/csvUtils";
import { ColumnStats, inferSchema } from "../lib/schemaInfer";
import { SchemaInspector } from "../components/SchemaInspector";
import { useAppStore, type DatasetState } from "../store/appStore";

export function DataPage() {
  const [localDataset, setLocalDataset] = useState<DatasetState | null>(null);
  const setGlobalDataset = useAppStore((state) => state.setDataset);

  const handleParsed = (parsed: ParsedCSV) => {
    const schema = inferSchema(parsed.headers, parsed.rows);
    const dataset: DatasetState = { csv: parsed, schema };
    setLocalDataset(dataset);
    setGlobalDataset(dataset);
  };

  const rowCount = localDataset?.csv.rows.length ?? 0;

  return (
    <motion.section
      className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Left: Upload + preview */}
      <Card className="border-accent-cyan/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-cyan/20">
              <Database className="h-3.5 w-3.5 text-accent-cyan" />
            </span>
            <div>
              <CardTitle>Data workspace</CardTitle>
              <CardDescription>
                Import CSVs, inspect schema, and preview rows — all in the
                browser.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadDropzone onParsed={handleParsed} />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Preview (first 50 rows)</span>
              {localDataset && (
                <span>
                  {rowCount} rows previewed &bull; Delimiter:{" "}
                  <span className="font-mono text-xs text-accent-cyan">
                    {JSON.stringify(localDataset.csv.delimiter)}
                  </span>
                </span>
              )}
            </div>

            <div className="max-h-[260px] overflow-auto rounded-xl border border-slate-700/70 bg-slate-900/50 text-[11px] backdrop-blur">
              {localDataset ? (
                <PreviewTable
                  headers={localDataset.csv.headers}
                  rows={localDataset.csv.rows}
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-[11px] text-muted">
                  No data loaded yet. Import a CSV to see a live preview here.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Schema inspector */}
      <Card className="border-slate-700/70">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-accent-violet" />
            <div>
              <CardTitle>Schema &amp; stats</CardTitle>
              <CardDescription>
                Inferred column types, null percentages, and unique counts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted">
          <SchemaSummary dataset={localDataset} />
        </CardContent>
      </Card>
    </motion.section>
  );
}

interface PreviewTableProps {
  headers: string[];
  rows: string[][];
}

/**
 * Compact preview table for the first N rows.
 */
function PreviewTable({ headers, rows }: PreviewTableProps) {
  const previewRows = rows.slice(0, 50);

  return (
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 z-10 bg-slate-950/90">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              scope="col"
              className="border-b border-slate-700/70 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-200"
            >
              {header || <span className="italic text-muted">(unnamed)</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {previewRows.map((row, rowIdx) => (
          <tr
            key={rowIdx}
            className={rowIdx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"}
          >
            {headers.map((_, colIdx) => (
              <td
                key={colIdx}
                className="truncate border-b border-slate-800/40 px-3 py-1 text-[11px] text-slate-200"
              >
                {row[colIdx]}
              </td>
            ))}
          </tr>
        ))}
        {previewRows.length === 0 && (
          <tr>
            <td
              colSpan={headers.length || 1}
              className="px-3 py-3 text-center text-[11px] text-muted"
            >
              No rows to preview yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

interface SchemaSummaryProps {
  dataset: DatasetState | null;
}

function SchemaSummary({ dataset }: SchemaSummaryProps) {
  if (!dataset) {
    return (
      <>
        <p>Once you load a CSV, we&apos;ll infer:</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Column types (integer, number, date, string)</li>
          <li>Non-null vs null counts and percentages</li>
          <li>Unique values and a few sample entries</li>
        </ul>
        <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-3 text-[11px] text-muted">
          This insight panel powers the smart questions and chart suggestions
          you&apos;ll see in the Analyze tab.
        </div>
      </>
    );
  }

  return (
    <SchemaInspector
      schema={dataset.schema}
      rowCount={dataset.csv.rows.length}
    />
  );
}
