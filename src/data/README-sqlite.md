# SQLite Database for Timeseries Analytics

This setup allows you to efficiently query your 500MB `assets-timeseries.json` file using SQLite instead of loading everything into memory.

## Quick Start

### 1. Import JSON to SQLite

Run the import script once to convert your JSON file to SQLite:

```bash
bun ./src/data/import-to-sqlite.ts
```

This will:

- Read `computed/assets-timeseries.json`
- Create `computed/assets-timeseries.db` with indexed tables
- Show progress and final statistics

### 2. Start the API Server

For client-side usage (React components), start the API server:

```bash
npm run api
# or
bun ./src/data/klines-api-server.ts
```

The server will run on `http://localhost:3001`

### 3. Use in Client Code (React Components)

```typescript
import { getKlinesAPI } from "./data/klines-api-client";

const api = getKlinesAPI();

// Get all assets
const assets = await api.getAssets();

// Get klines for an asset
const btcKlines = await api.getKlines("BTCUSDT", 100); // Last 100 klines

// Get klines for a time range
const dayKlines = await api.getKlinesByTimeRange(
  "BTCUSDT",
  Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
  Date.now()
);

// Get statistics
const stats = await api.getAssetStats("BTCUSDT");
```

### 4. Use in Server-Side Scripts

For server-side scripts (not React components), use the direct database access:

```typescript
import { getKlinesDB } from "./data/klines-db";

const db = getKlinesDB();

// Get klines for an asset
const btcKlines = db.getKlines("BTCUSDT", 100);

// Get all assets
const assets = db.getAssets();

// Custom SQL queries
const topVolume = db.query(`
  SELECT asset, AVG(volume) as avg_volume
  FROM klines
  GROUP BY asset
  ORDER BY avg_volume DESC
  LIMIT 10
`);
```

### 5. Run Example Analytics

```bash
bun ./src/data/example-analytics.ts
```

## Benefits

- **Fast queries**: Indexed database instead of parsing 500MB JSON
- **Memory efficient**: Only loads what you query
- **SQL power**: Use SQL for complex analytics
- **Type-safe**: Full TypeScript support
- **Browser compatible**: API server allows client-side usage

## Database Schema

```sql
CREATE TABLE klines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset TEXT NOT NULL,
  open_time INTEGER NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume REAL NOT NULL,
  close_time INTEGER NOT NULL,
  quote_volume REAL NOT NULL,
  trades INTEGER NOT NULL,
  taker_buy_base_volume REAL NOT NULL,
  taker_buy_quote_volume REAL NOT NULL
);

-- Indexes for fast queries
CREATE INDEX idx_asset_time ON klines(asset, open_time);
CREATE INDEX idx_asset ON klines(asset);
CREATE INDEX idx_time ON klines(open_time);
```

## API Reference

### Client API (`klines-api-client.ts`)

- `getAssets()` - Get all available assets
- `getKlines(asset, limit?)` - Get klines for an asset
- `getKlinesByTimeRange(asset, startTime, endTime)` - Get klines in time range
- `getAssetStats(asset)` - Get aggregated statistics

### Server API (`klines-db.ts`)

- `getKlines(asset, limit?)` - Get klines for an asset
- `getKlinesByTimeRange(asset, startTime, endTime)` - Get klines in time range
- `getKlinesForAssets(assets, limit?)` - Get klines for multiple assets
- `getAssets()` - Get all available assets
- `getKlineCount(asset)` - Get count of klines for an asset
- `getTimeRange(asset)` - Get min/max timestamps for an asset
- `getAssetStats(asset)` - Get aggregated statistics
- `query<T>(sql, params?)` - Run custom SQL queries

## API Server Endpoints

The API server (`klines-api-server.ts`) exposes these HTTP endpoints:

- `GET /api/assets` - Get all available assets
- `GET /api/klines?asset=BTCUSDT&limit=100` - Get klines for an asset
- `GET /api/klines/range?asset=BTCUSDT&startTime=...&endTime=...` - Get klines in time range
- `GET /api/stats?asset=BTCUSDT` - Get asset statistics
