// @ts-ignore - Bun built-in module
import { Database } from "bun:sqlite";
// @ts-ignore - Node built-in module
import path from "path";
// @ts-ignore - Node built-in module
import { fileURLToPath } from "url";
import type { ParsedKLine } from "./extract-from-binance";

interface KlineRow {
  id: number;
  asset: string;
  open_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  close_time: number;
  quote_volume: number;
  trades: number;
  taker_buy_base_volume: number;
  taker_buy_quote_volume: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "computed", "assets-timeseries.db");

class KlinesDB {
  private db: Database;

  constructor() {
    this.db = new Database(DB_FILE, { readonly: true });
  }

  /**
   * Get klines for a specific asset
   */
  getKlines(asset: string, limit?: number): ParsedKLine[] {
    const query = limit
      ? `SELECT * FROM klines WHERE asset = ? ORDER BY open_time ASC LIMIT ?`
      : `SELECT * FROM klines WHERE asset = ? ORDER BY open_time ASC`;

    const stmt = this.db.prepare(query);
    const rows = limit ? stmt.all(asset, limit) : stmt.all(asset);

    return (rows as KlineRow[]).map(this.rowToKline);
  }

  /**
   * Get klines for a specific asset within a time range
   */
  getKlinesByTimeRange(
    asset: string,
    startTime: number,
    endTime: number
  ): ParsedKLine[] {
    const stmt = this.db.prepare(`
      SELECT * FROM klines 
      WHERE asset = ? AND open_time >= ? AND open_time <= ?
      ORDER BY open_time ASC
    `);

    const rows = stmt.all(asset, startTime, endTime) as KlineRow[];
    return rows.map(this.rowToKline);
  }

  /**
   * Get klines for multiple assets
   */
  getKlinesForAssets(
    assets: string[],
    limit?: number
  ): Record<string, ParsedKLine[]> {
    const result: Record<string, ParsedKLine[]> = {};

    for (const asset of assets) {
      result[asset] = this.getKlines(asset, limit);
    }

    return result;
  }

  /**
   * Get all available assets
   */
  getAssets(): string[] {
    const stmt = this.db.prepare(
      `SELECT DISTINCT asset FROM klines ORDER BY asset`
    );
    const rows = stmt.all() as { asset: string }[];
    return rows.map((row) => row.asset);
  }

  /**
   * Get kline count for an asset
   */
  getKlineCount(asset: string): number {
    const stmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM klines WHERE asset = ?`
    );
    const result = stmt.get(asset) as { count: number };
    return result.count;
  }

  /**
   * Get time range for an asset
   */
  getTimeRange(asset: string): { min: number; max: number } | null {
    const stmt = this.db.prepare(`
      SELECT MIN(open_time) as min, MAX(open_time) as max 
      FROM klines WHERE asset = ?
    `);
    const result = stmt.get(asset) as { min: number; max: number } | null;

    if (!result || !result.min || !result.max) return null;

    return {
      min: result.min,
      max: result.max,
    };
  }

  /**
   * Get aggregated statistics for an asset
   */
  getAssetStats(asset: string) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as count,
        MIN(open_time) as earliest,
        MAX(open_time) as latest,
        AVG(volume) as avg_volume,
        SUM(volume) as total_volume,
        AVG(close) as avg_close,
        MIN(low) as min_price,
        MAX(high) as max_price
      FROM klines 
      WHERE asset = ?
    `);

    return stmt.get(asset);
  }

  /**
   * Query with custom SQL (for advanced analytics)
   */
  query<T = unknown>(sql: string, params?: unknown[]): T[] {
    const stmt = this.db.prepare(sql);
    return (params ? stmt.all(...params) : stmt.all()) as T[];
  }

  /**
   * Close the database connection
   */
  close() {
    this.db.close();
  }

  private rowToKline(row: KlineRow): ParsedKLine {
    return {
      openTime: row.open_time,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      closeTime: row.close_time,
      quoteVolume: row.quote_volume,
      trades: row.trades,
      takerBuyBaseVolume: row.taker_buy_base_volume,
      takerBuyQuoteVolume: row.taker_buy_quote_volume,
    };
  }
}

// Singleton instance
let dbInstance: KlinesDB | null = null;

export function getKlinesDB(): KlinesDB {
  if (!dbInstance) {
    dbInstance = new KlinesDB();
  }
  return dbInstance;
}

export { KlinesDB };
