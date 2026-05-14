import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertsChartWrapper } from "./AlertChartWrapper";
import {
  type AlertTimeframe,
  type AlertType,
  useGetAlertsPaginated,
} from "./hooks/alerts.api";

const TIMEFRAMES: AlertTimeframe[] = [
  "1s",
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
];

const ALERT_TYPES: Array<AlertType | "all"> = [
  "all",
  "15minHighBreak",
  "15minLowBreak",
];

const PAGE_SIZE = 50;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(price);

const formatType = (type: string) =>
  type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

const formatDateTime = (value: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function AlertsPannel() {
  const [timeframe, setTimeframe] = useState<AlertTimeframe>("15m");
  const [alertType, setAlertType] = useState<AlertType | "all">("all");
  const [assetIdInput, setAssetIdInput] = useState("");

  const assetId = useMemo(() => {
    const trimmed = assetIdInput.trim();
    if (!trimmed) return undefined;
    const numericValue = Number(trimmed);
    return Number.isInteger(numericValue) && numericValue > 0
      ? numericValue
      : undefined;
  }, [assetIdInput]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useGetAlertsPaginated({
      timeframe,
      limit: PAGE_SIZE,
      type: alertType === "all" ? undefined : alertType,
      assetId,
    });

  const alerts = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="mt-8 mx-auto max-w-6xl min-w-0 space-y-5 overflow-x-hidden pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "oklch(0.45 0 0)",
            }}
          >
            Signal Feed
          </p>
          <h1
            className="mt-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "oklch(0.96 0 0)",
              lineHeight: 1.1,
            }}
          >
            Alerts
          </h1>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-wrap gap-1.5">
            {TIMEFRAMES.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={timeframe === item ? "default" : "outline"}
                onClick={() => setTimeframe(item)}
                className="h-8 rounded px-3 font-mono text-[0.7rem]"
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALERT_TYPES.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={alertType === item ? "default" : "outline"}
                onClick={() => setAlertType(item)}
                className="h-8 rounded px-3 font-mono text-[0.7rem]"
              >
                {item === "all" ? "All Types" : formatType(item)}
              </Button>
            ))}
          </div>

          <Input
            inputMode="numeric"
            value={assetIdInput}
            onChange={(event) => setAssetIdInput(event.target.value)}
            placeholder="Asset ID"
            className="h-8 w-full rounded font-mono text-xs xl:w-28"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "oklch(1 0 0 / 6%)" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.08em",
            color: "oklch(0.38 0 0)",
          }}
        >
          {alerts.length} / {total} signals
        </span>
      </div>

      {isLoading && (
        <div
          className="rounded p-8 text-center"
          style={{
            background: "#0a0a0a",
            border: "1px solid oklch(1 0 0 / 7%)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "oklch(0.45 0 0)",
          }}
        >
          Loading alerts...
        </div>
      )}

      {isError && (
        <div
          className="rounded p-8 text-center"
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(227, 85, 97, 0.25)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "#e35561",
          }}
        >
          Alerts unavailable
        </div>
      )}

      {!isLoading && !isError && alerts.length === 0 && (
        <div
          className="rounded p-8 text-center"
          style={{
            background: "#0a0a0a",
            border: "1px solid oklch(1 0 0 / 7%)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "oklch(0.45 0 0)",
          }}
        >
          No alerts match these filters
        </div>
      )}

      {alerts.map((alert) => {
        const symbol = alert.asset?.symbol ?? `Asset ${alert.asset_id}`;

        return (
          <div
            key={alert.id}
            className="w-full overflow-hidden transition-all duration-200"
            style={{
              background: "#0a0a0a",
              border: "1px solid oklch(1 0 0 / 7%)",
              borderRadius: "8px",
              borderLeft: "3px solid oklch(0.72 0.18 248 / 60%)",
            }}
          >
            <div className="p-5 pb-4">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "oklch(0.45 0 0)",
                      marginBottom: "3px",
                    }}
                  >
                    Symbol
                  </p>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      color: "oklch(0.96 0 0)",
                      lineHeight: 1.1,
                    }}
                  >
                    {symbol}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      color: "oklch(0.72 0 0)",
                      marginTop: "3px",
                    }}
                  >
                    ${formatPrice(alert.price)}
                  </p>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "oklch(0.72 0.18 248)",
                    background: "oklch(0.72 0.18 248 / 10%)",
                    border: "1px solid oklch(0.72 0.18 248 / 25%)",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatType(alert.type)}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Alert ID", value: alert.id },
                  { label: "Asset ID", value: String(alert.asset_id) },
                  { label: "Timeframe", value: alert.timeframe },
                  { label: "Time", value: formatDateTime(alert.time) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded px-3 py-2"
                    style={{
                      background: "#0d0d0d",
                      border: "1px solid oklch(1 0 0 / 5%)",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.57rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "oklch(0.4 0 0)",
                        marginBottom: "3px",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="truncate"
                      title={value}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "oklch(0.75 0 0)",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="h-[320px] w-full min-w-0 overflow-hidden"
              style={{ borderTop: "1px solid oklch(1 0 0 / 5%)" }}
            >
              <AlertsChartWrapper
                alertTime={alert.time}
                alertId={alert.id}
                timeframe={timeframe}
              />
            </div>
          </div>
        );
      })}

      <div ref={loadMoreRef} className="h-6 w-full" />
      {isFetchingNextPage && (
        <p
          className="pb-2 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "oklch(0.45 0 0)",
          }}
        >
          Loading more signals...
        </p>
      )}
      {!hasNextPage && alerts.length > 0 && (
        <p
          className="pb-2 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: "oklch(0.35 0 0)",
          }}
        >
          End of signal feed
        </p>
      )}
    </div>
  );
}
