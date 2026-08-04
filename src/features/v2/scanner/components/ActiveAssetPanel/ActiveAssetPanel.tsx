import { Activity, BellPlus, BookmarkPlus, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { IndexChart } from "@/features/chart/IndexChart";
import { useLiveChartSeries } from "@/hooks/chart/useLiveChartSeries";
import { formatPrice, formatSigned, numberFormat } from "../../lib/formatters";
import type { ScannerAsset, ScannerTimeframe } from "../../types";
import { ActionButton } from "../ActionButton";
import { Pill } from "../Pill";
import { StatCard } from "../StatCard";

type ActiveAssetPanelProps = {
  asset?: ScannerAsset;
  flushChart?: boolean;
  liveUpdatesEnabled?: boolean;
  showStats?: boolean;
  timeframe: ScannerTimeframe;
};

export function ActiveAssetPanel({
  asset,
  flushChart = false,
  liveUpdatesEnabled = true,
  showStats = true,
  timeframe,
}: ActiveAssetPanelProps) {
  const { seriesByAssetId } = useLiveChartSeries({
    enabled: liveUpdatesEnabled,
    timeframe,
    seeds: asset?.assetId
      ? [
          {
            assetId: asset.assetId,
            instrumentId: asset.instrumentId,
            data: asset.chart,
          },
        ]
      : [],
  });
  const klines = asset?.assetId
    ? (seriesByAssetId.get(asset.assetId) ?? asset.chart)
    : [];

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
      <header className="terminal-panel-header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-[var(--font-display)] text-xl font-bold italic text-white">
              {asset.symbol}
            </h1>
            <span className="terminal-market-label">{asset.market}</span>
            <span className="terminal-score">{asset.setupScore} score</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-[var(--font-mono)]">
            <span className="text-lg font-semibold tabular-nums text-white">
              {formatPrice(asset.price)}
            </span>
            <Pill value={asset.change5m} label="5m" />
            <Pill value={asset.change1h} label="1h" />
            <Pill value={asset.change24h} label="1d" />
          </div>
        </div>
        <div className="hidden items-center gap-2 2xl:flex">
          <ActionButton
            icon={<BellPlus className="h-3.5 w-3.5" />}
            variant="primary"
          >
            Alert
          </ActionButton>
          <ActionButton
            icon={<BookmarkPlus className="h-3.5 w-3.5" />}
            variant="secondary"
          >
            Watch
          </ActionButton>
          <Link
            className="terminal-icon-action"
            to={`/assets/${asset.symbol}`}
            aria-label={`Open ${asset.symbol} full analysis`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
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
          klines={klines}
          upColor="#26c281"
          downColor="#ec5564"
          showVolume
        />
      </div>
      {showStats && (
        <div className="terminal-stat-grid">
          <StatCard label="Volume 24h" value={asset.volume} tone="neutral" />
          <StatCard
            label="RVOL"
            value={asset.rvol === null ? "—" : `${asset.rvol.toFixed(1)}x`}
            tone="accent"
          />
          <StatCard
            label="OI 24h Δ"
            value={formatSigned(asset.oiDelta)}
            tone="positive"
          />
          <StatCard
            label="Funding"
            value={formatSigned(asset.funding, "%")}
            tone="neutral"
          />
          <StatCard
            label="ATR"
            value={numberFormat.format(asset.atrPercent)}
            tone="neutral"
          />
          <StatCard
            label="BTC corr"
            value={asset.btcCorrelation.toFixed(2)}
            tone="neutral"
          />
        </div>
      )}
    </div>
  );
}
