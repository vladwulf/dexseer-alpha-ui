import { useMemo, useState } from "react";
import {
  type AlertListItem,
  useGetAlertsPage,
} from "@/features/alerts-explorer/hooks/alerts.api";
import { formatCompactUsd, formatSigned } from "../../lib/formatters";
import { getMomentumAlertLabel } from "../../lib/momentumLabels";
import type { ScannerAsset } from "../../types";

type DockTab = "alerts" | "signals" | "activity" | "context";
type Scope = "all" | "selected";

const tabs: { id: DockTab; label: string }[] = [
  { id: "alerts", label: "Alerts" },
  { id: "signals", label: "Signals" },
  { id: "activity", label: "Activity" },
  { id: "context", label: "Setup context" },
];

function alertTime(alert: AlertListItem) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(alert.triggered_at ?? alert.time));
}

function alertLabel(alert: AlertListItem) {
  return getMomentumAlertLabel(alert);
}

function setupLabel(alert: AlertListItem) {
  const event = alertLabel(alert).toLowerCase();
  if (event.includes("pullback")) return `↘ Pullback · ${alert.timeframe}`;
  if (alert.direction.toLowerCase() === "short")
    return `↓ Short · ${alert.timeframe}`;
  if (alert.direction.toLowerCase() === "long")
    return `↑ Long · ${alert.timeframe}`;
  return `• Signal · ${alert.timeframe}`;
}

function eventContext(alert: AlertListItem) {
  return alert.strategy_id
    .replace("momentum-intelligence-", "")
    .replace("-v2", "");
}

export function TerminalBottomDock({
  asset,
  onSelectSymbol,
  standalone = false,
}: {
  asset?: ScannerAsset;
  onSelectSymbol: (symbol: string) => void;
  standalone?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<DockTab>("alerts");
  const [scope, setScope] = useState<Scope>("all");
  const [direction, setDirection] = useState("all");
  const [timeframe, setTimeframe] = useState("all");
  const alertsQuery = useGetAlertsPage({
    limit: 30,
    refetchInterval: 5_000,
    sortBy: "triggered_at",
    sortOrder: "desc",
  });
  const alerts = useMemo(
    () =>
      (alertsQuery.data?.data ?? []).filter((alert) => {
        const matchesAsset =
          scope === "all" ||
          (asset &&
            alert.instrument.instrument_symbol.toUpperCase() ===
              asset.symbol.toUpperCase());
        const matchesDirection =
          direction === "all" || alert.direction.toLowerCase() === direction;
        const matchesTimeframe =
          timeframe === "all" || alert.timeframe === timeframe;
        return matchesAsset && matchesDirection && matchesTimeframe;
      }),
    [alertsQuery.data, asset, direction, scope, timeframe],
  );

  return (
    <div
      className={`terminal-bottom-dock${standalone ? " terminal-bottom-dock--standalone" : ""}`}
    >
      {!standalone ? (
        <div
          className="terminal-dock-tabs"
          role="tablist"
          aria-label="Asset context"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "alerts" && alerts.length ? ` ${alerts.length}` : ""}
            </button>
          ))}
        </div>
      ) : null}
      <div className="terminal-dock-content">
        {activeTab === "alerts" ? (
          <>
            <div className="terminal-alert-filters">
              <button
                type="button"
                aria-pressed={scope === "all"}
                onClick={() => setScope("all")}
              >
                All
              </button>
              <button
                type="button"
                disabled={!asset}
                aria-pressed={scope === "selected"}
                onClick={() => setScope("selected")}
              >
                Selected asset
              </button>
              <select
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
                aria-label="Alert direction"
              >
                <option value="all">All sides</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
              <select
                value={timeframe}
                onChange={(event) => setTimeframe(event.target.value)}
                aria-label="Alert timeframe"
              >
                <option value="all">All timeframes</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
              </select>
              <span>{alertsQuery.isFetching ? "Updating…" : "Live"}</span>
            </div>
            <div className="terminal-alert-table">
              <div className="terminal-alert-row terminal-alert-row--header">
                <span>Time</span>
                <span>Symbol</span>
                <span>Event</span>
                <span>Setup</span>
                <span>Price</span>
              </div>
              {alertsQuery.isLoading ? (
                <p className="terminal-alert-empty">Loading alerts…</p>
              ) : null}
              {!alertsQuery.isLoading && alerts.length === 0 ? (
                <p className="terminal-alert-empty">
                  No alerts match these filters.
                </p>
              ) : null}
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  className="terminal-alert-row"
                  onClick={() =>
                    onSelectSymbol(alert.instrument.instrument_symbol)
                  }
                >
                  <span>{alertTime(alert)}</span>
                  <span className="terminal-alert-symbol">
                    <strong>{alert.instrument.instrument_symbol}</strong>
                    <small>
                      {alert.instrument.quote_asset_symbol || "USDT"}
                    </small>
                  </span>
                  <span className="terminal-alert-event">
                    <strong>{alertLabel(alert)}</strong>
                    <small>{eventContext(alert)}</small>
                  </span>
                  <span
                    className={`terminal-alert-setup ${alert.direction.toLowerCase() === "short" ? "terminal-alert-setup--short" : ""}`}
                  >
                    <strong>{setupLabel(alert)}</strong>
                    <small>
                      {alert.strategy_id.replace("momentum-intelligence-", "")}
                    </small>
                  </span>
                  <span>${alert.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        {asset && activeTab === "signals" ? (
          asset.recentAlerts.length ? (
            asset.recentAlerts.map((alert) => (
              <div
                className="terminal-dock-row"
                key={`${alert.time}-${alert.label}`}
              >
                <span>{alert.timeframe}</span>
                <strong>{alert.label}</strong>
                <span>{alert.time}</span>
              </div>
            ))
          ) : (
            <span>No recent signals for {asset.symbol}.</span>
          )
        ) : null}
        {asset && activeTab === "activity" ? (
          <span>
            {asset.alertCount} tracked alerts · {formatCompactUsd(asset.volume)} 24h volume ·{" "}
            {formatSigned(asset.change24h)} today
          </span>
        ) : null}
        {asset && activeTab === "context" ? (
          <div className="terminal-dock-context">
            <strong>{asset.setupLabel}</strong>
            <span>{asset.activeSetupSummary}</span>
            <span>{asset.rankingReason}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
