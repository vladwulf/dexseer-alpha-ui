import type {
  CellContext,
  ColumnDef,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MicroChart } from "@/features/chart/MicroChart";
import { cn } from "@/lib/utils";
import { formatPrice, formatSigned, numberFormat } from "../lib/formatters";
import type { DensityMode, ScannerAsset, ScannerPreset } from "../types";
import { Sparkline } from "./Sparkline";

const GAINERS_COLUMNS = new Set([
  "symbol",
  "price",
  "change5m",
  "change15m",
  "change1h",
  "change4h",
  "change24h",
  "volume",
  "rvol",
  "oiDelta",
  "funding",
  "chart",
]);

const DEFAULT_COLUMNS = new Set([
  "symbol",
  "price",
  "change5m",
  "change15m",
  "change1h",
  "change4h",
  "change24h",
  "volume",
  "rvol",
  "oiDelta",
  "funding",
  "atrPercent",
  "btcCorrelation",
  "alertCount",
  "setupScore",
  "sparkline",
]);

const MOMENTUM_COLUMNS = new Set([
  "symbol",
  "chart",
  "price",
  "setupScore",
  "change5m",
  "change15m",
  "change1h",
  "alignedTimeframes",
  "rvol",
  "momentumChoppiness",
]);

const SYMBOL_COLUMN_WIDTH_CLASS = "w-[112px] min-w-[112px]";
const TABLE_CHART_MAX_CANDLES = 100;

function scoreColor(pct: number) {
  return pct >= 70
    ? "#5dc887"
    : pct >= 40
      ? "#f5a623"
      : "rgba(255,255,255,0.32)";
}

function ScoreBadge({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = scoreColor(pct);
  const bg =
    pct >= 70
      ? "rgba(93,200,135,0.12)"
      : pct >= 40
        ? "rgba(245,166,35,0.10)"
        : "rgba(255,255,255,0.06)";
  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          color,
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: bg,
          borderRadius: 4,
          padding: "2px 7px",
        }}
      >
        {pct.toFixed(0)}
      </span>
      <div
        style={{
          width: 28,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function AlignedTfIndicator({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-white/20">—</span>;
  const timeframes = ["1m", "5m", "15m"] as const;
  const total = timeframes.length;
  const filled = Math.min(total, Math.max(0, value));
  return (
    <div className="flex items-center gap-1">
      {timeframes.map((timeframe, i) => (
        <div
          key={timeframe}
          style={{
            width: 7,
            height: 7,
            borderRadius: 2,
            background: i < filled ? "#5dc887" : "rgba(255,255,255,0.11)",
          }}
        />
      ))}
      <span
        style={{
          color: "rgba(255,255,255,0.32)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          marginLeft: 4,
        }}
      >
        {filled}/{total}
      </span>
    </div>
  );
}

function ChangePctCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/20">—</span>;

  if (value === 0)
    return (
      <span
        style={{
          color: "rgba(255,255,255,0.22)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
        }}
      >
        0.00%
      </span>
    );
  const isPos = value > 0;
  const intensity = Math.min(Math.abs(value) / 8, 1);
  const textColor = isPos ? "#5dc887" : "#e35561";
  const bgAlpha = 0.03 + intensity * 0.11;
  const bg = isPos
    ? `rgba(93,200,135,${bgAlpha.toFixed(3)})`
    : `rgba(227,85,97,${bgAlpha.toFixed(3)})`;
  return (
    <span
      style={{
        color: textColor,
        background: bg,
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        fontWeight: 500,
        borderRadius: 4,
        padding: "2px 5px",
        display: "inline-block",
      }}
    >
      {formatSigned(value)}
    </span>
  );
}

function RvolCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/20">—</span>;

  const normalized = Math.min(Math.max(value - 1, 0) / 4, 1);
  const color =
    normalized > 0.6
      ? "#5dc887"
      : normalized > 0.25
        ? "#f5a623"
        : "rgba(245,166,35,0.72)";
  const barColor = normalized > 0.6 ? "#5dc887" : "#f5a623";
  const barWidth = Math.max(normalized * 100, value >= 1 ? 6 : 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          color,
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {value.toFixed(1)}x
      </span>
      <div
        style={{
          width: 20,
          height: 2,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            background: barColor,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function OiDeltaCell({ value }: { value: number }) {
  const abs = Math.abs(value);
  const isPos = value > 0;
  const textColor =
    abs >= 5
      ? isPos
        ? "#5dc887"
        : "#e35561"
      : abs >= 2
        ? isPos
          ? "rgba(93,200,135,0.72)"
          : "rgba(227,85,97,0.72)"
        : "rgba(255,255,255,0.38)";
  return (
    <span
      style={{
        color: textColor,
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
      }}
    >
      {formatSigned(value)}
    </span>
  );
}

function FundingCell({ value }: { value: number }) {
  // Positive funding = longs pay shorts (overheated longs → red)
  // Negative funding = shorts pay longs (overheated shorts → green)
  const isHot = value > 0.03;
  const isSqueeze = value < -0.02;
  const textColor = isHot
    ? "#e35561"
    : isSqueeze
      ? "#5dc887"
      : value > 0
        ? "rgba(227,85,97,0.58)"
        : value < 0
          ? "rgba(93,200,135,0.58)"
          : "rgba(255,255,255,0.38)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          color: textColor,
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
        }}
      >
        {formatSigned(value, "%")}
      </span>
      {(isHot || isSqueeze) && (
        <span
          style={{
            fontSize: "0.58rem",
            color: textColor,
            opacity: 0.75,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          {isHot ? "HOT" : "SQZ"}
        </span>
      )}
    </div>
  );
}

function ChoppinessCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined)
    return <span className="text-white/20">—</span>;
  const trending = value < 38.2;
  const choppy = value > 61.8;
  const color = trending
    ? "#5dc887"
    : choppy
      ? "#e35561"
      : "rgba(255,255,255,0.42)";
  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{ color, fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
      >
        {value.toFixed(1)}
      </span>
      {(trending || choppy) && (
        <span
          style={{
            color,
            fontSize: "0.58rem",
            opacity: 0.72,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          {trending ? "TREND" : "CHOP"}
        </span>
      )}
    </div>
  );
}

const ScannerChartCell = memo(
  function ScannerChartCell({ chart }: { chart: ScannerAsset["chart"] }) {
    const lastCandle = chart[chart.length - 1];
    const isUp = lastCandle ? lastCandle.close >= lastCandle.open : true;
    const accentColor = isUp ? "#5dc887" : "#e35561";

    return (
      <div className="relative inline-block w-[158px] overflow-hidden rounded-[6px] border border-white/8 bg-[#0a0a0a]">
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        />
        <MicroChart
          klines={chart}
          alertTimestamp="2000-01-01 00:00:00+00"
          width={158}
          height={60}
          periods={TABLE_CHART_MAX_CANDLES}
        />
      </div>
    );
  },
  (prev, next) => {
    const a = prev.chart;
    const b = next.chart;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (
        a[i].time !== b[i].time ||
        a[i].open !== b[i].open ||
        a[i].high !== b[i].high ||
        a[i].low !== b[i].low ||
        a[i].close !== b[i].close ||
        a[i].asset_volume !== b[i].asset_volume ||
        a[i].quote_volume !== b[i].quote_volume
      ) {
        return false;
      }
    }

    return true;
  },
);

const scannerColumns: ColumnDef<ScannerAsset>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    enableSorting: false,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => {
      const asset = row.original;
      return (
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden",
            SYMBOL_COLUMN_WIDTH_CLASS,
          )}
        >
          <div className="min-w-0 truncate">
            <Link
              to={`/assets/${asset.symbol}`}
              onClick={(e) => e.stopPropagation()}
              className="[font-family:var(--font-display)] text-[0.88rem] font-semibold italic leading-none text-white transition hover:text-[oklch(0.72_0.18_248)]"
            >
              {asset.symbol.replace("USDT", "")}
            </Link>
            <div className="mt-1 font-[var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em] text-white/28">
              USDT
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "chart",
    header: "Chart",
    enableSorting: false,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => {
      return <ScannerChartCell chart={row.original.chart} />;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className="font-[var(--font-mono)]">
        {formatPrice(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "change5m",
    header: "5m %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change5m} />
    ),
  },
  {
    accessorKey: "change15m",
    header: "15m %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change15m} />
    ),
  },
  {
    accessorKey: "change1h",
    header: "1h %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change1h} />
    ),
  },
  {
    accessorKey: "change4h",
    header: "4h %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change4h} />
    ),
  },
  {
    accessorKey: "change24h",
    header: "24h %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change24h} />
    ),
  },
  {
    accessorKey: "volume",
    header: "Volume",
    enableSorting: false,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.52)",
        }}
      >
        {row.original.volume}
      </span>
    ),
  },
  {
    accessorKey: "rvol",
    header: "RVOL",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <RvolCell value={row.original.rvol} />
    ),
  },
  {
    accessorKey: "oiDelta",
    header: "OI Δ",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <OiDeltaCell value={row.original.oiDelta} />
    ),
  },
  {
    accessorKey: "funding",
    header: "Funding",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <FundingCell value={row.original.funding} />
    ),
  },
  {
    accessorKey: "atrPercent",
    header: "ATR %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span>{numberFormat.format(row.original.atrPercent)}</span>
    ),
  },
  {
    accessorKey: "btcCorrelation",
    header: "BTC corr",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span>{row.original.btcCorrelation.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "alertCount",
    header: "Alerts",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span>{row.original.alertCount}</span>
    ),
  },
  {
    accessorKey: "setupScore",
    header: "Score",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ScoreBadge value={row.original.setupScore} />
    ),
  },
  {
    accessorKey: "sparkline",
    header: "Sparkline",
    enableSorting: false,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <div className="w-[96px] overflow-hidden text-white/62">
        <Sparkline values={row.original.sparkline} />
      </div>
    ),
  },
  {
    accessorKey: "alignedTimeframes",
    header: "Strength",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <AlignedTfIndicator value={row.original.alignedTimeframes} />
    ),
  },
  {
    accessorKey: "momentumChoppiness",
    header: "Chop",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChoppinessCell value={row.original.momentumChoppiness} />
    ),
  },
];

type ScannerTableProps = {
  assets: ScannerAsset[];
  density: DensityMode;
  preset: ScannerPreset;
  selectedSymbol?: string;
  sorting: SortingState;
  onSelectSymbol: (symbol: string) => void;
  onSortingChange: OnChangeFn<SortingState>;
};

type EntryKind = "first-appearance" | "index-change";
type EntryFlash = { firstAppearance: Set<string>; indexChange: Set<string> };

function useEntryFlash(
  assets: ScannerAsset[],
  sorting: SortingState,
  selectedSymbol: string | undefined,
): EntryFlash {
  const prevIndexRef = useRef<Map<string, number> | null>(null);
  const isArmedRef = useRef(false);
  const prevSortingRef = useRef(sorting);
  const [flash, setFlash] = useState<EntryFlash>({
    firstAppearance: new Set(),
    indexChange: new Set(),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      isArmedRef.current = true;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sortingChanged =
      prevSortingRef.current.length !== sorting.length ||
      prevSortingRef.current.some(
        (s, i) => s.id !== sorting[i].id || s.desc !== sorting[i].desc,
      );
    prevSortingRef.current = sorting;

    if (sortingChanged) {
      prevIndexRef.current = null;
      setFlash({ firstAppearance: new Set(), indexChange: new Set() });
      return;
    }

    const currentIndex = new Map(assets.map((a, i) => [a.symbol, i] as const));

    if (prevIndexRef.current === null || !isArmedRef.current) {
      prevIndexRef.current = currentIndex;
      return;
    }

    const firstAppearance: string[] = [];
    const indexChange: string[] = [];

    for (const [symbol, currentIdx] of currentIndex) {
      const prevIdx = prevIndexRef.current.get(symbol);

      if (prevIdx === undefined) {
        firstAppearance.push(symbol);
      } else if (prevIdx !== currentIdx) {
        indexChange.push(symbol);
      }
    }

    prevIndexRef.current = currentIndex;

    if (firstAppearance.length === 0 && indexChange.length === 0) return;

    const clearAfter = (kind: EntryKind, symbols: string[]) => {
      if (symbols.length === 0) return () => {};
      setFlash((prev) => {
        const key =
          kind === "first-appearance" ? "firstAppearance" : "indexChange";
        const next = new Set(prev[key]);
        for (const s of symbols) next.add(s);
        return { ...prev, [key]: next };
      });
      const timer = setTimeout(() => {
        setFlash((prev) => {
          const key =
            kind === "first-appearance" ? "firstAppearance" : "indexChange";
          const next = new Set(prev[key]);
          for (const s of symbols) next.delete(s);
          return { ...prev, [key]: next };
        });
      }, 2400);
      return () => clearTimeout(timer);
    };

    const clearFirst = clearAfter("first-appearance", firstAppearance);
    const clearIdx = clearAfter("index-change", indexChange);

    return () => {
      clearFirst();
      clearIdx();
    };
  }, [assets, sorting]);

  useEffect(() => {
    if (!selectedSymbol) return;
    setFlash((prev) => {
      if (
        !prev.firstAppearance.has(selectedSymbol) &&
        !prev.indexChange.has(selectedSymbol)
      )
        return prev;
      const fa = new Set(prev.firstAppearance);
      const ic = new Set(prev.indexChange);
      fa.delete(selectedSymbol);
      ic.delete(selectedSymbol);
      return { firstAppearance: fa, indexChange: ic };
    });
  }, [selectedSymbol]);

  return flash;
}

export function ScannerTable({
  assets,
  density,
  preset,
  selectedSymbol,
  sorting,
  onSelectSymbol,
  onSortingChange,
}: ScannerTableProps) {
  const { firstAppearance, indexChange } = useEntryFlash(
    assets,
    sorting,
    selectedSymbol,
  );
  const isMomentumPreset =
    preset === "Momentum Long" || preset === "Momentum Short";
  const visibleColIds = isMomentumPreset
    ? MOMENTUM_COLUMNS
    : preset === "Classic Rolling"
      ? GAINERS_COLUMNS
      : DEFAULT_COLUMNS;
  const columns = useMemo(
    () =>
      scannerColumns.filter((col) =>
        "accessorKey" in col
          ? visibleColIds.has(String(col.accessorKey))
          : "id" in col
            ? visibleColIds.has(String(col.id))
            : true,
      ),
    [visibleColIds],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    state: { sorting },
    manualSorting: true,
    enableSortingRemoval: false,
    getRowId: (row) => row.symbol,
  });

  return (
    <div className="min-w-0 border-b border-white/8 xl:flex-1 xl:border-b-0">
      <Table className="min-w-max w-full border-collapse hide-scrollbar-x">
        <TableHeader className="bg-[#0d0d0d]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-white/8 text-left hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "px-3 py-4 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/35",
                    header.column.id === "symbol" && SYMBOL_COLUMN_WIDTH_CLASS,
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : "",
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    background: header.column.getIsSorted()
                      ? "oklch(0.72 0.18 248 / 6%)"
                      : undefined,
                    transition: "background 0.12s",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getCanSort() && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          lineHeight: 1,
                          color: header.column.getIsSorted()
                            ? "oklch(0.72 0.18 248)"
                            : "oklch(0.32 0 0)",
                          transition: "color 0.12s",
                        }}
                      >
                        {header.column.getIsSorted() === "asc"
                          ? "↑"
                          : header.column.getIsSorted() === "desc"
                            ? "↓"
                            : "⇅"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const isSelected = row.original.symbol === selectedSymbol;
            return (
              <TableRow
                key={row.id}
                className={cn(
                  "border-b border-white/6",
                  isSelected
                    ? "bg-[rgba(91,143,249,0.20)] shadow-[inset_3px_0_0_0_#5b8ff9] border-b-[rgba(91,143,249,0.25)]"
                    : "hover:bg-white/[0.03]",
                  !isSelected &&
                    firstAppearance.has(row.original.symbol) &&
                    "scanner-row-first-appearance",
                  !isSelected &&
                    indexChange.has(row.original.symbol) &&
                    "scanner-row-index-change",
                  density === "expanded" ? "h-20" : "h-14",
                )}
                onClick={() => onSelectSymbol(row.original.symbol)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "whitespace-nowrap px-3 py-3 text-[0.78rem]",
                      cell.column.id === "symbol" && SYMBOL_COLUMN_WIDTH_CLASS,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
