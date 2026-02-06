// Bun server for SQLite database queries
// Run with: bun ./src/data/klines-api-server.ts

import { Database } from "bun:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import type { ParsedKLine } from "./extract-from-binance";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "computed", "assets-timeseries.db");

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

const db = new Database(DB_FILE, { readonly: true });

function rowToKline(row: KlineRow): ParsedKLine {
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

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      // Get all assets
      if (pathname === "/api/assets") {
        const stmt = db.prepare(
          `SELECT DISTINCT asset FROM klines ORDER BY asset`
        );
        const rows = stmt.all() as { asset: string }[];
        const assets = rows.map((row) => row.asset);
        return new Response(JSON.stringify(assets), { headers });
      }

      // Get klines for an asset
      if (pathname === "/api/klines") {
        const asset = url.searchParams.get("asset");
        const limit = url.searchParams.get("limit");

        if (!asset) {
          return new Response(
            JSON.stringify({ error: "asset parameter required" }),
            {
              status: 400,
              headers,
            }
          );
        }

        const query = limit
          ? `SELECT * FROM klines WHERE asset = ? ORDER BY open_time ASC LIMIT ?`
          : `SELECT * FROM klines WHERE asset = ? ORDER BY open_time ASC`;

        const stmt = db.prepare(query);
        const rows = limit
          ? (stmt.all(asset, parseInt(limit)) as KlineRow[])
          : (stmt.all(asset) as KlineRow[]);

        const klines = rows.map(rowToKline);
        return new Response(JSON.stringify(klines), { headers });
      }

      // Get klines by time range
      if (pathname === "/api/klines/range") {
        const asset = url.searchParams.get("asset");
        const startTime = url.searchParams.get("startTime");
        const endTime = url.searchParams.get("endTime");

        if (!asset || !startTime || !endTime) {
          return new Response(
            JSON.stringify({
              error: "asset, startTime, and endTime parameters required",
            }),
            { status: 400, headers }
          );
        }

        const stmt = db.prepare(`
          SELECT * FROM klines 
          WHERE asset = ? AND open_time >= ? AND open_time <= ?
          ORDER BY open_time ASC
        `);

        const rows = stmt.all(
          asset,
          parseInt(startTime),
          parseInt(endTime)
        ) as KlineRow[];
        const klines = rows.map(rowToKline);
        return new Response(JSON.stringify(klines), { headers });
      }

      // Get asset stats
      if (pathname === "/api/stats") {
        const asset = url.searchParams.get("asset");

        if (!asset) {
          return new Response(
            JSON.stringify({ error: "asset parameter required" }),
            {
              status: 400,
              headers,
            }
          );
        }

        const stmt = db.prepare(`
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

        const stats = stmt.get(asset);
        return new Response(JSON.stringify(stats), { headers });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers }
      );
    }
  },
});

console.log(`🚀 Klines API server running on http://localhost:${server.port}`);
console.log(`📊 Database: ${DB_FILE}`);
