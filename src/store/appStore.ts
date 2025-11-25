import { create } from "zustand";
import type { ParsedCSV } from "../lib/csvUtils";
import type { ColumnStats } from "../lib/schemaInfer";

export interface DatasetState {
  csv: ParsedCSV;
  schema: ColumnStats[];
}

interface AppState {
  dataset: DatasetState | null;
  setDataset: (dataset: DatasetState | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  dataset: null,
  setDataset: (dataset) => set({ dataset })
}));
