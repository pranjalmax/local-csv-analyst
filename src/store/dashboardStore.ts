// src/store/dashboardStore.ts
// Dashboard state + robust localStorage persistence (browser-only).

import { create } from "zustand";
import type { SQLResult } from "../lib/duckdbClient";
import type { ChartConfig } from "../lib/chartSelector";

export interface DashboardCard {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  query: string;
  result: SQLResult;
  chartConfig: ChartConfig;
  narrative: string;
}

interface DashboardState {
  cards: DashboardCard[];
  addCard: (card: DashboardCard) => void;
  removeCard: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "local-csv-analyst-dashboard-v1";

/**
 * Make cell values safe for JSON.stringify.
 * - BigInt -> string
 * - Date   -> ISO string
 * - undefined -> null
 */
function sanitizeCell(value: unknown): unknown {
  if (value === undefined) return null;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

/**
 * Create a clone of SQLResult that is JSON-safe.
 */
function sanitizeResult(result: SQLResult): SQLResult {
  return {
    columns: [...result.columns],
    rowCount: result.rowCount,
    rows: result.rows.map((row) => row.map((cell) => sanitizeCell(cell)))
  };
}

/**
 * Before saving, sanitize result so localStorage can't blow up on BigInt, etc.
 */
function sanitizeCard(card: DashboardCard): DashboardCard {
  return {
    ...card,
    result: sanitizeResult(card.result)
    // chartConfig and narrative are already plain JSON data by design.
  };
}

/**
 * Safely read dashboard cards from localStorage.
 * If anything looks off, we just return an empty array.
 */
function loadInitialCards(): DashboardCard[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    // Light validation – just check required fields exist.
    const valid = parsed.filter((item) => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.createdAt === "number" &&
        typeof item.query === "string" &&
        item.result &&
        Array.isArray(item.result.columns) &&
        Array.isArray(item.result.rows) &&
        typeof item.result.rowCount === "number" &&
        item.chartConfig &&
        typeof item.narrative === "string"
      );
    });

    // Console debug so you can see it's loading.
    console.debug(
      "[dashboardStore] Loaded cards from localStorage:",
      valid.length
    );

    return valid;
  } catch (err) {
    console.error("Failed to load dashboard cards from localStorage:", err);
    return [];
  }
}

/**
 * Persist the given cards list to localStorage.
 */
function persistCards(cards: DashboardCard[]) {
  if (typeof window === "undefined") return;

  try {
    const sanitized = cards.map(sanitizeCard);
    const serialized = JSON.stringify(sanitized);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    console.debug(
      "[dashboardStore] Persisted cards to localStorage:",
      sanitized.length
    );
  } catch (err) {
    // If storage is full or blocked, we just log and continue.
    console.error("Failed to persist dashboard cards:", err);
  }
}

export const useDashboardStore = create<DashboardState>((set) => ({
  cards: loadInitialCards(),

  addCard: (card) =>
    set((state) => {
      const next = [card, ...state.cards];
      persistCards(next);
      return { cards: next };
    }),

  removeCard: (id) =>
    set((state) => {
      const next = state.cards.filter((c) => c.id !== id);
      persistCards(next);
      return { cards: next };
    }),

  clear: () =>
    set(() => {
      const next: DashboardCard[] = [];
      persistCards(next);
      return { cards: next };
    })
}));
