import { Activity, Clock3, Star, Volume2 } from "lucide-react";
import type { AlertListItem } from "@/features/alerts-explorer/hooks/alerts.api";
import {
  formatCompactUsd,
  formatFundingRate,
  formatSigned,
} from "../../../lib/formatters";
import type { ScannerAsset } from "../../../types";
import { DetailBlock } from "../../DetailBlock";
import { SessionBars } from "../../SessionBars";
import { StatCard } from "../../StatCard";
import { RecentAlertsList } from "./RecentAlertsList";

function formatScore(value: number | null) {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value}`;
}

function getMomentumDirection(value: number | null) {
  if (value === null) return "Awaiting data";
  if (value > 0) return "Bullish";
  if (value < 0) return "Bearish";
  return "Balanced";
}

function getMomentumTone(value: number | null) {
  if (value === null || value === 0) return "neutral" as const;
  return value > 0 ? ("positive" as const) : ("negative" as const);
}

function getMomentumToneClass(value: number | null) {
  if (value === null || value === 0) return "text-white/40";
  return value > 0 ? "text-[#5dc887]" : "text-[#e35561]";
}

function getMomentumSummary(asset: ScannerAsset) {
  const score = asset.momentumScore;

  if (score === null) {
    return "Momentum is still forming. There is not enough fresh market activity yet for a reliable directional read.";
  }

  if (score === 0) {
    return "Momentum is mixed right now. Buyers and sellers are offsetting each other, so there is no clear directional edge.";
  }

  const strength = Math.abs(score);
  const bullish = score > 0;

  if (strength >= 70) {
    return bullish
      ? "Buyers are firmly in control. Short-term activity and the broader market rhythm are moving in the same direction, creating a strong bullish read."
      : "Sellers are firmly in control. Short-term activity and the broader market rhythm are moving in the same direction, creating a strong bearish read.";
  }

  if (strength >= 40) {
    return bullish
      ? "Buyers have the edge. Momentum is leaning higher across the market, although the move is not yet fully decisive."
      : "Sellers have the edge. Momentum is leaning lower across the market, although the move is not yet fully decisive.";
  }

  return bullish
    ? "Buying pressure is starting to build, but the move is still early and may need more follow-through."
    : "Selling pressure is starting to build, but the move is still early and may need more follow-through.";
}

function getMarketContext(asset: ScannerAsset) {
  const performance = [
    asset.change15m === null ? null : `${formatSigned(asset.change15m)} in 15m`,
    asset.change1h === null ? null : `${formatSigned(asset.change1h)} in 1h`,
    asset.change24h === null ? null : `${formatSigned(asset.change24h)} in 24h`,
  ].filter((value): value is string => value !== null);
  const priceAction =
    performance.length > 0 ? performance.join(" · ") : "No recent price data";

  const funding =
    asset.funding === null
      ? "Unavailable"
      : asset.funding > 0.0003
        ? "Long positioning is elevated"
        : asset.funding < -0.0002
          ? "Short positioning is elevated"
          : "Positioning is balanced";
  const openInterest =
    asset.openInterest === null
      ? "Unavailable"
      : formatCompactUsd(asset.openInterest);

  return { funding, openInterest, priceAction };
}

function getMomentumEvidence(asset: ScannerAsset) {
  const coverage = asset.momentumScoreCoverage ?? null;
  const confirmed = asset.momentumScoreConfirmedCoverage ?? null;

  if (asset.momentumScore === null) {
    return "The scanner is waiting for enough fresh market activity before it can judge the strength of the move.";
  }

  if (coverage === 1 && confirmed !== null && confirmed >= 0.8) {
    return "This is a well-supported read: the signal has broad coverage and is mostly backed by completed price action.";
  }

  if (coverage !== null && coverage < 1) {
    return "This is an early read with partial market coverage. Treat the direction as a developing signal rather than a fully established trend.";
  }

  return "The direction is supported by the latest market activity, though some of that activity is still developing in real time.";
}

export function ScannerSidePanelBody({
  asset,
  alerts,
  alertCount,
  isAlertsLoading,
  isAlertsError,
}: {
  asset: ScannerAsset;
  alerts: AlertListItem[];
  alertCount: number;
  isAlertsLoading: boolean;
  isAlertsError: boolean;
}) {
  const score = asset.momentumScore;
  const marketContext = getMarketContext(asset);

  return (
    <div className="scanner-side-panel__body px-4 py-5">
      <div className="scanner-side-panel__setup mb-5 rounded-[10px] border border-white/8 px-3 py-3">
        <div className="mb-2 flex items-center justify-between text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
          <span>Momentum read</span>
          <span className={getMomentumToneClass(score)}>
            {formatScore(score)}
          </span>
        </div>
        <p className="text-[0.78rem] leading-5 text-white/62">
          {getMomentumSummary(asset)}
        </p>
        <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3 font-[var(--font-mono)] text-[0.65rem]">
          <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 uppercase tracking-[0.12em] text-white/35">
              Price action
            </span>
            <span className="text-right tabular-nums text-white/70">
              {marketContext.priceAction}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 uppercase tracking-[0.12em] text-white/35">
              Funding
            </span>
            <span className="text-right text-white/70">
              {marketContext.funding}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 uppercase tracking-[0.12em] text-white/35">
              Open interest
            </span>
            <span className="text-right tabular-nums text-white/70">
              {marketContext.openInterest}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        <StatCard
          label="Momentum score"
          value={formatScore(score)}
          tone={getMomentumTone(score)}
        />
        <StatCard
          label="Direction"
          value={getMomentumDirection(score)}
          tone={getMomentumTone(score)}
        />
        <StatCard
          label="15m change"
          value={formatSigned(asset.change15m)}
          tone={getMomentumTone(asset.change15m)}
        />
        <StatCard
          label="1h change"
          value={formatSigned(asset.change1h)}
          tone={getMomentumTone(asset.change1h)}
        />
        <StatCard
          label="Funding"
          value={formatFundingRate(asset.funding)}
          tone="neutral"
        />
        <StatCard
          label="Open interest"
          value={formatCompactUsd(asset.openInterest)}
          tone="positive"
        />
      </div>

      <DetailBlock
        label="Momentum evidence"
        body={getMomentumEvidence(asset)}
        icon={<Activity className="h-4 w-4" />}
      />
      <DetailBlock
        label="Market context"
        body={`24h volume is ${formatCompactUsd(asset.volume)}, open interest is ${formatCompactUsd(asset.openInterest)}, and funding is ${formatFundingRate(asset.funding)}.`}
        icon={<Star className="h-4 w-4" />}
      />
      <DetailBlock
        label="BTC-relative behavior"
        body={asset.btcRelativeBehavior}
        icon={<Volume2 className="h-4 w-4" />}
      />

      <RecentAlertsList
        alerts={alerts}
        alertCount={alertCount}
        isLoading={isAlertsLoading}
        isError={isAlertsError}
        symbol={asset.symbol.replace(/usdt$/i, "")}
      />

      <div className="scanner-side-panel__hours mb-5 rounded-[20px] border border-white/8 p-4">
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
  );
}
