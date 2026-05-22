import { Circle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatSigned, getChangeTone, numberFormat } from "../lib/formatters";
import type { DensityMode, ScannerAsset } from "../types";
import { Sparkline } from "./Sparkline";

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="px-3 py-4 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/35">
      {children}
    </TableHead>
  );
}

function DataCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableCell className={`whitespace-nowrap px-3 py-3 text-[0.78rem] ${className}`}>
      {children}
    </TableCell>
  );
}

type ScannerTableProps = {
  assets: ScannerAsset[];
  density: DensityMode;
  selectedSymbol?: string;
  onSelectSymbol: (symbol: string) => void;
};

export function ScannerTable({
  assets,
  density,
  selectedSymbol,
  onSelectSymbol,
}: ScannerTableProps) {
  return (
    <div className="min-w-0 overflow-hidden border-b border-white/8 xl:flex-1 xl:border-b-0 xl:border-r">
      <Table className="w-full table-fixed border-collapse">
        <TableHeader className="bg-[#0d0d0d]">
          <TableRow className="border-white/8 text-left hover:bg-transparent">
            <HeaderCell>Symbol</HeaderCell>
            <HeaderCell>Price</HeaderCell>
            <HeaderCell>5m %</HeaderCell>
            <HeaderCell>15m %</HeaderCell>
            <HeaderCell>1h %</HeaderCell>
            <HeaderCell>4h %</HeaderCell>
            <HeaderCell>24h %</HeaderCell>
            <HeaderCell>Volume</HeaderCell>
            <HeaderCell>RVOL</HeaderCell>
            <HeaderCell>OI Δ</HeaderCell>
            <HeaderCell>Funding</HeaderCell>
            <HeaderCell>ATR %</HeaderCell>
            <HeaderCell>BTC corr</HeaderCell>
            <HeaderCell>Alerts</HeaderCell>
            <HeaderCell>Setup label</HeaderCell>
            <HeaderCell>Score</HeaderCell>
            <HeaderCell>Sparkline</HeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const isSelected = asset.symbol === selectedSymbol;

            return (
              <TableRow
                key={asset.symbol}
                className={`border-b border-white/6 transition hover:bg-white/[0.03] ${
                  isSelected
                    ? "bg-[rgba(91,143,249,0.10)] shadow-[inset_2px_0_0_0_#5b8ff9]"
                    : ""
                } ${density === "expanded" ? "h-20" : "h-14"}`}
                onClick={() => onSelectSymbol(asset.symbol)}
              >
                <TableCell className="w-[128px] whitespace-nowrap px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Circle className="h-4 w-4 text-white/32" />
                    <div>
                      <div className="[font-family:var(--font-display)] text-[0.88rem] font-semibold italic leading-none text-white">
                        {asset.symbol.replace("USDT", "")}
                      </div>
                      <div className="mt-1 font-[var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em] text-white/28">
                        USDT
                      </div>
                    </div>
                  </div>
                </TableCell>
                <DataCell className="font-[var(--font-mono)]">{formatPrice(asset.price)}</DataCell>
                <DataCell className={getChangeTone(asset.change5m)}>{formatSigned(asset.change5m)}</DataCell>
                <DataCell className={getChangeTone(asset.change15m)}>{formatSigned(asset.change15m)}</DataCell>
                <DataCell className={getChangeTone(asset.change1h)}>{formatSigned(asset.change1h)}</DataCell>
                <DataCell className={getChangeTone(asset.change4h)}>{formatSigned(asset.change4h)}</DataCell>
                <DataCell className={getChangeTone(asset.change24h)}>{formatSigned(asset.change24h)}</DataCell>
                <DataCell>{asset.volume}</DataCell>
                <DataCell className="font-semibold text-amber-300">{asset.rvol.toFixed(1)}x</DataCell>
                <DataCell className={getChangeTone(asset.oiDelta)}>{formatSigned(asset.oiDelta)}</DataCell>
                <DataCell className={getChangeTone(asset.funding)}>{formatSigned(asset.funding, "%")}</DataCell>
                <DataCell>{numberFormat.format(asset.atrPercent)}</DataCell>
                <DataCell>{asset.btcCorrelation.toFixed(2)}</DataCell>
                <DataCell>{asset.alertCount}</DataCell>
                <DataCell className="w-[170px]">
                  <span className="inline-block max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.74rem] font-medium text-white/76 align-middle">
                    {asset.setupLabel}
                  </span>
                </DataCell>
                <DataCell>
                  <span
                    className={`inline-flex min-w-11 items-center justify-center rounded-lg px-2.5 py-1 text-[0.78rem] font-bold ${
                      asset.setupScore >= 80
                        ? "bg-[#5b8ff9] text-white"
                        : asset.setupScore >= 60
                          ? "bg-amber-300 text-black"
                          : "bg-white/10 text-white/78"
                    }`}
                  >
                    {asset.setupScore}
                  </span>
                </DataCell>
                <DataCell className="text-white/62">
                  <Sparkline values={asset.sparkline} />
                </DataCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
