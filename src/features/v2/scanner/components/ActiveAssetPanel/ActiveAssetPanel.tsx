import { Activity } from "lucide-react";
import type { AlertListItem } from "@/features/alerts-explorer/hooks/alerts.api";
import { CHART_EMA_PERIODS } from "@/features/chart/ema";
import type { ChartAlertMarker } from "@/features/chart/IndexChart";
import { IndexChart } from "@/features/chart/IndexChart";
import { useLiveChartSeries } from "@/hooks/chart/useLiveChartSeries";
import {
  formatCompactUsd,
  formatFundingRate,
  formatPrice,
  numberFormat,
} from "../../lib/formatters";
import { isMomentumPullback } from "../../lib/momentumLabels";
import type { ScannerAsset, ScannerTimeframe } from "../../types";
import { Pill } from "../Pill";
import { StatCard } from "../StatCard";

type ActiveAssetPanelProps = {
  asset?: ScannerAsset;
  flushChart?: boolean;
  hasMoreChartHistory?: boolean;
  isLoadingMoreChartHistory?: boolean;
  liveUpdatesEnabled?: boolean;
  onLoadMoreChartHistory?: () => void;
  showStats?: boolean;
  timeframe: ScannerTimeframe;
  alerts?: AlertListItem[];
};

function formatMomentumScore(value: number | null) {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value}`;
}

function getMomentumScoreTone(value: number | null) {
  if (value === null || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}

export function ActiveAssetPanel({
  asset,
  flushChart = false,
  hasMoreChartHistory = false,
  isLoadingMoreChartHistory = false,
  liveUpdatesEnabled = true,
  onLoadMoreChartHistory,
  showStats = true,
  timeframe,
  alerts = [],
}: ActiveAssetPanelProps) {
  const { seriesByAssetId } = useLiveChartSeries({
    enabled: liveUpdatesEnabled,
    timeframe,
    seeds: asset?.assetId
      ? [
          {
            assetId: asset.assetId,
            dataKey: `${asset.chart[0]?.time ?? ""}:${asset.chart.length}:${asset.chart.at(-1)?.time ?? ""}`,
            instrumentId: asset.instrumentId,
            data: asset.chart,
          },
        ]
      : [],
  });
  const klines = asset?.assetId
    ? (seriesByAssetId.get(asset.assetId) ?? asset.chart)
    : [];
  const alertMarkers: ChartAlertMarker[] = alerts.map((alert) => ({
    direction: alert.direction,
    kind: isMomentumPullback(alert) ? "pullback" : "momentum",
    time: alert.triggered_at ?? alert.time,
  }));

  if (!asset) {
    return (
      <div className="terminal-empty-state">
        <Activity className="h-5 w-5" />
        <div>
          <p className="font-semibold text-white/80">Select an instrument</p>
          <p>Choose a row in the scanner to open its live analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-active-panel">
      <header className="terminal-panel-header terminal-panel-header--asset">
        <div className="min-w-0">
          <div className="terminal-asset-identity">
            <h1 className="font-[var(--font-display)] text-xl font-bold italic text-white">
              {asset.symbol}
            </h1>
            <span className="terminal-market-label">{asset.market}</span>
            <span
              className={`terminal-score terminal-score--${getMomentumScoreTone(asset.momentumScore)}`}
              title="Asset momentum score"
            >
              <span className="terminal-score__label">Momentum</span>
              <span className="terminal-score__value">
                {formatMomentumScore(asset.momentumScore)}
              </span>
            </span>
          </div>
          <div className="terminal-asset-quote font-[var(--font-mono)]">
            <span className="terminal-asset-quote__price">
              {formatPrice(asset.price)}
            </span>
            <div className="terminal-asset-quote__changes">
              <Pill value={asset.change5m} label="5m" />
              <Pill value={asset.change1h} label="1h" />
              <Pill value={asset.change24h} label="1d" />
            </div>
          </div>
        </div>
      </header>

      <div className="terminal-chart-toolbar">
        <span>Price structure</span>
        <span>{timeframe} · live</span>
      </div>
      <div
        className={
          flushChart
            ? "terminal-chart-wrap terminal-chart-wrap--flush"
            : "terminal-chart-wrap"
        }
      >
        <IndexChart
          dataKey={`${asset.assetId}:${timeframe}`}
          resetViewKey={`${timeframe}:${klines.at(-1)?.time ?? ""}`}
          initialVisibleCandleCount={flushChart ? 100 : undefined}
          klines={klines}
          upColor="#26c281"
          downColor="#ec5564"
          showVolume
          interactive={flushChart}
          hasMoreHistory={hasMoreChartHistory}
          isLoadingMoreHistory={isLoadingMoreChartHistory}
          onLoadMoreHistory={onLoadMoreChartHistory}
          emaPeriods={flushChart ? CHART_EMA_PERIODS : undefined}
          watermarkText={
            flushChart ? asset.symbol.replace(/[-/_]?USDT$/i, "") : undefined
          }
          alertMarkers={alertMarkers}
        />
      </div>
      {showStats && (
        <div className="terminal-stat-grid">
          <StatCard
            label="Volume 24h"
            value={formatCompactUsd(asset.volume)}
            tone="neutral"
          />
          <StatCard
            label="RVOL"
            value={asset.rvol === null ? "—" : `${asset.rvol.toFixed(1)}x`}
            tone="accent"
          />
          <StatCard
            label="Open interest"
            value={formatCompactUsd(asset.openInterest)}
            tone="positive"
          />
          <StatCard
            label="Funding"
            value={formatFundingRate(asset.funding)}
            tone="neutral"
          />
          <StatCard
            label="ATR"
            value={
              asset.atrPercent === null
                ? "—"
                : numberFormat.format(asset.atrPercent)
            }
            tone="neutral"
          />
          <StatCard
            label="BTC corr"
            value={
              asset.btcCorrelation === null
                ? "—"
                : asset.btcCorrelation.toFixed(2)
            }
            tone="neutral"
          />
        </div>
      )}
    </div>
  );
}
