/**
 * Import multiple JSON timeseries files into a single SQLite database
 *
 * This script:
 * 1. Loads assets-timeseries-2-1.json, assets-timeseries-2-2.json, and assets-timeseries-2-3.json
 * 2. Merges all data across the files
 * 3. Deduplicates klines by (asset, open_time)
 * 4. Imports into SQLite with proper indexing
 * 5. Reports compression ratio and statistics
 *
 * Usage: bun run src/data/import-to-sqlite.ts
 */

// @ts-expect-error - Bun built-in module
import { Database } from "bun:sqlite";
// @ts-expect-error - Node built-in module
import path from "path";
// @ts-expect-error - Node built-in module
import fs from "fs";
// @ts-expect-error - Node built-in module
import { fileURLToPath } from "url";
import type { ParsedKLine } from "./extract-from-binance";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_FILES = [
  path.join(__dirname, "computed", "assets-timeseries-2-1.json"),
  path.join(__dirname, "computed", "assets-timeseries-2-2.json"),
  path.join(__dirname, "computed", "assets-timeseries-2-3.json"),
];
const DB_FILE = path.join(__dirname, "computed", "assets-timeseries.db");

async function importToSQLite() {
  console.log("🚀 Starting SQLite import...\n");
  console.log("Loading JSON files...");

  // Load and merge all JSON files
  const assetsData: Record<string, ParsedKLine[]> = {};
  let filesLoaded = 0;
  let totalFileSizeMB = 0;

  for (let fileIndex = 0; fileIndex < JSON_FILES.length; fileIndex++) {
    const jsonFile = JSON_FILES[fileIndex];

    if (!fs.existsSync(jsonFile)) {
      console.log(`⚠️  Skipping ${path.basename(jsonFile)} - file not found`);
      continue;
    }

    console.log(
      `\nReading file ${fileIndex + 1}/${JSON_FILES.length}: ${path.basename(
        jsonFile
      )}...`
    );
    const stats = fs.statSync(jsonFile);
    const fileSizeMB = stats.size / 1024 / 1024;
    totalFileSizeMB += fileSizeMB;
    console.log(`  File size: ${fileSizeMB.toFixed(2)} MB`);

    const startTime = Date.now();
    const jsonData = fs.readFileSync(jsonFile, "utf8");
    console.log(
      `  Read time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`
    );

    const parseStart = Date.now();
    const fileData: Record<string, ParsedKLine[]> = JSON.parse(jsonData);
    console.log(
      `  Parse time: ${((Date.now() - parseStart) / 1000).toFixed(2)}s`
    );

    console.log(`  Found ${Object.keys(fileData).length} assets in this file`);

    // Merge data from this file
    for (const [asset, klines] of Object.entries(fileData)) {
      if (!assetsData[asset]) {
        assetsData[asset] = [];
      }
      assetsData[asset].push(...klines);
    }

    filesLoaded++;
  }

  if (filesLoaded === 0) {
    throw new Error("No JSON files found to import!");
  }

  console.log(
    `\n✓ Loaded ${filesLoaded} file(s) (${totalFileSizeMB.toFixed(2)} MB total)`
  );
  console.log(`Total unique assets: ${Object.keys(assetsData).length}`);

  // Remove existing database if it exists
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
    console.log("Removed existing database");
  }

  // Create database
  const db = new Database(DB_FILE);
  console.log("Created SQLite database");

  // Create table with UNIQUE constraint to prevent duplicates
  db.exec(`
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
      taker_buy_quote_volume REAL NOT NULL,
      UNIQUE(asset, open_time)
    );
    
    CREATE INDEX idx_asset_time ON klines(asset, open_time);
    CREATE INDEX idx_asset ON klines(asset);
    CREATE INDEX idx_time ON klines(open_time);
  `);

  console.log("Created table and indexes");

  // Prepare insert statement with OR IGNORE to skip duplicates
  const insert = db.prepare(`
    INSERT OR IGNORE INTO klines (
      asset, open_time, open, high, low, close, volume,
      close_time, quote_volume, trades, taker_buy_base_volume, taker_buy_quote_volume
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Use transaction for better performance
  const insertMany = db.transaction((klines: ParsedKLine[], asset: string) => {
    for (const kline of klines) {
      insert.run(
        asset,
        kline.openTime,
        kline.open,
        kline.high,
        kline.low,
        kline.close,
        kline.volume,
        kline.closeTime,
        kline.quoteVolume,
        kline.trades,
        kline.takerBuyBaseVolume,
        kline.takerBuyQuoteVolume
      );
    }
  });

  // Import data with deduplication
  console.log("\nImporting data to database...");
  let totalKlines = 0;
  let totalDuplicates = 0;
  let totalRawKlines = 0;
  const assets = Object.entries(assetsData);

  for (let i = 0; i < assets.length; i++) {
    const [asset, klines] = assets[i];
    totalRawKlines += klines.length;

    // Deduplicate klines by open_time (keep first occurrence)
    // Sort by openTime to ensure consistent ordering
    klines.sort((a, b) => a.openTime - b.openTime);

    const seen = new Set<number>();
    const uniqueKlines: ParsedKLine[] = [];
    let duplicatesInAsset = 0;

    for (const kline of klines) {
      if (seen.has(kline.openTime)) {
        duplicatesInAsset++;
        continue;
      }
      seen.add(kline.openTime);
      uniqueKlines.push(kline);
    }

    if (duplicatesInAsset > 0) {
      console.log(
        `  ⚠️  ${asset}: Found ${duplicatesInAsset} duplicates (${klines.length} → ${uniqueKlines.length})`
      );
      totalDuplicates += duplicatesInAsset;
    }

    insertMany(uniqueKlines, asset);
    totalKlines += uniqueKlines.length;

    if ((i + 1) % 10 === 0 || i === 0) {
      console.log(
        `Progress: ${i + 1}/${
          assets.length
        } assets (${totalKlines.toLocaleString()} klines imported, ${totalDuplicates.toLocaleString()} duplicates skipped)`
      );
    }
  }

  console.log(`\n✓ Import complete!`);
  console.log(`  Total assets: ${assets.length}`);
  console.log(`  Raw klines from files: ${totalRawKlines.toLocaleString()}`);
  console.log(`  Unique klines imported: ${totalKlines.toLocaleString()}`);
  if (totalDuplicates > 0) {
    const dedupePercent = ((totalDuplicates / totalRawKlines) * 100).toFixed(2);
    console.log(
      `  ⚠️  Duplicates removed: ${totalDuplicates.toLocaleString()} (${dedupePercent}%)`
    );
  } else {
    console.log(`  ✓ No duplicates found`);
  }
  console.log(`  Database file: ${DB_FILE}`);

  // Verify no duplicates in database
  const checkDuplicates = db.prepare(`
    SELECT asset, open_time, COUNT(*) as count
    FROM klines
    GROUP BY asset, open_time
    HAVING count > 1
  `);
  const duplicateRows = checkDuplicates.all() as Array<{
    asset: string;
    open_time: number;
    count: number;
  }>;

  if (duplicateRows.length > 0) {
    console.log(
      `  ❌ ERROR: Found ${duplicateRows.length} duplicate entries in database!`
    );
  } else {
    console.log(`  ✓ Verified: No duplicates in database`);
  }

  // Get database size
  const stats = fs.statSync(DB_FILE);
  const dbSizeMB = stats.size / 1024 / 1024;
  console.log(`  Database size: ${dbSizeMB.toFixed(2)} MB`);

  // Show compression ratio
  if (totalFileSizeMB > 0) {
    const compressionRatio = (dbSizeMB / totalFileSizeMB) * 100;
    const savings = totalFileSizeMB - dbSizeMB;
    console.log(
      `  Compression: ${totalFileSizeMB.toFixed(2)} MB → ${dbSizeMB.toFixed(
        2
      )} MB (${compressionRatio.toFixed(1)}% of original)`
    );
    console.log(`  Space saved: ${savings.toFixed(2)} MB`);
  }

  db.close();

  console.log("\n🎉 Import completed successfully!");
}

importToSQLite().catch(console.error);
