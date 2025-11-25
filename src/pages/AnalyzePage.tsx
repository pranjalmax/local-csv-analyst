// src/pages/AnalyzePage.tsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Info,
  Database,
  Play,
  Plus,
  Download,
  Clipboard
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAppStore } from "../store/appStore";
import { generateSmartQuestions, SmartQuestion } from "../lib/smartQuestions";
import {
  loadDatasetIntoDuckDB,
  runQuery,
  SQLResult
} from "../lib/duckdbClient";
import { buildChartConfig, type ChartConfig } from "../lib/chartSelector";
import { ChartView } from "../components/ChartView";
import { NarrativePanel } from "../components/NarrativePanel";
import { generateNarrative } from "../lib/narratives";
import { useDashboardStore } from "../store/dashboardStore";
import {
  copyMarkdownToClipboard,
  downloadResultAsCsv
} from "../lib/exportUtils";

export function AnalyzePage() {
  const dataset = useAppStore((state) => state.dataset);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const questions = useMemo(
    () => (dataset ? generateSmartQuestions(dataset.schema) : []),
    [dataset]
  );

  const activeQuestion: SmartQuestion | null =
    questions.find((q) => q.id === activeQuestionId) ?? questions[0] ?? null;

  const hasDataset = !!dataset;

  // SQL execution state
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SQLResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Whenever the dataset changes, load it into DuckDB
  useEffect(() => {
    let cancelled = false;
    if (!dataset) {
      setIsEngineReady(false);
      setResult(null);
      setError(null);
      return;
    }

    (async () => {
      try {
        setIsEngineReady(false);
        setResult(null);
        setError(null);
        await loadDatasetIntoDuckDB(dataset);
        if (!cancelled) {
          setIsEngineReady(true);
        }
      } catch (err: any) {
        console.error("Failed to load dataset into DuckDB:", err);
        if (!cancelled) {
          setError(
            err?.message ||
              "Failed to initialize the local SQL engine for this dataset."
          );
          setIsEngineReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dataset]);

  const handleRun = async (sql: string) => {
    if (!hasDataset || !sql.trim()) return;

    setIsRunning(true);
    setError(null);

    try {
      const res = await runQuery(sql);
      setResult(res);
    } catch (err: any) {
      console.error("Query error:", err);
      setError(err?.message || "Query failed. Please check the SQL.");
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="grid gap-4 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)]">
      {/* Main analysis panel */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden border-accent-violet/40">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Analyze</CardTitle>
                <CardDescription>
                  Smart questions, SQL preview, and local query execution via
                  DuckDB-wasm.
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-muted">
                <Sparkles className="h-3 w-3 text-accent-cyan" />
                <span>Step 4–5: SQL + chart</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasDataset ? (
              <SmartQuestionsPanel
                questions={questions}
                activeQuestion={activeQuestion}
                onSelect={setActiveQuestionId}
                isEngineReady={isEngineReady}
                isRunning={isRunning}
                onRun={handleRun}
                result={result}
                error={error}
              />
            ) : (
              <EmptyAnalyzeState />
            )}
          </CardContent>
        </Card>

        {/* Workspace highlights (replaces old "Coming next" block) */}
        <Card className="glass-card border-slate-800/60 bg-slate-900/60">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-slate-100">Workspace highlights</CardTitle>
              <CardDescription className="text-slate-400">
                What this workspace already does for you after loading a CSV.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live in this build
            </span>
          </CardHeader>

          <CardContent className="grid gap-4 border-t border-slate-800/60 pt-4 text-sm text-slate-300 md:grid-cols-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                Smart questions &amp; guided SQL
              </div>
              <p className="text-slate-400">
                The app inspects your schema and suggests ready-to-run questions.
                Each one expands into a parameterized SQL template that targets a
                local DuckDB table named{" "}
                <code className="font-mono text-xs text-sky-300">data</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Local DuckDB engine + charts
              </div>
              <p className="text-slate-400">
                Queries run fully in your browser via DuckDB-wasm. Results flow
                into a compact grid and an auto-selected Chart.js view
                (bar/line/pie), with the option to tweak chart type based on the
                result shape.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Narratives, export, and dashboard
              </div>
              <p className="text-slate-400">
                Each chart gets a short, template-based narrative plus tools to
                download CSV, copy Markdown, and save the insight as a reusable
                dashboard card in the{" "}
                <span className="font-medium text-slate-200">Dashboard</span> tab.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sidebar with dataset summary */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="border-slate-700/70">
          <CardHeader>
            <CardTitle>Session overview</CardTitle>
            <CardDescription>
              Active dataset, basic stats, and smart question count.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted">
            {dataset ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Dataset</span>
                  <span className="max-w-[60%] truncate rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-200">
                    {dataset.csv.fileName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rows (in engine)</span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-200">
                    {dataset.csv.rows.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Columns</span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-200">
                    {dataset.schema.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Smart questions</span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-200">
                    {questions.length || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SQL engine</span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-200">
                    {isEngineReady ? "Ready (DuckDB-wasm)" : "Initializing…"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-muted">
                No dataset loaded yet. Switch to the{" "}
                <span className="font-semibold text-accent-cyan">Data</span> tab
                to import a CSV.
              </p>
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
              <li>Go to the Data tab and load a CSV.</li>
              <li>Come back here to see smart questions based on the schema.</li>
              <li>
                Pick a question or write custom SQL and hit{" "}
                <span className="font-semibold text-slate-100">Run query</span>{" "}
                to execute it locally and see a chart.
              </li>
            </ol>
            <p>
              Under the hood, each question is a SQL template targeting a DuckDB
              table named{" "}
              <span className="font-mono text-[11px] text-accent-cyan">
                data
              </span>
              , backed by DuckDB-wasm in your browser.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

interface SmartQuestionsPanelProps {
  questions: SmartQuestion[];
  activeQuestion: SmartQuestion | null;
  onSelect: (id: string) => void;
  isEngineReady: boolean;
  isRunning: boolean;
  onRun: (sql: string) => void;
  result: SQLResult | null;
  error: string | null;
}

function SmartQuestionsPanel({
  questions,
  activeQuestion,
  onSelect,
  isEngineReady,
  isRunning,
  onRun,
  result,
  error
}: SmartQuestionsPanelProps) {
  const addCard = useDashboardStore((s) => s.addCard);

  // Guided vs custom SQL mode.
  const [mode, setMode] = useState<"guided" | "custom">("guided");
  const [customSql, setCustomSql] = useState<string>("");

  // When the active guided question changes, update customSql (if empty) so
  // users can start from the template.
  useEffect(() => {
    if (activeQuestion && !customSql.trim()) {
      setCustomSql(activeQuestion.sql);
    }
  }, [activeQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!questions.length) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4 text-xs text-muted">
        We couldn&apos;t infer any strong signals for smart questions yet. Try
        loading a dataset with at least one numeric column and one categorical
        column (e.g., sales by region).
      </div>
    );
  }

  const chartConfig: ChartConfig | null = result ? buildChartConfig(result) : null;

  const sqlForGuided = activeQuestion?.sql ?? "";
  const sqlForCustom = customSql;
  const sqlCurrent = mode === "guided" ? sqlForGuided : sqlForCustom;

  const canRun =
    isEngineReady &&
    !isRunning &&
    ((mode === "guided" && !!activeQuestion && !!sqlForGuided.trim()) ||
      (mode === "custom" && !!sqlForCustom.trim()));

  const canAddToDashboard =
    !!activeQuestion && !!result && !!chartConfig && !error;
  const canExportCsv = !!result && !error;
  const canCopyMarkdown =
    !!activeQuestion && !!result && !!chartConfig && !error;

  const handleRunClick = () => {
    if (!sqlCurrent.trim()) return;
    onRun(sqlCurrent);
  };

  const handleAddToDashboard = () => {
    if (!activeQuestion || !result || !chartConfig) return;
    const narrative = generateNarrative(result, chartConfig);

    addCard({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: activeQuestion.label,
      description: activeQuestion.description,
      createdAt: Date.now(),
      query: sqlCurrent,
      result,
      chartConfig,
      narrative
    });
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const title = activeQuestion?.label || "query-result";
    downloadResultAsCsv(result, title);
  };

  const handleCopyMarkdown = async () => {
    if (!activeQuestion || !result || !chartConfig) return;
    const narrative = generateNarrative(result, chartConfig);

    try {
      await copyMarkdownToClipboard({
        title: activeQuestion.label,
        sql: sqlCurrent,
        narrative
      });
    } catch {
      // Already logged inside helper.
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)]">
        {/* Left: smart questions list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Smart questions</span>
            <span>{questions.length} suggestions</span>
          </div>
          <div className="space-y-2">
            {questions.map((q) => {
              const isActive = activeQuestion?.id === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelect(q.id);
                    if (mode === "guided") {
                      // When switching questions in guided mode, reset customSql
                      // to mirror the selected template.
                      setCustomSql(q.sql);
                    }
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-[11px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan ${
                    isActive
                      ? "border-accent-violet bg-slate-900/80 shadow-glow-violet text-slate-100"
                      : "border-slate-700/70 bg-slate-900/40 hover:border-accent-cyan/60 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-100">
                      {q.label}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-violet/20 px-2 py-0.5 text-[10px] text-accent-violet">
                        <Wand2 className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{q.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: SQL preview + editor + run button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>SQL workspace</span>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-slate-900/80 p-0.5 text-[10px]">
                <button
                  type="button"
                  className={`rounded-full px-2 py-0.5 ${
                    mode === "guided"
                      ? "bg-accent-violet text-slate-50"
                      : "text-muted hover:text-slate-100"
                  }`}
                  onClick={() => setMode("guided")}
                >
                  Guided
                </button>
                <button
                  type="button"
                  className={`rounded-full px-2 py-0.5 ${
                    mode === "custom"
                      ? "bg-accent-cyan text-slate-900"
                      : "text-muted hover:text-slate-100"
                  }`}
                  onClick={() => setMode("custom")}
                >
                  Custom SQL
                </button>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px]">
                <Info className="h-3 w-3 text-accent-cyan" />
                Runs in your browser via DuckDB-wasm
              </span>
            </div>
          </div>

          {/* Editor */}
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/90 p-2 text-[11px] text-slate-100 shadow-inner">
            {mode === "guided" ? (
              activeQuestion ? (
                <pre className="max-h-[180px] overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
{activeQuestion.sql}
                </pre>
              ) : (
                <p className="text-[11px] text-muted">
                  Select a smart question on the left to preview the SQL we&apos;ll
                  run in DuckDB.
                </p>
              )
            ) : (
              <div className="space-y-1">
                <label
                  htmlFor="custom-sql-editor"
                  className="sr-only"
                >
                  Custom SQL editor
                </label>
                <textarea
                  id="custom-sql-editor"
                  className="h-40 w-full resize-none rounded-lg border border-slate-700/80 bg-slate-950/90 p-2 font-mono text-[11px] leading-relaxed text-slate-100 outline-none focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                  spellCheck={false}
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  placeholder="WRITE YOUR OWN SQL HERE, e.g.&#10;SELECT Industry, COUNT(*) AS count FROM data GROUP BY 1 ORDER BY count DESC;"
                />
                <p className="text-[10px] text-muted">
                  Table name is{" "}
                  <span className="font-mono text-[10px] text-accent-cyan">
                    data
                  </span>
                  . Columns match your loaded CSV.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted">
            <Button
              type="button"
              size="sm"
              disabled={!canRun}
              onClick={handleRunClick}
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              {isRunning ? "Running…" : "Run query"}
            </Button>
            {!isEngineReady && (
              <span className="text-[10px] text-muted">
                Initializing local SQL engine…
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Result grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>Result grid</span>
          {result && (
            <span>
              {result.rowCount} row{result.rowCount === 1 ? "" : "s"} returned
            </span>
          )}
        </div>
        <div className="max-h-[220px] overflow-auto rounded-xl border border-slate-700/70 bg-slate-900/60 text-[11px]">
          {error && (
            <div className="p-3 text-[11px] text-accent-error">
              Query error: {error}
            </div>
          )}
          {!error && result && result.columns.length > 0 ? (
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-950/95">
                <tr>
                  {result.columns.map((col) => (
                    <th
                      key={col}
                      className="border-b border-slate-700/70 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-200"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={
                      rowIdx % 2 === 0
                        ? "bg-slate-900/40"
                        : "bg-slate-900/20"
                    }
                  >
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className="truncate border-b border-slate-800/40 px-3 py-1 text-[11px] text-slate-200"
                      >
                        {String(cell ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : !error ? (
            <div className="flex h-24 items-center justify-center text-[11px] text-muted">
              Run a smart question or custom SQL to see tabular results here.
            </div>
          ) : null}
        </div>
      </div>

      {/* Chart + narrative + add-to-dashboard + export */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Chart preview</span>
            <div className="flex items-center gap-2">
              {chartConfig && (
                <span className="text-[10px] text-muted">
                  {chartConfig.type.toUpperCase()} view
                </span>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canAddToDashboard}
                onClick={handleAddToDashboard}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add to dashboard
              </Button>
            </div>
          </div>
          <ChartView config={chartConfig} />
        </div>

        <NarrativePanel result={result} chartConfig={chartConfig} />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Export this result</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!canExportCsv}
              onClick={handleDownloadCsv}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canCopyMarkdown}
              onClick={handleCopyMarkdown}
            >
              <Clipboard className="mr-1.5 h-3.5 w-3.5" />
              Copy Markdown
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyAnalyzeState() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-900/60 p-4 text-xs text-muted">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1">
        <Database className="h-3.5 w-3.5 text-accent-cyan" />
        <span className="text-[11px]">
          No dataset loaded. Start in the Data tab.
        </span>
      </div>
      <p>
        This workspace lights up as soon as you import a CSV in the{" "}
        <span className="font-semibold text-accent-cyan">Data</span> tab. We&apos;ll
        infer the schema and synthesize smart questions you can run locally via
        DuckDB-wasm.
      </p>
    </div>
  );
}
