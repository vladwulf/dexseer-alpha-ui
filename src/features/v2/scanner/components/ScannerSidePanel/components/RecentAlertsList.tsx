import { Badge } from "@/components/ui/badge";
import type { AlertListItem } from "@/features/alerts-explorer/hooks/alerts.api";
import { getMomentumAlertLabel } from "../../../lib/momentumLabels";
import { panelChipClassName } from "../constants";

type RecentAlertsListProps = {
  alerts: AlertListItem[];
  alertCount: number;
  isLoading: boolean;
  isError: boolean;
  symbol: string;
};

function formatAlertTime(alert: AlertListItem) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(alert.triggered_at ?? alert.time));
}

function setupLabel(alert: AlertListItem) {
  const event = getMomentumAlertLabel(alert).toLowerCase();
  if (event.includes("pullback")) return `↘ Pullback · ${alert.timeframe}`;
  if (alert.direction.toLowerCase() === "short")
    return `↓ Short · ${alert.timeframe}`;
  if (alert.direction.toLowerCase() === "long")
    return `↑ Long · ${alert.timeframe}`;
  return `• Signal · ${alert.timeframe}`;
}

function eventTone(alert: AlertListItem) {
  const event = getMomentumAlertLabel(alert).toLowerCase();
  if (event.includes("pullback")) return "blue";
  if (
    event.includes("exited") ||
    alert.direction.toLowerCase().includes("short")
  )
    return "red";
  return "green";
}

const EVENT_TONE_CLASSES = {
  blue: {
    dot: "bg-[#4ca7f8]",
    badge: "border-[#1685dc]/30 bg-[#1685dc]/[0.18] text-[#4ca7f8]",
  },
  green: {
    dot: "bg-[#57d992]",
    badge: "border-[#2d9d62]/30 bg-[#2d9d62]/[0.22] text-[#57d992]",
  },
  red: {
    dot: "bg-[#ff7180]",
    badge: "border-[#d65361]/30 bg-[#d65361]/[0.2] text-[#ff7180]",
  },
} as const;

export function RecentAlertsList({
  alerts,
  alertCount,
  isError,
  isLoading,
  symbol,
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
      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <p className="py-3 text-center font-mono text-xs text-white/40">
            Loading alert history…
          </p>
        )}
        {isError && (
          <p className="py-3 text-center font-mono text-xs text-[#e35561]">
            Alerts unavailable.
          </p>
        )}
        {!isLoading && !isError && alerts.length === 0 && (
          <p className="py-3 text-center font-mono text-xs text-white/40">
            No alerts for {symbol} yet.
          </p>
        )}
        {alerts.map((alert) => {
          const tone = EVENT_TONE_CLASSES[eventTone(alert)];
          return (
            <div
              key={alert.id}
              className="scanner-side-panel__alert flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2"
            >
              <div className="min-w-0 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`}
                />
                <Badge
                  variant="outline"
                  className={`${panelChipClassName} shrink-0 ${tone.badge}`}
                >
                  {setupLabel(alert)}
                </Badge>
                <span className="min-w-0 truncate text-[0.78rem] text-white/66">
                  {getMomentumAlertLabel(alert)}
                </span>
              </div>
              <span className="font-[var(--font-mono)] text-[0.72rem] text-white/38">
                {formatAlertTime(alert)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
