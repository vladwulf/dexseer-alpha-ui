import { useState } from "react";
import {
  type RunnerEntry,
  type RunnerTimeframe,
  useGetStatsRunners,
} from "../hooks/scanner.api";
import { formatSigned } from "../lib/formatters";

type ScannerMomentumHeatmapProps = {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
};

type HeatmapTone = "gainer" | "loser";

type MosaicTileLayout = {
  colSpan: number;
  rowSpan: number;
};

const MOSAIC_LAYOUT: MosaicTileLayout[] = [
  { colSpan: 3, rowSpan: 4 },
  { colSpan: 2, rowSpan: 4 },
  { colSpan: 1, rowSpan: 4 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 1, rowSpan: 2 },
  { colSpan: 1, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
];

// Professional dark terminal palette — not neon, not pastel
function getTilePalette(tone: HeatmapTone, intensity: number) {
  const i = intensity;

  if (tone === "gainer") {
    // Near-black tinted green → rich forest green
    const l = 7 + i * 15; // 7% → 22%
    const s = 28 + i * 32; // 28% → 60%
    return {
      bg: `hsl(142, ${s.toFixed(0)}%, ${l.toFixed(1)}%)`,
      // Diagonal highlight: very subtle top-left catch light
      overlay: `linear-gradient(135deg, rgba(255,255,255,0.045) 0%, transparent 50%)`,
      symbolColor:
        i > 0.5 ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.80)",
      changeColor: i > 0.5 ? "#c8f5d0" : "#9de0a8",
      selectedRing: "rgba(110,220,130,0.85)",
    };
  }

  const l = 7 + i * 14; // 7% → 21%
  const s = 26 + i * 34; // 26% → 60%
  return {
    bg: `hsl(354, ${s.toFixed(0)}%, ${l.toFixed(1)}%)`,
    overlay: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)`,
    symbolColor: i > 0.5 ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.80)",
    changeColor: i > 0.5 ? "#ffd0d5" : "#f0a0a8",
    selectedRing: "rgba(240,110,120,0.85)",
  };
}

function getTileArea(layout: MosaicTileLayout) {
  return layout.colSpan * layout.rowSpan;
}

function getMetricValue(entry: RunnerEntry) {
  return entry.change_pct;
}

function getSymbolSize(layout: MosaicTileLayout, labelLength: number) {
  const area = getTileArea(layout);

  if (area >= 12 && labelLength <= 5) return "clamp(3rem, 14cqw, 6rem)";
  if (area >= 8 && labelLength <= 6) return "clamp(2.4rem, 11cqw, 4.5rem)";
  if (area >= 6) return "clamp(1.8rem, 8cqw, 3.2rem)";
  if (area >= 4) return "clamp(1.2rem, 6cqw, 2.2rem)";

  return "clamp(0.95rem, 4.5cqw, 1.4rem)";
}

function getChangeSize(layout: MosaicTileLayout) {
  const area = getTileArea(layout);

  if (area >= 12) return "clamp(1.6rem, 8cqw, 3.5rem)";
  if (area >= 8) return "clamp(1.3rem, 6cqw, 2.6rem)";
  if (area >= 6) return "clamp(1rem, 4.5cqw, 1.8rem)";
  if (area >= 4) return "clamp(0.9rem, 3.8cqw, 1.4rem)";

  return "clamp(0.8rem, 3cqw, 1.1rem)";
}

function HeatmapTile({
  asset,
  intensity,
  layout,
  selected,
  tone,
  onSelectSymbol,
}: {
  asset: RunnerEntry;
  intensity: number;
  layout: MosaicTileLayout;
  selected: boolean;
  tone: HeatmapTone;
  onSelectSymbol: (symbol: string) => void;
}) {
  const palette = getTilePalette(tone, intensity);
  const label = asset.symbol.replace(/USDT$|USD$/u, "");
  const area = getTileArea(layout);
  const isLead = area >= 12;
  const metricValue = getMetricValue(asset);

  return (
    <button
      type="button"
      onClick={() => onSelectSymbol(asset.symbol)}
      className="group relative flex min-h-[78px] flex-col items-center justify-center overflow-hidden px-2 py-2 text-center transition-all duration-100 hover:brightness-[1.15]"
      style={{
        background: palette.bg,
        gridColumn: `span ${layout.colSpan} / span ${layout.colSpan}`,
        gridRow: `span ${layout.rowSpan} / span ${layout.rowSpan}`,
        outline: selected ? `2px solid ${palette.selectedRing}` : "none",
        outlineOffset: "-2px",
        zIndex: selected ? 1 : 0,
        containerType: "inline-size",
      }}
    >
      {/* Catch-light overlay — one diagonal gradient, nothing else */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: palette.overlay }}
      />

      <div className="relative flex flex-col items-center gap-0.5">
        <div
          className="font-display font-black italic leading-none tracking-[-0.04em] text-white"
          style={{
            color: palette.symbolColor,
            fontSize: getSymbolSize(layout, label.length),
            // Single drop shadow — clean, not multi-directional
            textShadow: "0 2px 6px rgba(0,0,0,0.65)",
          }}
        >
          {label}
        </div>
        <div
          className="font-(--font-mono) font-semibold tabular-nums"
          style={{
            color: palette.changeColor,
            fontSize: getChangeSize(layout),
            textShadow: "0 1px 4px rgba(0,0,0,0.55)",
          }}
        >
          {formatSigned(metricValue)}
        </div>
        {/* Volume line — only on the lead tile, very quiet */}
        {isLead && (
          <div
            className="mt-1 font-(--font-mono) tabular-nums"
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: "clamp(0.62rem, 1vw, 0.78rem)",
              textShadow: "none",
            }}
          >
            $
            {(asset.price ?? 0).toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}
          </div>
        )}
      </div>
    </button>
  );
}

function MosaicColumn({
  assets,
  label,
  labelColor,
  onSelectSymbol,
  selectedSymbol,
  tone,
}: {
  assets: RunnerEntry[];
  label: string;
  labelColor: string;
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
  tone: HeatmapTone;
}) {
  const maxAbsChange = Math.max(
    ...assets.map((asset) => Math.abs(getMetricValue(asset))),
    0,
  );

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: labelColor }}
        />
        <span
          className="font-(--font-mono) text-[0.62rem] uppercase tracking-[0.2em]"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-px overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#111]">
        {assets.map((asset, rank) => {
          const intensity =
            maxAbsChange === 0
              ? 0
              : Math.abs(getMetricValue(asset)) / maxAbsChange;

          return (
            <HeatmapTile
              key={`${tone}-${asset.symbol}`}
              asset={asset}
              intensity={intensity}
              layout={
                MOSAIC_LAYOUT[rank] ?? MOSAIC_LAYOUT[MOSAIC_LAYOUT.length - 1]
              }
              selected={asset.symbol === selectedSymbol}
              tone={tone}
              onSelectSymbol={onSelectSymbol}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ScannerMomentumHeatmap({
  selectedSymbol,
  onSelectSymbol,
}: ScannerMomentumHeatmapProps) {
  const CONTENT_HEIGHT_CLASS = "min-h-[380px]";
  const [metric, setMetric] = useState<RunnerTimeframe>("1h");
  const { data, isLoading, isError } = useGetStatsRunners({
    timeframes: "1h,4h,1d",
    limit: 10,
  });

  const gainers = [...(data?.boards.gainers?.[metric]?.entries ?? [])]
    .filter((asset) => getMetricValue(asset) > 0)
    .sort((left, right) => getMetricValue(right) - getMetricValue(left))
    .slice(0, 10);
  const losers = [...(data?.boards.losers?.[metric]?.entries ?? [])]
    .filter((asset) => getMetricValue(asset) < 0)
    .sort((left, right) => getMetricValue(left) - getMetricValue(right))
    .slice(0, 10);
  const metricLabel = metric === "1h" ? "1h" : metric === "1d" ? "24h" : "4h";

  const noData = !isLoading && !isError && gainers.length === 0 && losers.length === 0;

  return (
    <section className="border-b border-white/8 px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-[1.1rem] font-semibold italic text-white">
              Momentum Heatmap
            </h2>
            <span className="font-(--font-mono) text-[0.6rem] uppercase tracking-[0.18em] text-white/28">
              {metricLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(["1h", "4h", "1d"] as RunnerTimeframe[]).map((nextMetric) => (
              <button
                key={nextMetric}
                type="button"
                onClick={() => setMetric(nextMetric)}
                className={`rounded-[4px] border px-[10px] py-[4px] font-[var(--font-mono)] text-[0.6rem] tracking-[0.08em] transition-colors ${metric === nextMetric
                  ? "border-[oklch(0.72_0.18_248/0.35)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]"
                  : "border-white/10 bg-transparent text-white/40"
                  }`}
              >
                {nextMetric.toUpperCase()}
              </button>
            ))}
            <span className="font-(--font-mono) text-[0.62rem] text-white/28">
              area tracks move size
            </span>
          </div>
        </div>

        <div className={CONTENT_HEIGHT_CLASS}>
          {isError ? (
            <div
              className={`flex ${CONTENT_HEIGHT_CLASS} items-center justify-center rounded-[10px] border border-white/8 bg-black/30 px-4 text-center font-[var(--font-mono)] text-[0.68rem] tracking-[0.06em] text-white/40`}
            >
              Failed to load live gainers/losers
            </div>
          ) : isLoading ? (
            <div className={`grid ${CONTENT_HEIGHT_CLASS} gap-4 xl:grid-cols-2`}>
              {["gainers", "losers"].map((column) => (
                <div
                  key={`scanner-heatmap-skeleton-${column}`}
                  className="h-full animate-pulse rounded-[10px] border border-white/8 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : noData ? (
            <div
              className={`flex ${CONTENT_HEIGHT_CLASS} items-center justify-center rounded-[10px] border border-white/8 bg-black/30 px-4 text-center font-[var(--font-mono)] text-[0.68rem] tracking-[0.06em] text-white/40`}
            >
              No gainers/losers data for {metricLabel}
            </div>
          ) : (
            <div className={`grid ${CONTENT_HEIGHT_CLASS} gap-4 xl:grid-cols-2`}>
              <MosaicColumn
                assets={gainers}
                label="Gainers"
                labelColor="#5ecb78"
                onSelectSymbol={onSelectSymbol}
                selectedSymbol={selectedSymbol}
                tone="gainer"
              />
              <MosaicColumn
                assets={losers}
                label="Losers"
                labelColor="#e8505f"
                onSelectSymbol={onSelectSymbol}
                selectedSymbol={selectedSymbol}
                tone="loser"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
