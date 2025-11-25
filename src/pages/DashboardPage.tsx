// src/pages/DashboardPage.tsx
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarClock,
  MessageSquare,
  Trash2
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useDashboardStore } from "../store/dashboardStore";
import { ChartView } from "../components/ChartView";

export function DashboardPage() {
  const cards = useDashboardStore((s) => s.cards);
  const clear = useDashboardStore((s) => s.clear);

  const hasCards = cards.length > 0;

  return (
    <section className="space-y-4">
      <motion.div
        className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="border-accent-violet/40">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Pin your favorite queries as cards with charts and narratives.
                </CardDescription>
              </div>
              {hasCards && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={clear}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasCards ? (
              <div className="grid gap-4 md:grid-cols-2">
                {cards.map((card) => (
                  <DashboardCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <EmptyDashboardState />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-700/70">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-[0.2em] text-muted">
              How to use this tab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted">
            <ol className="list-decimal space-y-1 pl-4">
              <li>
                Go to{" "}
                <span className="font-semibold text-accent-cyan">Analyze</span>{" "}
                and run a smart question.
              </li>
              <li>
                Once you see a chart and narrative, click{" "}
                <span className="font-semibold text-slate-100">
                  Add to dashboard
                </span>
                .
              </li>
              <li>
                Come back here to see your saved cards and compare different
                cuts of the data.
              </li>
            </ol>
            <p>
              All cards live entirely in your browser session. Later we can add
              optional persistence via local storage or IndexedDB.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

function DashboardCard({ card }: { card: any }) {
  const remove = useDashboardStore((s) => s.removeCard);

  const created = new Date(card.createdAt);
  const createdLabel = created.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <Card className="group flex flex-col border-slate-700/80 bg-slate-900/70">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-2 py-1 text-[10px]">
            <BarChart3 className="h-3.5 w-3.5 text-accent-violet" />
            <span className="font-semibold text-slate-100">{card.title}</span>
          </div>
          {card.description && (
            <p className="text-[11px] text-muted">{card.description}</p>
          )}
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-400 hover:text-accent-error"
          onClick={() => remove(card.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-2">
          <ChartView config={card.chartConfig} />
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="inline-flex items-center gap-1 text-muted">
            <MessageSquare className="h-3 w-3 text-accent-mint" />
            <span>Insight</span>
          </div>
          <p>{card.narrative}</p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted">
          <div className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            <span>{createdLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDashboardState() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-900/60 p-4 text-xs text-muted">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1">
        <BarChart3 className="h-3.5 w-3.5 text-accent-cyan" />
        <span className="text-[11px] font-semibold text-slate-100">
          No dashboard cards yet
        </span>
      </div>
      <p>
        Run a smart question in the{" "}
        <span className="font-semibold text-accent-cyan">Analyze</span> tab and
        click{" "}
        <span className="font-semibold text-slate-100">Add to dashboard</span>{" "}
        to pin it here with its chart and narrative.
      </p>
    </div>
  );
}
