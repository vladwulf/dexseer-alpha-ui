import type { ColumnDef, CellContext } from "@tanstack/react-table";
import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import type { ScreenerAsset, ScreenerAssetWithChart } from "../types";
import { MicroChart } from "@/features/chart/MicroChart";
import { StandardChart } from "@/features/chart/StandardChart";
import { Link } from "react-router";
import { millify } from "millify";
import type { ScreenerDensity } from "../screener-buttons/ScreenerConfigs";

/**
 * Reusable cell renderer for percentage change values
 * Colors positive values green and negative values red
 */
const percentageChangeCell = <T,>({ getValue }: CellContext<T, unknown>) => {
  const value = getValue() as number;
  if (value === 0) {
    return <span className="text-gray-300">0.00</span>;
  }

  if (value === null || value === undefined) {
    return <span className="text-gray-500 font-light text-xs">N/A</span>;
  }

  return (
    <span className={cn(value > 0 ? "text-[#5dc887]" : "text-[#e35561]")}>
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}
    </span>
  );
};

/**
 * Reusable cell renderer for volume delta change values
 * Colors positive values green, shows gray "-" for negative values
 */
const volumeDeltaChangeCell = <T,>({ getValue }: CellContext<T, unknown>) => {
  const value = getValue() as number;
  if (value === 0) {
    return <span className="text-gray-300">0.00</span>;
  }

  if (value === null || value === undefined) {
    return <span className="text-gray-500 font-light text-xs">N/A</span>;
  }

  if (value < 0) {
    return <span className="text-gray-500">-</span>;
  }

  return <span className="text-[#5dc887]">+{value.toFixed(2)}</span>;
};

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

export type TrackedAssetExtended = ScreenerAsset & {
  chart: ReactElement;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const getPercentClassName = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "text-muted-foreground";
  if (value > 0) return "text-[#5dc887]";
  if (value < 0) return "text-[#e35561]";
  return "text-gray-300";
};

const formatVolumeDelta = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  if (value < 0) return value.toFixed(2);
  return `+${value.toFixed(2)}`;
};

const getVolumeDeltaClassName = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "text-muted-foreground";
  if (value > 0) return "text-[#5dc887]";
  if (value < 0) return "text-[#e35561]";
  return "text-gray-300";
};

export const getCryptoColumns = (density: ScreenerDensity = "compact") => {
  if (density === "extended") {
    return [
      {
        id: "ta_view",
        header: "",
        enableSorting: false,
        cell: ({ row }: CellContext<ScreenerAssetWithChart, unknown>) => {
          const asset = row.original;
          const shortSymbol = asset.symbol.replace("USDT", "");
          return (
            <div className="w-full px-1">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative h-[400px] w-full overflow-hidden rounded-md border border-border/60 bg-black lg:flex-1">
                  <StandardChart
                    klines={asset.chart.data.slice(-120)}
                    width="100%"
                    height="100%"
                    upColor="#5dc887"
                    downColor="#e35561"
                    showLegend={false}
                    backgroundColor="#000000"
                    headerTitle={shortSymbol}
                    headerSubtitle={asset.symbol}
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-6xl font-bold tracking-widest text-white/10">
                      {shortSymbol}
                    </span>
                    <span className="mt-2 text-sm font-medium tracking-[0.2em] text-white/15">
                      {asset.symbol}
                    </span>
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-md border border-border/60 bg-black/50 p-3 lg:w-full lg:max-w-[350px] lg:flex-none">
                  <div className="mb-3 border-b border-border/60 pb-2">
                    <Link
                      to={`/chart?symbol=${asset.symbol}&timeframe=1m`}
                      className="text-lg font-semibold text-foreground hover:underline"
                    >
                      {shortSymbol}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {asset.symbol}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Price</div>
                    <div className="text-right font-medium">
                      {asset.price.toFixed(6)}
                    </div>

                    <div className="text-muted-foreground">1m %</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getPercentClassName(asset.change_1m),
                      )}
                    >
                      {formatPercent(asset.change_1m)}
                    </div>

                    <div className="text-muted-foreground">5m %</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getPercentClassName(asset.change_5m),
                      )}
                    >
                      {formatPercent(asset.change_5m)}
                    </div>

                    <div className="text-muted-foreground">15m %</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getPercentClassName(asset.change_15m),
                      )}
                    >
                      {formatPercent(asset.change_15m)}
                    </div>

                    <div className="text-muted-foreground">1h %</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getPercentClassName(asset.change_1h),
                      )}
                    >
                      {formatPercent(asset.change_1h)}
                    </div>

                    <div className="text-muted-foreground">4h %</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getPercentClassName(asset.change_4h),
                      )}
                    >
                      {formatPercent(asset.change_4h)}
                    </div>

                    <div className="text-muted-foreground">Volume 1d</div>
                    <div className="text-right font-medium">
                      {millify(asset.volume_1d)}
                    </div>

                    <div className="text-muted-foreground">Volume Δ 1m</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getVolumeDeltaClassName(asset.volume_delta_1m),
                      )}
                    >
                      {formatVolumeDelta(asset.volume_delta_1m)}
                    </div>

                    <div className="text-muted-foreground">Volume Δ 5m</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getVolumeDeltaClassName(asset.volume_delta_5m),
                      )}
                    >
                      {formatVolumeDelta(asset.volume_delta_5m)}
                    </div>

                    <div className="text-muted-foreground">Volume Δ 1h</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getVolumeDeltaClassName(asset.volume_delta_1h),
                      )}
                    >
                      {formatVolumeDelta(asset.volume_delta_1h)}
                    </div>

                    <div className="text-muted-foreground">Volume Δ 4h</div>
                    <div
                      className={cn(
                        "text-right font-medium",
                        getVolumeDeltaClassName(asset.volume_delta_4h),
                      )}
                    >
                      {formatVolumeDelta(asset.volume_delta_4h)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
    ];
  }

  return [
    {
      accessorKey: "symbol",
      header: "Name",
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-around gap-4">
            <div className="w-22 flex justify-center items-center">
              <Link
                to={`/chart?symbol=${row.original.symbol}&timeframe=1m`}
                className="text-xs"
              >
                {row.original.symbol.replace("USDT", "")}
              </Link>
            </div>

            <MicroChart
              klines={row.original.chart.data}
              alertTimestamp="2026-01-17 09:53:00+00"
              width={100}
              height={40}
              periods={100}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "change_1m",
      header: "1m %",
      cell: percentageChangeCell,
    },
    {
      accessorKey: "change_5m",
      header: "5m %",
      cell: percentageChangeCell,
    },
    {
      accessorKey: "change_15m",
      header: "15m %",
      cell: percentageChangeCell,
    },
    {
      accessorKey: "change_1h",
      header: "1h %",
      cell: percentageChangeCell,
    },
    {
      accessorKey: "change_4h",
      header: "4h %",
      cell: percentageChangeCell,
    },
    {
      accessorKey: "volume_1d",
      header: "Volume 1d",
      enableSorting: false,
      cell: ({ row }) => {
        return <span>{millify(row.original.volume_1d)}</span>;
      },
    },
    {
      accessorKey: "volume_delta_1m",
      header: "Volume Δ 1m",
      cell: volumeDeltaChangeCell,
    },
    {
      accessorKey: "volume_delta_5m",
      header: "Volume Δ 5m",
      cell: volumeDeltaChangeCell,
    },
    {
      accessorKey: "volume_delta_1h",
      header: "Volume Δ 1h",
      cell: volumeDeltaChangeCell,
    },
    {
      accessorKey: "volume_delta_4h",
      header: "Volume Δ 4h",
      cell: volumeDeltaChangeCell,
    },
  ];
};

export const cryptoExtendedColumns: ColumnDef<TrackedAssetExtended>[] = [
  {
    accessorKey: "chart",
    header: "Chart",
  },
  {
    accessorKey: "symbol",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "change1m",
    header: "1m %",
    cell: percentageChangeCell,
  },
  {
    accessorKey: "change5m",
    header: "5m %",
    cell: percentageChangeCell,
  },
  {
    accessorKey: "change15m",
    header: "15m %",
    cell: percentageChangeCell,
  },
  {
    accessorKey: "change1h",
    header: "1h %",
    cell: percentageChangeCell,
  },
  {
    accessorKey: "change4h",
    header: "4h %",
    cell: percentageChangeCell,
  },
  {
    accessorKey: "volume",
    header: "Volume 24h",
  },
  {
    accessorKey: "volumeDelta1m",
    header: "Volume Δ 1m",
  },
  {
    accessorKey: "volumeDelta5m",
    header: "Volume Δ 5m",
  },
  {
    accessorKey: "volumeDelta1h",
    header: "Volume Δ 1h",
  },
  {
    accessorKey: "volumeDelta4h",
    header: "Volume Δ 4h",
  },
];
