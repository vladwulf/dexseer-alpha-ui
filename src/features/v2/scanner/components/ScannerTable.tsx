import type {
  CellContext,
  ColumnDef,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  formatCompactNumber,
  formatCompactUsd,
  formatFundingRate,
  formatPrice,
  formatSigned,
  numberFormat,
} from "../lib/formatters";
import { DEFAULT_SCANNER_COLUMN_ORDER } from "../lib/scannerColumns";
import type { DensityMode, ScannerAsset } from "../types";

const SYMBOL_COLUMN_WIDTH_CLASS = "w-[80px] min-w-[80px]";

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

function OiDeltaCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/20">—</span>;

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

function FundingCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/20">—</span>;

  // Positive funding = longs pay shorts (overheated longs → red)
  // Negative funding = shorts pay longs (overheated shorts → green)
  const isHot = value > 0.0003;
  const isSqueeze = value < -0.0002;
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
        {formatFundingRate(value)}
      </span>
      {(isHot || isSqueeze) && (
        <span
          style={{
            fontSize: "0.58rem",
            color: textColor,
            opacity: 0.75,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
            whiteSpace: "pre-line",
          }}
        >
          {isHot ? "LONG\nHEAVY" : "SHORT\nHEAVY"}
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

function CompactValueCell({ value }: { value: number | null }) {
  return (
    <span className="font-[var(--font-mono)] text-[0.75rem] text-white/52">
      {formatCompactNumber(value)}
    </span>
  );
}

function MomentumScoreCell({ asset }: { asset: ScannerAsset }) {
  const value = asset.momentumScore;

  if (value === null) {
    return (
      <span className="momentum-score-pill momentum-score-pill--empty">
        <span className="momentum-score-pill__dot" />
        No data
      </span>
    );
  }

  const direction = value > 0 ? "bullish" : value < 0 ? "bearish" : "balanced";
  const directionLabel =
    direction === "bullish"
      ? "Bull"
      : direction === "bearish"
        ? "Bear"
        : "Even";
  const strength = Math.min(Math.abs(value), 100);
  return (
    <span
      className={cn(
        "momentum-score-pill",
        `momentum-score-pill--${direction}`,
        strength >= 70 && "momentum-score-pill--strong",
      )}
    >
      <span
        className="momentum-score-pill__strength"
        style={{ width: `${strength}%` }}
      />
      <span className="momentum-score-pill__shine" />
      <span className="momentum-score-pill__dot" />
      <span className="momentum-score-pill__direction">{directionLabel}</span>
      <span className="momentum-score-pill__value">
        {value > 0 ? "+" : ""}
        {value}
      </span>
    </span>
  );
}

const scannerColumns: ColumnDef<ScannerAsset>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => {
      const asset = row.original;
      return (
        <div
          className={cn("flex items-center gap-3", SYMBOL_COLUMN_WIDTH_CLASS)}
        >
          <div className="min-w-0">
            <span
              className="[font-family:var(--font-display)] text-[0.88rem] font-semibold italic leading-none text-white"
            >
              {asset.symbol.replace("USDT", "")}
            </span>
            <div className="mt-1 font-[var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em] text-white/28">
              USDT
            </div>
          </div>
        </div>
      );
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
    header: "5m change",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change5m} />
    ),
  },
  {
    accessorKey: "change15m",
    header: "15m change",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change15m} />
    ),
  },
  {
    accessorKey: "change1h",
    header: "1h change",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change1h} />
    ),
  },
  {
    accessorKey: "change4h",
    header: "4h change",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change4h} />
    ),
  },
  {
    accessorKey: "change24h",
    header: "24h change",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.change24h} />
    ),
  },
  {
    accessorKey: "momentumScore",
    header: "Score",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <div className="flex justify-center">
        <MomentumScoreCell asset={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "volume",
    header: "Volume 24h",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.52)",
        }}
      >
        {row.original.volume === null
          ? "—"
          : Intl.NumberFormat("en-US", {
              maximumFractionDigits: 1,
              notation: "compact",
            }).format(row.original.volume)}
      </span>
    ),
  },
  {
    accessorKey: "rvol",
    header: "RVOL 24h",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <RvolCell value={row.original.rvol} />
    ),
  },
  {
    accessorKey: "openInterest",
    header: "OI",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.52)",
        }}
      >
        {formatCompactUsd(row.original.openInterest)}
      </span>
    ),
  },
  {
    accessorKey: "oiDelta",
    header: "OI Δ 24h",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <OiDeltaCell value={row.original.oiDelta} />
    ),
  },
  {
    accessorKey: "funding",
    header: "Funding rate",
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
    header: "BTC correlation",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span>{row.original.btcCorrelation.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "alignedTimeframes",
    header: "TF alignment",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <AlignedTfIndicator value={row.original.alignedTimeframes} />
    ),
  },
  {
    accessorKey: "momentumChoppiness",
    header: "Choppiness",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChoppinessCell value={row.original.momentumChoppiness} />
    ),
  },
  ...[
    ["volume1m", "Volume 1m"],
    ["volume5m", "Volume 5m"],
    ["volume15m", "Volume 15m"],
    ["volume30m", "Volume 30m"],
    ["volume1h", "Volume 1h"],
    ["volume4h", "Volume 4h"],
  ].map(([accessorKey, header]) => ({
    accessorKey,
    header,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <CompactValueCell
        value={row.original[accessorKey as keyof ScannerAsset] as number | null}
      />
    ),
  })),
  ...[
    ["rvol1m", "RVOL 1m"],
    ["rvol5m", "RVOL 5m"],
    ["rvol15m", "RVOL 15m"],
    ["rvol30m", "RVOL 30m"],
    ["rvol1h", "RVOL 1h"],
    ["rvol4h", "RVOL 4h"],
  ].map(([accessorKey, header]) => ({
    accessorKey,
    header,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <RvolCell
        value={row.original[accessorKey as keyof ScannerAsset] as number | null}
      />
    ),
  })),
  ...[
    ["oiDelta5m", "OI Δ 5m"],
    ["oiDelta15m", "OI Δ 15m"],
    ["oiDelta30m", "OI Δ 30m"],
    ["oiDelta1h", "OI Δ 1h"],
    ["oiDelta4h", "OI Δ 4h"],
  ].map(([accessorKey, header]) => ({
    accessorKey,
    header,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <OiDeltaCell
        value={row.original[accessorKey as keyof ScannerAsset] as number | null}
      />
    ),
  })),
  {
    accessorKey: "fundingDelta8h",
    header: "Funding Δ 8h",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <ChangePctCell value={row.original.fundingDelta8h} />
    ),
  },
];

type ScannerTableProps = {
  assets: ScannerAsset[];
  columnOrder?: string[];
  density: DensityMode;
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
  columnOrder = DEFAULT_SCANNER_COLUMN_ORDER,
  density,
  selectedSymbol,
  sorting,
  onSelectSymbol,
  onSortingChange,
}: ScannerTableProps) {
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const { firstAppearance, indexChange } = useEntryFlash(
    assets,
    sorting,
    selectedSymbol,
  );
  const columns = useMemo(() => {
    const columnsById = new Map(
      scannerColumns.map((column) => [
        String("accessorKey" in column ? column.accessorKey : column.id),
        column,
      ]),
    );
    return columnOrder.flatMap((id) => {
      const column = columnsById.get(id);
      return column ? [column] : [];
    });
  }, [columnOrder]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    state: { sorting },
    enableSortingRemoval: false,
    getRowId: (row) => row.symbol,
  });

  useEffect(() => {
    if (!selectedSymbol) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      const selectedIndex = assets.findIndex(
        (asset) => asset.symbol === selectedSymbol,
      );
      if (selectedIndex === -1) {
        return;
      }

      event.preventDefault();

      const nextIndex = Math.min(
        Math.max(selectedIndex + (event.key === "ArrowDown" ? 1 : -1), 0),
        assets.length - 1,
      );
      const nextSymbol = assets[nextIndex]?.symbol;
      if (!nextSymbol || nextSymbol === selectedSymbol) {
        return;
      }

      onSelectSymbol(nextSymbol);
      rowRefs.current.get(nextSymbol)?.scrollIntoView({ block: "nearest" });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [assets, onSelectSymbol, selectedSymbol]);

  return (
    <div className="min-w-0 border-b border-white/8 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-auto xl:border-b-0">
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
                    "sticky top-0 z-10 bg-[#0d0d0d] px-3 py-4 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/35 shadow-[0_1px_0_rgba(255,255,255,0.08)]",
                    header.column.id === "symbol" && SYMBOL_COLUMN_WIDTH_CLASS,
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : "",
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    background: header.column.getIsSorted()
                      ? "#0d1b2a"
                      : "#0d0d0d",
                    boxShadow: header.column.getIsSorted()
                      ? "inset 0 -2px 0 oklch(0.72 0.18 248 / 75%)"
                      : undefined,
                    color: header.column.getIsSorted()
                      ? "oklch(0.72 0.18 248)"
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
                ref={(element) => {
                  if (element) {
                    rowRefs.current.set(row.original.symbol, element);
                  } else {
                    rowRefs.current.delete(row.original.symbol);
                  }
                }}
                className={cn(
                  "border-b border-white/6",
                  isSelected
                    ? "bg-[rgba(91,143,249,0.20)] shadow-[inset_3px_0_0_0_#5b8ff9] border-b-[rgba(91,143,249,0.25)]"
                    : "hover:bg-white/[0.045]",
                  !isSelected &&
                    firstAppearance.has(row.original.symbol) &&
                    "scanner-row-first-appearance",
                  !isSelected &&
                    indexChange.has(row.original.symbol) &&
                    "scanner-row-index-change",
                  density === "expanded" ? "h-20" : "h-11",
                )}
                onClick={() => onSelectSymbol(row.original.symbol)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "whitespace-nowrap px-3 text-[0.78rem]",
                      density === "expanded" ? "py-3" : "py-1.5",
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
