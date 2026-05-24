import { formatSigned } from "../lib/formatters";
import type { ScannerAsset } from "../types";

type ScannerMomentumHeatmapProps = {
  assets: ScannerAsset[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
};

type HeatmapTileProps = {
  asset: ScannerAsset;
  intensity: number; // 0–1 relative to column max
  rank: number; // 0 = strongest mover
  selected: boolean;
  tone: "gainer" | "loser";
  onSelectSymbol: (symbol: string) => void;
};

function HeatmapTile({
  asset,
  intensity,
  rank,
  selected,
  tone,
  onSelectSymbol,
}: HeatmapTileProps) {
  const isPositive = tone === "gainer";

  const hue = isPositive ? 142 : 352;
  const lightness = 6 + intensity * 18; // 6% dark → 24% vivid
  const saturation = 40 + intensity * 35; // 40% → 75%
  const bg = `hsl(${hue}, ${saturation.toFixed(0)}%, ${lightness.toFixed(1)}%)`;

  const outlineStyle = selected
    ? {
        outline: `2px solid ${isPositive ? "rgba(78,203,113,0.75)" : "rgba(232,80,95,0.75)"}`,
        outlineOffset: "-2px",
      }
    : {};

  const symbolColor = intensity > 0.4 ? "#fff" : "rgba(255,255,255,0.78)";
  const changeColor = isPositive ? "#b6f5c4" : "#ffc0c7";

  // Top 3 tiles get slightly larger text
  const isProminent = rank < 3;

  return (
    <button
      type="button"
      onClick={() => onSelectSymbol(asset.symbol)}
      style={{ background: bg, ...outlineStyle }}
      className="flex aspect-square flex-col justify-between overflow-hidden rounded-lg p-2 text-left transition-all duration-100 hover:brightness-[1.22] active:brightness-110"
    >
      <div
        className="[font-family:var(--font-display)] font-bold italic leading-none"
        style={{
          color: symbolColor,
          fontSize: isProminent ? "0.82rem" : "0.72rem",
        }}
      >
        {asset.symbol.replace("USDT", "")}
      </div>
      <div
        className="font-(--font-mono) tabular-nums"
        style={{
          color: changeColor,
          fontSize: isProminent ? "0.7rem" : "0.62rem",
          fontWeight: 600,
        }}
      >
        {formatSigned(asset.change24h)}
      </div>
    </button>
  );
}

function MosaicColumn({
  title,
  tone,
  assets,
  selectedSymbol,
  onSelectSymbol,
}: {
  title: string;
  tone: "gainer" | "loser";
  assets: ScannerAsset[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}) {
  const maxAbsChange = Math.max(...assets.map((a) => Math.abs(a.change24h)), 0);

  const isPositive = tone === "gainer";
  const labelColor = isPositive ? "text-[#4ecb71]" : "text-[#e8505f]";
  const dotClass = isPositive ? "bg-[#4ecb71]" : "bg-[#e8505f]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span
            className={`font-(--font-mono) text-[0.62rem] uppercase tracking-[0.2em] ${labelColor}`}
          >
            {title}
          </span>
        </div>
        <span className="font-(--font-mono) text-[0.6rem] tabular-nums text-white/28">
          top {assets.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {assets.map((asset, rank) => {
          const intensity =
            maxAbsChange === 0 ? 0 : Math.abs(asset.change24h) / maxAbsChange;
          return (
            <HeatmapTile
              key={`${tone}-${asset.symbol}`}
              asset={asset}
              intensity={intensity}
              rank={rank}
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
  assets,
  selectedSymbol,
  onSelectSymbol,
}: ScannerMomentumHeatmapProps) {
  const gainers = [...assets]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 10);

  // Sorted biggest loser first (most negative change at index 0)
  const losers = [...assets]
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 10);

  if (gainers.length === 0 || losers.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-white/6 px-4 py-5 md:px-6">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-[1.1rem] font-semibold italic text-white">
            Momentum Heatmap
          </h2>
          <span className="font-(--font-mono) text-[0.62rem] uppercase tracking-[0.18em] text-white/30">
            24h
          </span>
        </div>
        <p className="font-(--font-mono) text-[0.66rem] text-white/30">
          Color intensity scales with move magnitude · click to sync
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MosaicColumn
          title="Gainers"
          tone="gainer"
          assets={gainers}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={onSelectSymbol}
        />
        <MosaicColumn
          title="Losers"
          tone="loser"
          assets={losers}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={onSelectSymbol}
        />
      </div>
    </section>
  );
}
