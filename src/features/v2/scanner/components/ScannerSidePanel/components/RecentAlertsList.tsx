import { Badge } from "@/components/ui/badge";
import type { ScannerAsset } from "../../../types";
import { panelChipClassName } from "../constants";

type RecentAlertsListProps = {
  alerts: ScannerAsset["recentAlerts"];
  alertCount: number;
};

export function RecentAlertsList({
  alerts,
  alertCount,
}: RecentAlertsListProps) {
  return (
    <div className="scanner-side-panel__alerts my-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/46">
          Recent alerts
        </p>
        <Badge
          className={`${panelChipClassName} border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.72_0.18_248)]`}
        >
          {alertCount}
        </Badge>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={`${alert.label}-${alert.time}`}
            className="scanner-side-panel__alert flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`${panelChipClassName} border-transparent bg-transparent text-white/55`}
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
    </div>
  );
}
