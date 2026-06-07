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
import { memo, useMemo } from "react";
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
import {
  formatPrice,
  formatSigned,
  getChangeTone,
  numberFormat,
} from "../lib/formatters";
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

const ScannerChartCell = memo(function ScannerChartCell({
  chart,
}: {
  chart: ScannerAsset["chart"];
}) {
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
        periods={80}
      />
    </div>
  );
});

const scannerColumns: ColumnDef<ScannerAsset>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    enableSorting: false,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => {
      const asset = row.original;
      return (
        <div className="flex items-center gap-3">
          <div>
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
      <span className={getChangeTone(row.original.change5m)}>
        {formatSigned(row.original.change5m)}
      </span>
    ),
  },
  {
    accessorKey: "change15m",
    header: "15m %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className={getChangeTone(row.original.change15m)}>
        {formatSigned(row.original.change15m)}
      </span>
    ),
  },
  {
    accessorKey: "change1h",
    header: "1h %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className={getChangeTone(row.original.change1h)}>
        {formatSigned(row.original.change1h)}
      </span>
    ),
  },
  {
    accessorKey: "change4h",
    header: "4h %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className={getChangeTone(row.original.change4h)}>
        {formatSigned(row.original.change4h)}
      </span>
    ),
  },
  {
    accessorKey: "change24h",
    header: "24h %",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className={getChangeTone(row.original.change24h)}>
        {formatSigned(row.original.change24h)}
      </span>
    ),
  },
  {
    accessorKey: "volume",
    header: "Volume",
    enableSorting: false,
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span>{row.original.volume}</span>
    ),
  },
  {
    accessorKey: "rvol",
    header: "RVOL",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className="font-semibold text-amber-300">
        {row.original.rvol.toFixed(1)}x
      </span>
    ),
  },
  {
    accessorKey: "oiDelta",
    header: "OI Δ",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className={getChangeTone(row.original.oiDelta)}>
        {formatSigned(row.original.oiDelta)}
      </span>
    ),
  },
  {
    accessorKey: "funding",
    header: "Funding",
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => (
      <span className={getChangeTone(row.original.funding)}>
        {formatSigned(row.original.funding, "%")}
      </span>
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
    cell: ({ row }: CellContext<ScannerAsset, unknown>) => {
      const score = row.original.setupScore;
      return (
        <span
          className={`inline-flex min-w-11 items-center justify-center rounded-lg px-2.5 py-1 text-[0.78rem] font-bold ${score >= 80
            ? "bg-[#5b8ff9] text-white"
            : score >= 60
              ? "bg-amber-300 text-black"
              : "bg-white/10 text-white/78"
            }`}
        >
          {score}
        </span>
      );
    },
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

export function ScannerTable({
  assets,
  density,
  preset,
  selectedSymbol,
  sorting,
  onSelectSymbol,
  onSortingChange,
}: ScannerTableProps) {
  const visibleColIds =
    preset === "Gainers" ? GAINERS_COLUMNS : DEFAULT_COLUMNS;
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
    <div className="min-w-0 border-b border-white/8 xl:flex-1 xl:border-b-0 xl:border-r">
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
                  "border-b border-white/6 transition hover:bg-white/[0.03]",
                  isSelected &&
                  "bg-[rgba(91,143,249,0.10)] shadow-[inset_2px_0_0_0_#5b8ff9]",
                  density === "expanded" ? "h-20" : "h-14",
                )}
                onClick={() => onSelectSymbol(row.original.symbol)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="whitespace-nowrap px-3 py-3 text-[0.78rem]"
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
