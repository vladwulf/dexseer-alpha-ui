import { BellPlus, BookmarkPlus, Clock3, Star, Volume2 } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { IndexChart } from "@/features/chart/IndexChart";
import { useLiveChartSeries } from "@/hooks/chart/useLiveChartSeries";
import { formatPrice, formatSigned, numberFormat } from "../lib/formatters";
import type { ScannerAsset, ScannerTimeframe } from "../types";
import { ActionButton } from "./ActionButton";
import { DetailBlock } from "./DetailBlock";
import { Pill } from "./Pill";
import { SessionBars } from "./SessionBars";
import { StatCard } from "./StatCard";

const SIDE_PANEL_MAX_CANDLES = 80;

const panelChipClassName =
  "inline-flex h-7 items-center rounded-[4px] border px-[9px] py-0 font-[var(--font-mono)] text-[0.7rem] font-medium tracking-[0.05em]";

type ScannerSidePanelProps = {
  asset?: ScannerAsset;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  timeframe: ScannerTimeframe;
};

function ScannerSidePanelBody({
  asset,
  timeframe,
  klines,
}: {
  asset: ScannerAsset;
  timeframe: ScannerTimeframe;
  klines: typeof asset.chart;
}) {
  const visibleKlines = klines.slice(-SIDE_PANEL_MAX_CANDLES);

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="[font-family:var(--font-display)] text-lg font-bold italic leading-none text-white">
              {asset.symbol}
            </h2>
            <span
              className={`${panelChipClassName} border-transparent bg-transparent text-white/40`}
            >
              {asset.market}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-[var(--font-mono)]">
            <span className="text-base font-semibold text-white">
              {formatPrice(asset.price)}
            </span>
            <Pill value={asset.change1h} label="1h" />
            <Pill value={asset.change24h} label="1d" />
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            Active setup
          </p>
          <span
            className={`${panelChipClassName} border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]`}
          >
            {asset.setupScore} / 100
          </span>
        </div>
        <p className="mb-2 [font-family:var(--font-display)] text-base font-semibold text-white">
          {asset.setupLabel}
        </p>
        <p className="text-[0.8rem] leading-5 text-white/62">
          {asset.activeSetupSummary}
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
          <span>Price · {timeframe}</span>
          <span>vol / OI / funding</span>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-black p-4">
          <div className="relative h-44 overflow-hidden rounded-[14px]">
            <div className="pointer-events-none absolute inset-y-0 left-[60%] z-10 border-l-2 border-dashed border-[rgba(91,143,249,0.75)]" />
            <span className="pointer-events-none absolute left-[58%] top-2 z-10 text-xs font-semibold text-[#5b8ff9]">
              <span
                className={`${panelChipClassName} h-6 border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] px-[7px] text-[oklch(0.72_0.18_248)]`}
              >
                brk 1h
              </span>
            </span>
            <IndexChart
              symbol={asset.symbol}
              klines={visibleKlines}
              upColor="#5dc887"
              downColor="#e35561"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="Volume 24h" value={asset.volume} tone="neutral" />
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
          label="ATR %"
          value={numberFormat.format(asset.atrPercent)}
          tone="neutral"
        />
        <StatCard
          label="BTC corr 1h"
          value={asset.btcCorrelation.toFixed(2)}
          tone="neutral"
        />
        <StatCard
          label="Why it ranked"
          value={`${asset.setupScore} pts`}
          tone="accent"
        />
      </div>

      <DetailBlock
        label="Why it ranked"
        body={asset.rankingReason}
        icon={<Star className="h-4 w-4" />}
      />
      <DetailBlock
        label="BTC-relative behavior"
        body={asset.btcRelativeBehavior}
        icon={<Volume2 className="h-4 w-4" />}
      />

      <div className="my-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            Recent alerts
          </p>
          <Badge
            className={`${panelChipClassName} border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]`}
          >
            {asset.alertCount}
          </Badge>
        </div>
        <div className="space-y-2">
          {asset.recentAlerts.map((alert) => (
            <div
              key={`${alert.label}-${alert.time}`}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`${panelChipClassName} border-transparent bg-transparent text-white/55`}
                >
                  {alert.timeframe}
                </Badge>
                <span className="text-[0.78rem] text-white/66">
                  {alert.label}
                </span>
              </div>
              <span className="font-[var(--font-mono)] text-[0.72rem] text-white/38">
                {alert.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            Best trading hours · 30d
          </p>
          <Clock3 className="h-4 w-4 text-white/40" />
        </div>
        <SessionBars values={asset.bestHours} />
        <p className="mt-3 text-[0.8rem] leading-5 text-white/62">
          {asset.sessionEdge}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionButton icon={<BellPlus className="h-4 w-4" />} variant="primary">
          Set alert
        </ActionButton>
        <ActionButton
          icon={<BookmarkPlus className="h-4 w-4" />}
          variant="secondary"
        >
          Add to watchlist
        </ActionButton>
        <ActionButton
          icon={<Volume2 className="h-4 w-4" />}
          variant="secondary"
        >
          Mute symbol
        </ActionButton>
        <ActionButton icon={<Star className="h-4 w-4" />} variant="secondary">
          Open full analysis
        </ActionButton>
      </div>
    </div>
  );
}

function ScannerSidePanelSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded bg-white/8 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-4 w-16 rounded bg-white/8 animate-pulse" />
            <div className="h-4 w-12 rounded bg-white/8 animate-pulse" />
            <div className="h-4 w-12 rounded bg-white/8 animate-pulse" />
          </div>
        </div>
      </div>
      {/* Setup card */}
      <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 space-y-2">
        <div className="h-3 w-20 rounded bg-white/8 animate-pulse" />
        <div className="h-5 w-40 rounded bg-white/8 animate-pulse" />
        <div className="h-3 w-full rounded bg-white/8 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-white/8 animate-pulse" />
      </div>
      {/* Chart */}
      <div className="rounded-[20px] border border-white/8 bg-black p-4">
        <div className="h-44 rounded-[14px] bg-white/[0.03] animate-pulse" />
      </div>
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div
            key={i}
            className="h-14 rounded-xl border border-white/8 bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
      {/* Detail blocks */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div
            key={i}
            className="h-16 rounded-xl border border-white/8 bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function ScannerSidePanel({
  asset,
  mobileOpen,
  onMobileOpenChange,
  timeframe,
}: ScannerSidePanelProps) {
  const { seriesByAssetId } = useLiveChartSeries({
    timeframe,
    seeds: asset?.assetId
      ? [
          {
            assetId: asset.assetId,
            instrumentId: asset.instrumentId ?? asset.chart[0]?.instrument_id,
            data: asset.chart,
          },
        ]
      : [],
  });

  const series = asset?.assetId
    ? seriesByAssetId.get(asset.assetId)
    : undefined;
  const klines = asset ? (series?.length ? series : asset.chart) : [];

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 80) onMobileOpenChange(false);
  }

  const bodyContent = asset ? (
    <ScannerSidePanelBody asset={asset} timeframe={timeframe} klines={klines} />
  ) : (
    <ScannerSidePanelSkeleton />
  );

  return (
    <>
      <aside className="hide-scrollbar hidden bg-[#040404] xl:sticky xl:top-14 xl:block xl:w-[350px] xl:max-h-[calc(100vh-3.5rem)] xl:shrink-0 xl:overflow-y-auto 2xl:w-[450px]">
        {bodyContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-white/8 bg-[#040404] p-3 sm:max-w-[460px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <SheetTitle className="sr-only">
            {asset ? `${asset.symbol} details` : "Scanner details"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Asset intelligence details for the selected scanner symbol.
          </SheetDescription>
          <div className="pr-10 xl:hidden">{bodyContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
