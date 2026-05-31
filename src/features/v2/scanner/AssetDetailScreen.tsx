import {
  ArrowLeft,
  BellPlus,
  BookmarkPlus,
  Clock3,
  Star,
  Volume2,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { IndexChart } from "@/features/chart/IndexChart";
import { ActionButton } from "./components/ActionButton";
import { DetailBlock } from "./components/DetailBlock";
import { Pill } from "./components/Pill";
import { SessionBars } from "./components/SessionBars";
import { StatCard } from "./components/StatCard";
import { getScannerAssetBySymbol } from "./data/mockScannerData";
import { formatPrice, formatSigned, numberFormat } from "./lib/formatters";

const chipClassName =
  "inline-flex h-7 items-center rounded-[4px] border px-[9px] py-0 font-[var(--font-mono)] text-[0.7rem] font-medium tracking-[0.05em]";

function AssetDetailNotFound() {
  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-16 pt-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/v2/scanner"
          className="inline-flex items-center gap-2 font-[var(--font-mono)] text-[0.72rem] uppercase tracking-[0.1em] text-white/48 transition hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scanner
        </Link>

        <div className="mt-8 rounded-[28px] border border-white/8 bg-[#0b0b0b] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <p className="font-[var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
            Asset detail
          </p>
          <h1 className="mt-3 [font-family:var(--font-display)] text-3xl font-bold italic text-white">
            Symbol not found
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
            This symbol is not available in the current scanner dataset yet.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AssetDetailScreen() {
  const { symbol = "" } = useParams();
  const asset = getScannerAssetBySymbol(symbol);

  if (!asset) {
    return <AssetDetailNotFound />;
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-16 pt-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/v2/scanner"
          className="inline-flex items-center gap-2 font-[var(--font-mono)] text-[0.72rem] uppercase tracking-[0.1em] text-white/48 transition hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scanner
        </Link>

        <section className="mt-5 rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="[font-family:var(--font-display)] text-3xl font-bold italic leading-none text-white sm:text-4xl">
                  {asset.symbol}
                </h1>
                <span
                  className={`${chipClassName} border-transparent bg-transparent text-white/40`}
                >
                  {asset.market}
                </span>
                <span
                  className={`${chipClassName} border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]`}
                >
                  {asset.setupScore} / 100
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 font-[var(--font-mono)]">
                <span className="text-2xl font-semibold text-white sm:text-3xl">
                  {formatPrice(asset.price)}
                </span>
                <Pill value={asset.change5m} label="5m" />
                <Pill value={asset.change15m} label="15m" />
                <Pill value={asset.change1h} label="1h" />
                <Pill value={asset.change4h} label="4h" />
                <Pill value={asset.change24h} label="1d" />
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-6 text-white/62">
                {asset.activeSetupSummary}
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-sm">
              <ActionButton
                icon={<BellPlus className="h-4 w-4" />}
                variant="primary"
              >
                Set alert
              </ActionButton>
              <ActionButton
                icon={<BookmarkPlus className="h-4 w-4" />}
                variant="secondary"
              >
                Add to watchlist
              </ActionButton>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Volume 24h" value={asset.volume} tone="neutral" />
            <StatCard
              label="RVOL"
              value={`${asset.rvol.toFixed(1)}x`}
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
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
                <span>Price structure · 1h</span>
                <span>vol / OI / funding</span>
              </div>
              <div className="rounded-[20px] border border-white/8 bg-black p-4">
                <div className="relative h-[320px] overflow-hidden rounded-[14px]">
                  <div className="pointer-events-none absolute inset-y-0 left-[60%] z-10 border-l-2 border-dashed border-[rgba(91,143,249,0.75)]" />
                  <span className="pointer-events-none absolute left-[58%] top-2 z-10 text-xs font-semibold text-[#5b8ff9]">
                    <span
                      className={`${chipClassName} h-6 border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] px-[7px] text-[oklch(0.72_0.18_248)]`}
                    >
                      live setup
                    </span>
                  </span>
                  <IndexChart
                    symbol={asset.symbol}
                    klines={asset.chart}
                    upColor="#5dc887"
                    downColor="#e35561"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Active setup
                  </p>
                  <span
                    className={`${chipClassName} border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]`}
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

              <div className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
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
            </div>

            <div className="grid gap-5 md:grid-cols-3">
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
              <DetailBlock
                label="Volatility context"
                body={`ATR is ${numberFormat.format(asset.atrPercent)} with ${asset.alertCount} recent signals across tracked windows.`}
                icon={<BellPlus className="h-4 w-4" />}
              />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
              <div className="mb-4 grid grid-cols-2 gap-3">
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
                  label="Alerts"
                  value={String(asset.alertCount)}
                  tone="accent"
                />
                <StatCard
                  label="24h move"
                  value={formatSigned(asset.change24h)}
                  tone={asset.change24h >= 0 ? "positive" : "neutral"}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Recent alerts
                </p>
                <Badge
                  className={`${chipClassName} border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]`}
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
                        className={`${chipClassName} border-transparent bg-transparent text-white/55`}
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

              <Link
                to="/alerts/explorer"
                className="mt-4 inline-flex font-[var(--font-mono)] text-[0.7rem] uppercase tracking-[0.12em] text-[oklch(0.72_0.18_248)] transition hover:text-white"
              >
                Open alerts explorer
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
