import React from "react";
import { ColumnStats } from "../lib/schemaInfer";
import { BadgeInfo } from "lucide-react";
import { cn } from "../lib/utils";

export interface SchemaInspectorProps {
  schema: ColumnStats[];
  rowCount: number;
}

export const SchemaInspector: React.FC<SchemaInspectorProps> = ({
  schema,
  rowCount
}) => {
  if (!schema.length) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 text-xs text-muted backdrop-blur">
        No columns detected yet. Import a CSV file to see inferred schema and
        basic stats.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
        <div className="inline-flex items-center gap-1">
          <BadgeInfo className="h-3.5 w-3.5 text-accent-cyan" />
          <span>
            {schema.length} columns &bull; Previewing {rowCount} rows
          </span>
        </div>
      </div>
      <div className="max-h-[340px] space-y-2 overflow-auto pr-1">
        {schema.map((col) => {
          const total = col.nonNullCount + col.nullCount || 1;
          const nullPct = (col.nullCount / total) * 100;

          return (
            <div
              key={col.name}
              className="rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-xs shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-[11px] font-semibold text-slate-100">
                    {col.name}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                      col.type === "integer" || col.type === "number"
                        ? "bg-accent-mint/20 text-accent-mint"
                        : col.type === "date"
                        ? "bg-accent-cyan/20 text-accent-cyan"
                        : "bg-accent-violet/20 text-accent-violet"
                    )}
                  >
                    {col.type}
                  </span>
                </div>
                <span className="text-[10px] text-muted">
                  {col.uniqueCount} unique
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-muted">
                <span>
                  Non-null:{" "}
                  <span className="text-slate-200">{col.nonNullCount}</span>
                </span>
                <span>
                  Null:{" "}
                  <span className="text-slate-200">
                    {col.nullCount} ({nullPct.toFixed(1)}%)
                  </span>
                </span>
                {col.sampleValues.length > 0 && (
                  <span className="truncate">
                    Samples:{" "}
                    <span className="text-slate-200">
                      {col.sampleValues.join(", ")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
