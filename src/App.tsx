import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { NavBar } from "./components/NavBar";
import { GradientBG } from "./components/GradientBG";
import { ScrollVideoBackground } from "./components/ScrollVideoBackground";
import { Toaster } from "./components/ui/sonner";
import { AnalyzePage } from "./pages/AnalyzePage";
import { DataPage } from "./pages/DataPage";
import { DashboardPage } from "./pages/DashboardPage";
import { Database, LineChart, LayoutGrid } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0]">
      <GradientBG />
      <ScrollVideoBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          {/* Animated headline / sparkles could go here later */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Local CSV Analyst
              </h1>
              <p className="text-xs text-muted">
                Drop a CSV, run SQL locally via DuckDB-wasm, and get charts + narratives — all offline after first load.
              </p>
            </div>
          </div>

          <Tabs defaultValue="analyze" className="flex flex-1 flex-col">
            <TabsList aria-label="Main sections" className="mb-4 self-start">
              <TabsTrigger value="analyze">
                <LineChart className="h-3.5 w-3.5 text-accent-violet" aria-hidden="true" />
                <span>Analyze</span>
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
                <span>Data</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <LayoutGrid className="h-3.5 w-3.5 text-accent-mint" aria-hidden="true" />
                <span>Dashboard</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="flex-1">
              <AnalyzePage />
            </TabsContent>
            <TabsContent value="data" className="flex-1">
              <DataPage />
            </TabsContent>
            <TabsContent value="dashboard" className="flex-1">
              <DashboardPage />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t border-slate-800/70 bg-slate-950/40 py-3 text-center text-[11px] text-muted backdrop-blur">
          Runs fully in your browser • Data stays local • Powered by DuckDB-wasm
        </footer>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
