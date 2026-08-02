import { type Ref, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertsChartWrapper } from "@/features/alerts-explorer/AlertChartWrapper";
import {
  type AlertListItem,
  type AlertSortBy,
  type AlertTimeframe,
  MOMENTUM_INTELLIGENCE_STRATEGY_IDS,
  type SortOrder,
  useGetAlertsPage,
  useGetAlertTypes,
} from "@/features/alerts-explorer/hooks/alerts.api";

const PAGE_SIZE = 10;
const VOICE_ALERTS_STORAGE_KEY = "scanner-v2-voice-alerts-enabled";
const VOICE_ALERT_COOLDOWN_MS = 2_500;
const ALL_STRATEGIES = "all";
const ALL_EVENT_TYPES = "";

const SPOKEN_TIMEFRAMES: Record<AlertTimeframe, string> = {
  "1m": "one minute",
  "5m": "five minutes",
  "15m": "fifteen minutes",
  "30m": "thirty minutes",
  "1h": "one hour",
  "4h": "four hours",
  "1d": "one day",
};

type StrategySelection =
  | typeof ALL_STRATEGIES
  | (typeof MOMENTUM_INTELLIGENCE_STRATEGY_IDS)[number];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(price);

const formatTime = (time: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(time));

function getVoiceAlertMessage(alert: AlertListItem) {
  const symbol = alert.instrument.base_asset_symbol || alert.instrument.instrument_symbol;
  const event = getMomentumEvent(alert);
  const transition = getStateTransition(alert);
  const status = isConfirmed(alert) ? "confirmed" : "forming";

  return [
    `${symbol}: ${event}`,
    `${SPOKEN_TIMEFRAMES[alert.timeframe]} ${alert.direction}`,
    transition,
    status,
  ]
    .filter(Boolean)
    .join(", ");
}

function getMomentumEvent(alert: AlertListItem) {
  const eventType = alert.alert_type ?? alert.trigger_values.event_type;
  if (typeof eventType !== "string") return "state update";

  return (
    {
      entered: "entered",
      exited: "exited",
      severity_changed: "severity changed",
      pullback_entered: "pullback entered",
    }[eventType] ?? eventType.replaceAll("_", " ")
  );
}

function isConfirmed(alert: AlertListItem) {
  const value = alert.trigger_values.is_confirmed;
  return value === 1 || value === "1" || value === true;
}

function getStateTransition(alert: AlertListItem) {
  const from = alert.trigger_values.from_state;
  const to = alert.trigger_values.to_state;
  if (typeof from !== "string" || typeof to !== "string") return undefined;
  return `${from} → ${to}`;
}

function getEventTone(alert: AlertListItem) {
  const event = getMomentumEvent(alert);
  if (event.includes("pullback")) return "blue";
  if (event.includes("exited") || alert.direction.toLowerCase().includes("short")) {
    return "red";
  }
  return "green";
}

function getSetupLabel(alert: AlertListItem) {
  const event = getMomentumEvent(alert);
  if (event.includes("pullback")) return `↘ Pullback · ${alert.timeframe}`;

  return `${alert.direction.toLowerCase().includes("short") ? "↓" : "↑"} ${alert.direction} · ${alert.timeframe}`;
}

function formatAlertTime(time: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(time));
}

const EVENT_TONE_CLASSES = {
  blue: "bg-[#1685dc]/[0.18] text-[#4ca7f8]",
  green: "bg-[#2d9d62]/[0.22] text-[#57d992]",
  red: "bg-[#d65361]/[0.2] text-[#ff7180]",
} as const;

function AlertRow({
  alert,
  selected,
  onSelect,
  buttonRef,
}: {
  alert: AlertListItem;
  selected: boolean;
  onSelect: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onSelect}
      className={`grid w-full min-w-[720px] grid-cols-[86px_92px_minmax(130px,1.15fr)_minmax(150px,1.45fr)_88px_96px] items-center gap-3 border-b border-white/[0.09] px-5 py-4 text-left outline-none transition-colors hover:bg-white/[0.035] ${selected ? "bg-[#5dc887]/[0.065] shadow-[inset_3px_0_0_#5dc887]" : "bg-transparent"}`}
    >
      <span className="font-mono text-[0.93rem] tabular-nums text-white/50">
        {formatAlertTime(alert.triggered_at ?? alert.time)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[1.05rem] font-bold italic text-white/95">
          {alert.instrument.instrument_symbol.replace(/[-_/].*$/, "")}
        </span>
        <span className="block pt-0.5 font-mono text-[0.65rem] tracking-[0.12em] text-white/35">
          {alert.instrument.quote_asset_symbol || "USDT"}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[1.02rem] font-semibold text-white/95">
          {getMomentumEvent(alert)}
        </span>
        <span className="block truncate pt-1 text-[0.76rem] text-white/45">
          {getStateTransition(alert) ??
            `${alert.direction} momentum intelligence signal`}
        </span>
      </span>
      <span className="flex min-w-0 items-center gap-2 text-[0.8rem]">
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1.5 font-semibold ${EVENT_TONE_CLASSES[getEventTone(alert)]}`}
        >
          {getSetupLabel(alert)}
        </span>
        <span className="truncate text-white/35">{isConfirmed(alert) ? "confirmed" : "forming"}</span>
      </span>
      <span className="min-w-0">
        <span className="block text-[0.88rem] font-bold text-white/90">
          {isConfirmed(alert) ? "Confirmed" : "Live"}
        </span>
        <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <span
            className={`block h-full rounded-full ${isConfirmed(alert) ? "w-full bg-[#5dc887]" : "w-2/3 bg-amber-400"}`}
          />
        </span>
      </span>
      <span className="text-right font-mono text-[1rem] tabular-nums text-white/90">
        ${formatPrice(alert.price)}
      </span>
    </button>
  );
}

export function MomentumAlertsPanel() {
  const [strategyId, setStrategyId] =
    useState<StrategySelection>(ALL_STRATEGIES);
  const [direction, setDirection] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [alertType, setAlertType] = useState(ALL_EVENT_TYPES);
  const [sortBy, setSortBy] = useState<AlertSortBy>("triggered_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(
    () => localStorage.getItem(VOICE_ALERTS_STORAGE_KEY) !== "false",
  );
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const knownAlertIdsRef = useRef(new Set<string>());
  const voiceAlertsPrimedRef = useRef(false);
  const lastVoiceAlertAtRef = useRef(0);
  const queryLimit = (page + 1) * PAGE_SIZE;
  const baseQueryParams = {
    limit: queryLimit,
    offset: 0,
    direction: direction || undefined,
    instrumentId: instrumentId || undefined,
    alertType: alertType || undefined,
    sortBy,
    sortOrder,
  };
  const alertTypesQuery = useGetAlertTypes();
  const fiveMinuteQuery = useGetAlertsPage({
    ...baseQueryParams,
    enabled:
      strategyId === ALL_STRATEGIES ||
      strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[0],
    strategyId: MOMENTUM_INTELLIGENCE_STRATEGY_IDS[0],
  });
  const fifteenMinuteQuery = useGetAlertsPage({
    ...baseQueryParams,
    enabled:
      strategyId === ALL_STRATEGIES ||
      strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[1],
    strategyId: MOMENTUM_INTELLIGENCE_STRATEGY_IDS[1],
  });
  const oneHourQuery = useGetAlertsPage({
    ...baseQueryParams,
    enabled:
      strategyId === ALL_STRATEGIES ||
      strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[2],
    strategyId: MOMENTUM_INTELLIGENCE_STRATEGY_IDS[2],
  });
  const activeQueries =
    strategyId === ALL_STRATEGIES
      ? [fiveMinuteQuery, fifteenMinuteQuery, oneHourQuery]
      : strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[0]
        ? [fiveMinuteQuery]
        : strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[1]
          ? [fifteenMinuteQuery]
          : [oneHourQuery];
  const alerts = activeQueries
    .flatMap((query) => query.data?.data ?? [])
    .sort((left, right) => {
      const comparison =
        sortBy === "alert_type"
          ? (left.alert_type ?? "").localeCompare(right.alert_type ?? "")
          : Date.parse(left.triggered_at ?? left.time) -
            Date.parse(right.triggered_at ?? right.time);
      return sortOrder === "asc" ? comparison : -comparison;
    })
    .slice(page * PAGE_SIZE, queryLimit);
  const isLoading = activeQueries.some((query) => query.isLoading);
  const isError = activeQueries.some((query) => query.isError);
  const alertQueryScope = `${strategyId}:${direction}:${instrumentId}:${alertType}:${sortBy}:${sortOrder}:${page}`;
  const totalAlerts = activeQueries.reduce(
    (total, query) => total + (query.data?.meta.total ?? 0),
    0,
  );
  const totalPages = Math.max(1, Math.ceil(totalAlerts / PAGE_SIZE));
  const [selectedAlertId, setSelectedAlertId] = useState<string>();
  const selectedAlert =
    alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];

  useEffect(() => {
    if (selectedAlert && selectedAlert.id !== selectedAlertId)
      setSelectedAlertId(selectedAlert.id);
  }, [selectedAlert, selectedAlertId]);

  useEffect(() => {
    if (!alertQueryScope) return;

    voiceAlertsPrimedRef.current = false;
    knownAlertIdsRef.current.clear();
  }, [alertQueryScope]);

  useEffect(() => {
    if (!voiceAlertsPrimedRef.current) {
      // The panel first renders an empty list while its alert history loads.
      // Establish the baseline only after that request settles, so opening the
      // Alerts view never treats existing history as new live alerts.
      if (isLoading) return;

      alerts.forEach((alert) => {
        knownAlertIdsRef.current.add(alert.id);
      });
      voiceAlertsPrimedRef.current = true;
      return;
    }

    const newAlerts = alerts.filter((alert) => {
      if (knownAlertIdsRef.current.has(alert.id)) return false;
      knownAlertIdsRef.current.add(alert.id);
      return true;
    });
    const alert = newAlerts[0];
    if (
      !voiceAlertsEnabled ||
      !alert ||
      !window.speechSynthesis ||
      Date.now() - lastVoiceAlertAtRef.current < VOICE_ALERT_COOLDOWN_MS
    ) {
      return;
    }

    const now = Date.now();
    console.info("[Voice alerts] Playback requested", {
      alert: {
        id: alert.id,
        symbol: alert.instrument.instrument_symbol,
        direction: alert.direction,
        timeframe: alert.timeframe,
        strategyId: alert.strategy_id,
        alertTime: alert.time,
      },
      message: getVoiceAlertMessage(alert),
      filters: {
        strategyId,
        direction,
        instrumentId,
        alertType,
        sortBy,
        sortOrder,
        page,
      },
      newAlertIds: newAlerts.map((newAlert) => newAlert.id),
      cooldownElapsedMs: now - lastVoiceAlertAtRef.current,
    });

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getVoiceAlertMessage(alert));
    utterance.rate = 1.1;
    utterance.volume = 0.7;
    utterance.onstart = () => {
      console.info("[Voice alerts] Playback started", { alertId: alert.id });
    };
    utterance.onerror = (event) => {
      console.warn("[Voice alerts] Playback failed", {
        alertId: alert.id,
        error: event.error,
      });
    };
    window.speechSynthesis.speak(utterance);
    lastVoiceAlertAtRef.current = now;
  }, [
    alerts,
    direction,
    alertType,
    instrumentId,
    isLoading,
    page,
    sortBy,
    sortOrder,
    strategyId,
    voiceAlertsEnabled,
  ]);

  const handleVoiceAlertsChange = () => {
    setVoiceAlertsEnabled((enabled) => {
      const nextEnabled = !enabled;
      localStorage.setItem(VOICE_ALERTS_STORAGE_KEY, String(nextEnabled));
      if (!nextEnabled) window.speechSynthesis?.cancel();
      return nextEnabled;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const target = event.target as HTMLElement | null;
      if (
        target?.matches('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      const selectedIndex = alerts.findIndex(
        (alert) => alert.id === selectedAlert?.id,
      );
      const nextIndex =
        selectedIndex === -1
          ? event.key === "ArrowDown"
            ? 0
            : alerts.length - 1
          : Math.min(
              Math.max(selectedIndex + (event.key === "ArrowDown" ? 1 : -1), 0),
              alerts.length - 1,
            );
      const nextAlert = alerts[nextIndex];
      if (!nextAlert) return;

      event.preventDefault();
      if (nextAlert.id === selectedAlert?.id) return;

      setSelectedAlertId(nextAlert.id);
      rowRefs.current.get(nextAlert.id)?.scrollIntoView({ block: "nearest" });
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [alerts, selectedAlert?.id]);

  return (
    <section className="grid min-h-[640px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0 border-b border-white/8 xl:border-r xl:border-b-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.09] bg-[#0a0d0c] px-5 py-4 font-mono text-xs">
          <span className="mr-1 text-[0.64rem] uppercase tracking-[0.2em] text-white/40">
            Event
          </span>
          <select
            value={strategyId}
            onChange={(event) => {
              setStrategyId(event.target.value as StrategySelection);
              setPage(0);
            }}
            className="h-9 rounded-full border border-white/15 bg-white/[0.025] px-3 text-white/75 outline-none transition-colors hover:border-white/25"
          >
            <option value={ALL_STRATEGIES}>ALL</option>
            {MOMENTUM_INTELLIGENCE_STRATEGY_IDS.map((id) => (
              <option key={id} value={id}>
                {id.replace("momentum-intelligence-", "").replace("-v2", "")}
              </option>
            ))}
          </select>
          <select
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(0);
            }}
            className="h-9 rounded-full border border-white/15 bg-white/[0.025] px-3 text-white/75 outline-none transition-colors hover:border-white/25"
          >
            <option value="">All directions</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <input
            value={instrumentId}
            onChange={(event) => {
              setInstrumentId(event.target.value);
              setPage(0);
            }}
            placeholder="Filter symbol…"
            className="h-9 min-w-36 rounded-full border border-white/15 bg-white/[0.025] px-3 text-white/75 placeholder:text-white/30 outline-none transition-colors hover:border-white/25 focus:border-[#5dc887]/60"
          />
          <select
            value={alertType}
            onChange={(event) => {
              setAlertType(event.target.value);
              setPage(0);
            }}
            className="h-9 rounded-full border border-white/15 bg-white/[0.025] px-3 text-white/75 outline-none transition-colors hover:border-white/25"
          >
            <option value={ALL_EVENT_TYPES}>All event types</option>
            {(alertTypesQuery.data ?? []).map(({ alert_type, total }) => (
              <option key={alert_type} value={alert_type}>
                {alert_type.replaceAll("_", " ")} ({total})
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as AlertSortBy);
              setPage(0);
            }}
            className="h-9 rounded-full border border-white/15 bg-white/[0.025] px-3 text-white/75 outline-none transition-colors hover:border-white/25"
          >
            <option value="triggered_at">Sort: triggered</option>
            <option value="alert_type">Sort: event type</option>
          </select>
          <select
            aria-label="Sort order"
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value as SortOrder);
              setPage(0);
            }}
            className="h-9 rounded-full border border-white/15 bg-white/[0.025] px-3 text-white/75 outline-none transition-colors hover:border-white/25"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <button
            type="button"
            aria-pressed={voiceAlertsEnabled}
            onClick={handleVoiceAlertsChange}
            className={`h-9 rounded-full border px-3 text-[0.65rem] uppercase tracking-[0.08em] transition-colors ${
              voiceAlertsEnabled
                ? "border-[#5dc887]/40 bg-[#5dc887]/10 text-[#5dc887]"
                : "border-white/10 text-white/45 hover:border-white/20 hover:text-white/70"
            }`}
          >
            Voice {voiceAlertsEnabled ? "on" : "off"}
          </button>
          <span className="ml-auto flex items-center gap-2 whitespace-nowrap text-[0.72rem] text-[#5dc887]">
            <span className="h-2 w-2 rounded-full bg-[#5dc887] shadow-[0_0_10px_#5dc887]" />
            Streaming
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-[86px_92px_minmax(130px,1.15fr)_minmax(150px,1.45fr)_88px_96px] gap-3 border-b border-white/[0.1] bg-[#0c0f0e] px-5 py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/40">
            <span>Time</span>
            <span>Symbol</span>
            <span>Event</span>
            <span>Setup</span>
            <span>State</span>
            <span className="text-right">Price</span>
          </div>
        {isLoading && (
          <p className="p-6 text-center font-mono text-xs text-white/40">
            Loading alert history…
          </p>
        )}
        {isError && (
          <p className="p-6 text-center font-mono text-xs text-[#e35561]">
            Alerts unavailable.
          </p>
        )}
        {!isLoading && !isError && alerts.length === 0 && (
          <p className="p-6 text-center font-mono text-xs text-white/40">
            No Momentum Intelligence alerts match these filters.
          </p>
        )}
        {alerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            selected={selectedAlert?.id === alert.id}
            onSelect={() => setSelectedAlertId(alert.id)}
            buttonRef={(element) => {
              if (element) rowRefs.current.set(alert.id, element);
              else rowRefs.current.delete(alert.id);
            }}
          />
        ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/8 px-4 py-3 font-mono text-xs text-white/45">
          <span>
            {totalAlerts > 0
              ? `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalAlerts)} of ${totalAlerts}`
              : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              className="rounded border border-white/10 px-2 py-1 disabled:opacity-30"
            >
              Previous
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              disabled={page >= totalPages - 1}
              className="rounded border border-white/10 px-2 py-1 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <aside className="min-w-0 bg-[#0a0a0a]">
        {selectedAlert ? (
          <div className="flex h-full min-h-[640px] flex-col">
            <div className="border-b border-white/8 p-4 font-mono">
              <p className="text-[0.62rem] uppercase tracking-[0.12em] text-white/35">
                Momentum Intelligence update
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-semibold text-white/90">
                  {selectedAlert.instrument.instrument_symbol}
                </h2>
                <span className="text-xs text-white/55">
                  {formatTime(selectedAlert.triggered_at ?? selectedAlert.time)}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">
                {selectedAlert.direction} · {selectedAlert.timeframe} ·{" "}
                {getMomentumEvent(selectedAlert)} ·{" "}
                {isConfirmed(selectedAlert) ? "closed candle" : "provisional"} ·
                {getStateTransition(selectedAlert)
                  ? ` ${getStateTransition(selectedAlert)} ·`
                  : ""}{" "}
                ${formatPrice(selectedAlert.price)}
              </p>
            </div>
            <div className="h-72 border-b border-white/8">
              <AlertsChartWrapper
                alertId={selectedAlert.id}
                alertTime={selectedAlert.time}
                alertPrice={selectedAlert.price}
                expectedInstrumentId={selectedAlert.instrument.instrument_id}
                timeframe={selectedAlert.timeframe as AlertTimeframe}
                showLegend={false}
              />
            </div>
            <Accordion type="multiple" className="px-4 font-mono text-xs">
              <AccordionItem value="trigger">
                <AccordionTrigger>Why this triggered</AccordionTrigger>
                <AccordionContent>
                  <pre className="max-h-44 overflow-auto whitespace-pre-wrap text-[0.68rem] text-white/60">
                    {JSON.stringify(selectedAlert.trigger_values, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="thresholds">
                <AccordionTrigger>Strategy context</AccordionTrigger>
                <AccordionContent>
                  <pre className="max-h-44 overflow-auto whitespace-pre-wrap text-[0.68rem] text-white/60">
                    {JSON.stringify(selectedAlert.thresholds, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <p className="p-6 font-mono text-xs text-white/40">
            Select an alert to inspect its chart context.
          </p>
        )}
      </aside>
    </section>
  );
}
