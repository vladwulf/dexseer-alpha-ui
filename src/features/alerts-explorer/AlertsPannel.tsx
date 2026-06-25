import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { AlertChartActiveCandle } from "../chart/AlertChart";
import { AlertsChartWrapper } from "./AlertChartWrapper";
import { type AlertTimeframe, useGetAlertsPaginated } from "./hooks/alerts.api";

const TIMEFRAMES: AlertTimeframe[] = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
];

const PAGE_SIZE = 50;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(price);

const formatType = (type: string) => type.replace(/_/g, " ");

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

const formatChartNumber = (value: number | null | undefined, digits = 2) => {
  if (value == null) return "-";
  return value.toFixed(digits);
};

const formatVolume = (value: number) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

const formatBool = (value: boolean | null | undefined) => {
  if (value == null) return "-";
  return value ? "Y" : "N";
};

export function AlertsPannel() {
  const [timeframe, setTimeframe] = useState<AlertTimeframe>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem("alertTimeframe") as AlertTimeframe)
        : null) ?? "15m",
  );
  useEffect(() => {
    localStorage.setItem("alertTimeframe", timeframe);
  }, [timeframe]);
  const [typeInput, setTypeInput] = useState("");
  const [instrumentIdInput, setInstrumentIdInput] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetAlertsPaginated({
    timeframe,
    limit: PAGE_SIZE,
    type: typeInput.trim() || undefined,
    instrumentId: instrumentIdInput.trim() || undefined,
  });

  const alerts = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV || alerts.length === 0) return;

    const countsById = new Map<string, number>();
    for (const alert of alerts) {
      countsById.set(alert.id, (countsById.get(alert.id) ?? 0) + 1);
    }

    const duplicateIds = Array.from(countsById.entries()).filter(
      ([, count]) => count > 1,
    );

    if (duplicateIds.length > 0) {
      console.warn("Alerts explorer received duplicate alert ids", {
        duplicateIds,
        totalAlerts: alerts.length,
      });
    }
  }, [alerts]);

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
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "oklch(0.45 0 0)",
              }}
            >
              Timeframe
            </span>
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

          <Input
            value={typeInput}
            onChange={(event) => setTypeInput(event.target.value)}
            placeholder="Type"
            className="h-8 w-full rounded font-mono text-xs xl:w-32"
          />

          <Input
            value={instrumentIdInput}
            onChange={(event) => setInstrumentIdInput(event.target.value)}
            placeholder="Instrument ID"
            className="h-8 w-full rounded font-mono text-xs xl:w-56"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="h-px flex-1"
          style={{ background: "oklch(1 0 0 / 6%)" }}
        />
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
        const symbol = alert.instrument.instrument_symbol;

        return (
          <div
            key={[
              alert.id,
              alert.instrument.instrument_id,
              alert.time,
              alert.type,
            ].join(":")}
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
                  <p
                    className="truncate"
                    title={alert.instrument.instrument_id}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      color: "oklch(0.52 0 0)",
                      marginTop: "6px",
                    }}
                  >
                    {alert.instrument.instrument_id}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        height: 32,
                        padding: "0 10px",
                        borderRadius: 4,
                        border: "1px solid oklch(0.72 0.18 248 / 25%)",
                        background: "oklch(0.72 0.18 248 / 10%)",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        color: "oklch(0.72 0.18 248)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatType(alert.type)}
                      <ChevronDown size={10} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Alert Details
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="space-y-2 px-2 py-1 font-mono text-xs">
                      <p>Strategy: {alert.strategy_id}</p>
                      <p>Direction: {alert.direction}</p>
                      <p>Version: {alert.strategy_version}</p>
                      <p>Venue: {alert.instrument.venue}</p>
                      <p>Market: {alert.instrument.market_type}</p>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Alert ID", value: alert.id },
                  {
                    label: "Instrument",
                    value: alert.instrument.instrument_symbol,
                  },
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

            <AlertChartSection
              alertTime={alert.time}
              alertPrice={alert.price}
              alertId={alert.id}
              expectedInstrumentId={alert.instrument.instrument_id}
              timeframe={timeframe}
            />
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

function AlertChartSection({
  alertTime,
  alertPrice,
  alertId,
  expectedInstrumentId,
  timeframe,
}: {
  alertTime: string;
  alertPrice: number;
  alertId: string;
  expectedInstrumentId: string;
  timeframe: AlertTimeframe;
}) {
  const [activeCandle, setActiveCandle] =
    useState<AlertChartActiveCandle | null>(null);

  return (
    <>
      <div
        className="h-[500px] w-full min-w-0 overflow-hidden"
        style={{ borderTop: "1px solid oklch(1 0 0 / 5%)" }}
      >
        <AlertsChartWrapper
          alertTime={alertTime}
          alertPrice={alertPrice}
          alertId={alertId}
          expectedInstrumentId={expectedInstrumentId}
          timeframe={timeframe}
          onActiveCandleChange={setActiveCandle}
          showLegend={false}
        />
      </div>
      <AlertChartFooter activeCandle={activeCandle} alertPrice={alertPrice} />
    </>
  );
}

function AlertChartFooter({
  activeCandle,
  alertPrice,
}: {
  activeCandle: AlertChartActiveCandle | null;
  alertPrice: number;
}) {
  const candle = activeCandle?.candle;
  const metricGroups = candle
    ? [
        {
          label: "Price",
          metrics: [
            { label: "O", value: formatPrice(candle.open) },
            { label: "H", value: formatPrice(candle.high) },
            { label: "L", value: formatPrice(candle.low) },
            { label: "C", value: formatPrice(candle.close) },
          ],
        },
        {
          label: "Volume",
          metrics: [
            { label: "Vol", value: formatVolume(candle.asset_volume) },
            {
              label: "1p",
              value: `${formatChartNumber(candle.rel_vol_1p, 1)}x`,
            },
            {
              label: "16p",
              value: `${formatChartNumber(candle.rel_vol_16p, 1)}x`,
            },
            {
              label: "96p",
              value: `${formatChartNumber(candle.rel_vol_96p, 1)}x`,
            },
          ],
        },
        {
          label: "EMA",
          metrics: [
            { label: "9", value: formatChartNumber(candle.ema9, 4) },
            { label: "20", value: formatChartNumber(candle.ema20, 4) },
            { label: "50", value: formatChartNumber(candle.ema50, 4) },
            { label: "100", value: formatChartNumber(candle.ema100, 4) },
            { label: "200", value: formatChartNumber(candle.ema200, 4) },
          ],
        },
        {
          label: "MACD",
          metrics: [
            { label: "Line", value: formatChartNumber(candle.macd_line, 4) },
            {
              label: "Signal",
              value: formatChartNumber(candle.macd_signal, 4),
            },
            {
              label: "Hist",
              value: formatChartNumber(candle.macd_histogram, 4),
            },
            {
              label: "Slope",
              value: formatChartNumber(candle.macd_signal_slope, 4),
            },
          ],
        },
        {
          label: "Regime",
          metrics: [
            { label: "ATR", value: formatChartNumber(candle.atr14, 4) },
            { label: "ADX", value: formatChartNumber(candle.adx14, 1) },
            {
              label: "Chop",
              value: formatChartNumber(candle.choppiness_index_14, 1),
            },
            { label: "RngZ", value: formatChartNumber(candle.range_z, 2) },
            {
              label: "RVZ",
              value: formatChartNumber(candle.rvol_z_sustained, 2),
            },
            { label: "MvZ", value: formatChartNumber(candle.move_z, 2) },
          ],
        },
        {
          label: "Breakout",
          metrics: [
            {
              label: "16p",
              value: `up:${formatBool(candle.is_16p_breakout)} dn:${formatBool(candle.is_16p_breakdown)}`,
            },
            {
              label: "96p",
              value: `up:${formatBool(candle.is_96p_breakout)} dn:${formatBool(candle.is_96p_breakdown)}`,
            },
          ],
        },
      ]
    : [];

  return (
    <div
      style={{
        borderTop: "1px solid oklch(1 0 0 / 5%)",
        padding: "10px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        color: "oklch(0.72 0.18 248 / 80%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "4px 12px",
          marginBottom: activeCandle ? 8 : 0,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#3b82f6",
            opacity: 0.7,
          }}
        />
        <span>Alert @ ${formatPrice(alertPrice)}</span>
        {activeCandle && (
          <span style={{ color: "oklch(0.65 0 0)" }}>
            Candle {activeCandle.timeDisplay}
          </span>
        )}
      </div>

      {metricGroups.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {metricGroups.map((group) => (
            <div
              key={group.label}
              className="rounded px-2 py-1.5"
              style={{
                background: "oklch(1 0 0 / 2%)",
                border: "1px solid oklch(1 0 0 / 5%)",
              }}
            >
              <div
                style={{
                  marginBottom: 4,
                  color: "oklch(0.45 0 0)",
                  fontSize: "0.56rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {group.label}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
                  gap: "3px 10px",
                  color: "oklch(0.72 0 0)",
                }}
              >
                {group.metrics.map((metric) => (
                  <span key={`${group.label}-${metric.label}`}>
                    <span style={{ color: "oklch(0.5 0 0)" }}>
                      {metric.label}:
                    </span>{" "}
                    {metric.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
