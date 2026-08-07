import { BellPlus, BookmarkPlus, Clock3, Star, Volume2 } from "lucide-react";
import {
  formatCompactUsd,
  formatFundingRate,
  numberFormat,
} from "../../../lib/formatters";
import type { ScannerAsset, ScannerTimeframe } from "../../../types";
import { ActionButton } from "../../ActionButton";
import { DetailBlock } from "../../DetailBlock";
import { SessionBars } from "../../SessionBars";
import { StatCard } from "../../StatCard";
import { RecentAlertsList } from "./RecentAlertsList";

export function ScannerSidePanelBody({
  asset,
  timeframe,
}: {
  asset: ScannerAsset;
  timeframe: ScannerTimeframe;
}) {
  return (
    <div className="scanner-side-panel__body px-4 py-5">
      <div className="scanner-side-panel__setup mb-5 rounded-[10px] border border-white/8 px-3 py-3">
        <div className="mb-2 flex items-center justify-between text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/40">
          <span>Active setup · {timeframe}</span>
          <span>{asset.setupScore} / 100</span>
        </div>
        <p className="text-[0.78rem] leading-5 text-white/62">
          {asset.activeSetupSummary}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        <StatCard
          label="Volume 24h"
          value={formatCompactUsd(asset.volume)}
          tone="neutral"
        />
        <StatCard
          label="Open interest"
          value={formatCompactUsd(asset.openInterest)}
          tone="positive"
        />
        <StatCard
          label="Funding"
          value={formatFundingRate(asset.funding)}
          tone="neutral"
        />
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
          label="Why it ranked"
          value={`${asset.setupScore} pts`}
          tone="accent"
        />
      </div>

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

      <RecentAlertsList
        alerts={asset.recentAlerts}
        alertCount={asset.alertCount}
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionButton icon={<BellPlus className="h-4 w-4" />} variant="primary">
          Set alert
        </ActionButton>
        <ActionButton
          icon={<BookmarkPlus className="h-4 w-4" />}
          variant="secondary"
        >
          Add to watchlist
        </ActionButton>
        <ActionButton
          icon={<Volume2 className="h-4 w-4" />}
          variant="secondary"
        >
          Mute symbol
        </ActionButton>
        <ActionButton icon={<Star className="h-4 w-4" />} variant="secondary">
          Open full analysis
        </ActionButton>
      </div>
    </div>
  );
}
