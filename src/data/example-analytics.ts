import { getKlinesDB } from "./klines-db";

/**
 * Example analytics script showing how to use the SQLite database
 */
async function runAnalytics() {
  const db = getKlinesDB();

  try {
    // Get all available assets
    console.log("Available assets:");
    const assets = db.getAssets();
    console.log(`Total: ${assets.length} assets\n`);

    // Get stats for a specific asset
    const asset = "BTCUSDT";
    console.log(`Stats for ${asset}:`);
    const stats = db.getAssetStats(asset);
    console.log(stats);
    console.log();

    // Get time range
    const timeRange = db.getTimeRange(asset);
    if (timeRange) {
      console.log(`Time range: ${new Date(timeRange.min).toISOString()} to ${new Date(timeRange.max).toISOString()}`);
      console.log();
    }

    // Get recent klines
    console.log(`Recent 10 klines for ${asset}:`);
    const recentKlines = db.getKlines(asset, 10);
    recentKlines.forEach(kline => {
      console.log(`${new Date(kline.openTime).toISOString()}: O=${kline.open.toFixed(2)} H=${kline.high.toFixed(2)} L=${kline.low.toFixed(2)} C=${kline.close.toFixed(2)}`);
    });
    console.log();

    // Get klines for a time range
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    console.log(`Klines for ${asset} in last 24 hours:`);
    const dayKlines = db.getKlinesByTimeRange(asset, oneDayAgo, now);
    console.log(`Found ${dayKlines.length} klines`);
    console.log();

    // Custom query example: Find assets with highest average volume
    console.log("Top 10 assets by average volume:");
    interface VolumeRow {
      asset: string;
      avg_volume: number;
      kline_count: number;
    }
    const topVolume = db.query<VolumeRow>(`
      SELECT 
        asset,
        AVG(volume) as avg_volume,
        COUNT(*) as kline_count
      FROM klines
      GROUP BY asset
      ORDER BY avg_volume DESC
      LIMIT 10
    `);
    topVolume.forEach((row) => {
      console.log(`${row.asset}: ${row.avg_volume.toFixed(2)} (${row.kline_count} klines)`);
    });
    console.log();

    // Custom query: Find assets with highest price volatility
    console.log("Top 10 assets by price volatility (high-low range):");
    interface VolatilityRow {
      asset: string;
      avg_range: number;
      avg_volatility_pct: number;
      kline_count: number;
    }
    const volatility = db.query<VolatilityRow>(`
      SELECT 
        asset,
        AVG(high - low) as avg_range,
        AVG((high - low) / close * 100) as avg_volatility_pct,
        COUNT(*) as kline_count
      FROM klines
      GROUP BY asset
      ORDER BY avg_volatility_pct DESC
      LIMIT 10
    `);
    volatility.forEach((row) => {
      console.log(`${row.asset}: ${row.avg_volatility_pct.toFixed(4)}% avg volatility`);
    });

  } finally {
    db.close();
  }
}

runAnalytics().catch(console.error);

