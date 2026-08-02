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
  type AlertTimeframe,
  MOMENTUM_INTELLIGENCE_STRATEGY_IDS,
  useGetAlertsPage,
} from "@/features/alerts-explorer/hooks/alerts.api";

const PAGE_SIZE = 10;
const ALERTS_REFETCH_INTERVAL_MS = 30_000;
const VOICE_ALERTS_STORAGE_KEY = "scanner-v2-voice-alerts-enabled";
const VOICE_ALERT_COOLDOWN_MS = 2_500;
const ALL_STRATEGIES = "all";

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
  const symbol = alert.instrument.instrument_symbol.split("").join(" ");
  const direction = alert.direction.toLowerCase().includes("short")
    ? "trending short"
    : "trending long";

  return `${symbol} is ${direction}`;
}

function getMomentumEvent(alert: AlertListItem) {
  const eventType = alert.trigger_values.event_type;
  return typeof eventType === "string"
    ? eventType.replaceAll("_", " ")
    : "state update";
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
      className={`grid w-full grid-cols-[minmax(110px,1fr)_72px_80px_110px_90px_100px] gap-3 border-b border-white/7 px-4 py-3 text-left font-mono text-xs outline-none transition-colors hover:bg-white/[0.035] ${selected ? "bg-[#5dc887]/[0.09]" : "bg-transparent"}`}
    >
      <span className="min-w-0">
        <span className="block truncate font-semibold text-white/90">
          {alert.instrument.instrument_symbol}
        </span>
        <span className="block truncate pt-1 text-[0.62rem] text-white/35">
          {alert.strategy_id}
        </span>
      </span>
      <span
        className={
          alert.direction.toLowerCase().includes("short")
            ? "text-[#e35561]"
            : "text-[#5dc887]"
        }
      >
        {alert.direction}
      </span>
      <span className="text-white/60">{alert.timeframe}</span>
      <span
        className={isConfirmed(alert) ? "text-[#5dc887]" : "text-amber-300"}
      >
        {getMomentumEvent(alert)} · {isConfirmed(alert) ? "closed" : "live"}
        {getStateTransition(alert) ? ` · ${getStateTransition(alert)}` : ""}
      </span>
      <span className="text-white/55">
        {formatTime(alert.triggered_at ?? alert.time)}
      </span>
      <span className="text-right text-white/75">
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
    refetchInterval: ALERTS_REFETCH_INTERVAL_MS,
    direction: direction || undefined,
    instrumentId: instrumentId || undefined,
  };
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
    enabled: strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[2],
    strategyId: MOMENTUM_INTELLIGENCE_STRATEGY_IDS[2],
  });
  const activeQueries =
    strategyId === ALL_STRATEGIES
      ? [fiveMinuteQuery, fifteenMinuteQuery]
      : strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[0]
        ? [fiveMinuteQuery]
        : strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[1]
          ? [fifteenMinuteQuery]
          : [oneHourQuery];
  const alerts = activeQueries
    .flatMap((query) => query.data?.data ?? [])
    .sort(
      (left, right) =>
        Date.parse(right.triggered_at ?? right.time) -
        Date.parse(left.triggered_at ?? left.time),
    )
    .slice(page * PAGE_SIZE, queryLimit);
  const isLoading = activeQueries.some((query) => query.isLoading);
  const isError = activeQueries.some((query) => query.isError);
  const alertQueryScope = `${strategyId}:${direction}:${instrumentId}:${page}`;
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
      filters: { strategyId, direction, instrumentId, page },
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
    instrumentId,
    isLoading,
    page,
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
        <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-4 py-3 font-mono text-xs">
          <select
            value={strategyId}
            onChange={(event) => {
              setStrategyId(event.target.value as StrategySelection);
              setPage(0);
            }}
            className="h-8 rounded border border-white/10 bg-[#101010] px-2 text-white/75"
          >
            <option value={ALL_STRATEGIES}>ALL</option>
            {MOMENTUM_INTELLIGENCE_STRATEGY_IDS.map((id) => (
              <option key={id} value={id}>
                {id.replace("momentum-surge-", "").replace("-v1", "")}
              </option>
            ))}
          </select>
          <select
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(0);
            }}
            className="h-8 rounded border border-white/10 bg-[#101010] px-2 text-white/75"
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
            placeholder="Instrument ID"
            className="h-8 min-w-36 rounded border border-white/10 bg-[#101010] px-2 text-white/75 placeholder:text-white/30"
          />
          <button
            type="button"
            aria-pressed={voiceAlertsEnabled}
            onClick={handleVoiceAlertsChange}
            className={`h-8 rounded border px-2 text-[0.65rem] uppercase tracking-[0.08em] transition-colors ${
              voiceAlertsEnabled
                ? "border-[#5dc887]/40 bg-[#5dc887]/10 text-[#5dc887]"
                : "border-white/10 text-white/45 hover:border-white/20 hover:text-white/70"
            }`}
          >
            Voice {voiceAlertsEnabled ? "on" : "off"}
          </button>
          <span className="ml-auto text-[0.62rem] uppercase tracking-[0.1em] text-white/35">
            State-transition alerts
          </span>
        </div>
        <div className="grid grid-cols-[minmax(110px,1fr)_72px_80px_110px_90px_100px] gap-3 border-b border-white/8 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/35">
          <span>Instrument / strategy</span>
          <span>Direction</span>
          <span>Timeframe</span>
          <span>Event / status</span>
          <span>Triggered</span>
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
