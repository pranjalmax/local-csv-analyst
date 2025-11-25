import React from "react";
import { MessageSquare } from "lucide-react";
import type { SQLResult } from "../lib/duckdbClient";
import type { ChartConfig } from "../lib/chartSelector";
import { generateNarrative } from "../lib/narratives";

interface NarrativePanelProps {
  result: SQLResult | null;
  chartConfig: ChartConfig | null;
}

export const NarrativePanel: React.FC<NarrativePanelProps> = ({
  result,
  chartConfig
}) => {
  const text = generateNarrative(result, chartConfig);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>Insight narrative</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px]">
          <MessageSquare className="h-3 w-3 text-accent-mint" />
          Template-based, no AI calls
        </span>
      </div>
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3 text-[11px] leading-relaxed text-slate-100">
        {text}
      </div>
    </div>
  );
};
