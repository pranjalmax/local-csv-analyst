import { Sparkles, Database, LineChart } from "lucide-react";
import { motion } from "framer-motion";

export function NavBar() {
  return (
    <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-accent-violet/40 bg-slate-900/70 px-3 py-1 shadow-glow-violet"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-accent-violet to-accent-cyan text-slate-950 shadow-glow-cyan">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide uppercase text-accent-cyan">
              Local CSV Analyst
            </span>
          </div>
        </motion.div>

        <motion.div
          className="hidden items-center gap-3 text-xs text-muted sm:flex"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-1">
            <Database className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Client-side only</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-1">
            <LineChart className="h-3.5 w-3.5 text-accent-violet" />
            <span>DuckDB-wasm and charts</span>
          </span>
        </motion.div>
      </div>
    </header>
  );
}
