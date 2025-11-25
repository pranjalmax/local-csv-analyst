import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWasmMvp from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdbWorkerMvp from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdbWasmEh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdbWorkerEh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

import type { DatasetState } from "../store/appStore";
import type { ColumnType } from "./schemaInfer";

let connectionPromise: Promise<any> | null = null;

// Used to avoid double-loading the same dataset (React StrictMode runs effects twice in dev)
let lastDatasetSignature: string | null = null;

/**
 * Manual DuckDB-wasm bundle for Vite.
 * We import the WASM + worker files with ?url so Vite serves them
 * from the same origin as your app (no cross-origin worker issues).
 */
const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdbWasmMvp,
    mainWorker: duckdbWorkerMvp
  },
  eh: {
    mainModule: duckdbWasmEh,
    mainWorker: duckdbWorkerEh
  }
};

/**
 * Singleton connection creator.
 */
async function getConnection(): Promise<any> {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

      // Worker is served by Vite from the same origin.
      const worker = new Worker(bundle.mainWorker!);

      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);

      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

      const conn = await db.connect();
      return conn;
    })();
  }
  return connectionPromise;
}

export interface SQLResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
}

/**
 * Build a simple signature for the dataset so we can detect
 * "same dataset reloaded" vs "brand new dataset".
 */
function computeDatasetSignature(dataset: DatasetState, tableName: string) {
  return [
    tableName,
    dataset.csv.fileName ?? "unknown",
    dataset.csv.rows.length,
    dataset.schema.length
  ].join("|");
}

/**
 * Load the current dataset into DuckDB as a table named "data".
 * Rebuilds the table whenever the dataset actually changes.
 */
export async function loadDatasetIntoDuckDB(
  dataset: DatasetState,
  tableName = "data"
): Promise<void> {
  const conn = await getConnection();

  const headers = dataset.csv.headers;
  const rows = dataset.csv.rows;
  const schema = dataset.schema;

  if (!headers.length) return;

  const signature = computeDatasetSignature(dataset, tableName);
  if (signature === lastDatasetSignature) {
    // Same dataset as last time – likely React StrictMode double-running the effect.
    // Skip to avoid inserting duplicate rows.
    return;
  }
  lastDatasetSignature = signature;

  // Drop and recreate the table fresh
  await conn.query(`DROP TABLE IF EXISTS ${tableName};`);

  const colDefs = headers.map((name, idx) => {
    const colStats = schema[idx];
    const sqlType = mapColumnTypeToSQL(colStats?.type);
    return `"${name}" ${sqlType}`;
  });

  const createSQL = `CREATE TABLE ${tableName} (${colDefs.join(", ")});`;
  await conn.query(createSQL);

  // Prepare INSERT statement
  const placeholders = headers.map(() => "?").join(", ");
  const insertSQL = `INSERT INTO ${tableName} VALUES (${placeholders});`;
  const stmt = await conn.prepare(insertSQL);

  // Insert each row (prepared statement API uses .query, not .run)
  for (const row of rows) {
    await stmt.query(...row);
  }

  await stmt.close();
}

function mapColumnTypeToSQL(type: ColumnType | undefined): string {
  switch (type) {
    case "integer":
      return "BIGINT";
    case "number":
      return "DOUBLE";
    case "date":
      return "TIMESTAMP";
    case "string":
    default:
      return "VARCHAR";
  }
}

/**
 * Execute a SQL query against the in-browser DuckDB connection
 * and return a simple grid structure for rendering.
 */
export async function runQuery(sql: string): Promise<SQLResult> {
  const conn = await getConnection();
  const table = await conn.query(sql);

  const rowsAsObjects: any[] = table.toArray();
  const columns: string[] = table.schema.fields.map((f: any) => f.name);

  const rows: any[][] = rowsAsObjects.map((obj) =>
    columns.map((col) => obj[col])
  );

  return {
    columns,
    rows,
    rowCount: rows.length
  };
}
