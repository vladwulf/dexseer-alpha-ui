import type { ColumnDef, CellContext } from "@tanstack/react-table";
import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { MiniChartModal } from "@/features/chart/MiniChart";
import type { ScreenerAsset, ScreenerAssetWithChart } from "../types";
import { MicroChart } from "@/features/chart/MicroChart";
import { Link } from "react-router";
import { millify } from "millify";

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

export const cryptoColumns: ColumnDef<ScreenerAssetWithChart>[] = [
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

          <MiniChartModal
            klines={row.original.chart.data}
            upColor="#5dc887"
            downColor="#e35561"
            height={250}
            width={400}
            periods={100}
          >
            <div className="cursor-pointer">
              <MicroChart
                klines={row.original.chart.data}
                alertTimestamp="2026-01-17 09:53:00+00"
                width={100}
                height={40}
                periods={100}
              />
            </div>
          </MiniChartModal>
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
