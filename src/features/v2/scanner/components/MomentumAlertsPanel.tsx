import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import { type Ref, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
const VOICE_ALERT_GENDER_STORAGE_KEY = "scanner-v2-voice-alert-gender";
const VOICE_ALERT_COOLDOWN_MS = 2_500;
const ALL_STRATEGIES = "all";

type VoiceGender = "female" | "male";

const FEMALE_VOICE_NAMES =
  /ava|samantha|victoria|karen|moira|tessa|susan|zira|hazel|heather|fiona|serena|siri.*female|google us english/i;
const MALE_VOICE_NAMES =
  /alex|daniel|david|fred|jorge|tom|aaron|arthur|oliver|rishi|lee|siri.*male/i;

type StrategySelection =
  | typeof ALL_STRATEGIES
  | (typeof MOMENTUM_INTELLIGENCE_STRATEGY_IDS)[number];

type FilterOption<T extends string> = { label: string; value: T };

function FilterDropdown<T extends string>({
  ariaLabel,
  value,
  options,
  onValueChange,
}: {
  ariaLabel: string;
  value: T;
  options: FilterOption<T>[];
  onValueChange: (value: T) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={ariaLabel}
          className="h-9 rounded-md border-white/15 bg-white/[0.025] px-3 font-mono text-xs font-normal text-white/75 shadow-none hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
        >
          {selectedOption?.label}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-white/15 bg-[#101312] font-mono text-xs text-white/80"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) => onValueChange(nextValue as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
  const symbol =
    alert.instrument.base_asset_symbol || alert.instrument.instrument_symbol;
  const event = getMomentumEvent(alert);

  return `${symbol}: ${event.replace("pullback", "pull back")}`;
}

function getVoiceForGender(
  voices: SpeechSynthesisVoice[],
  gender: VoiceGender,
) {
  const voiceNamePattern =
    gender === "female" ? FEMALE_VOICE_NAMES : MALE_VOICE_NAMES;
  return voices.find((voice) => voiceNamePattern.test(voice.name));
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
  if (
    event.includes("exited") ||
    alert.direction.toLowerCase().includes("short")
  ) {
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
      className={`grid w-full min-w-[600px] grid-cols-[74px_86px_minmax(120px,1.1fr)_minmax(140px,1.35fr)_88px] items-center gap-2 border-b border-white/[0.08] px-3 py-2.5 text-left outline-none transition-colors hover:bg-white/[0.035] ${selected ? "bg-[#5dc887]/[0.065] shadow-[inset_2px_0_0_#5dc887]" : "bg-transparent"}`}
    >
      <span className="font-mono text-[0.76rem] tabular-nums text-white/50">
        {formatAlertTime(alert.triggered_at ?? alert.time)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[0.9rem] font-bold italic leading-tight text-white/95">
          {alert.instrument.instrument_symbol.replace(/[-_/].*$/, "")}
        </span>
        <span className="block pt-px font-mono text-[0.55rem] tracking-[0.12em] text-white/35">
          {alert.instrument.quote_asset_symbol || "USDT"}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[0.9rem] font-semibold leading-tight text-white/95">
          {getMomentumEvent(alert)}
        </span>
        <span className="block truncate pt-0.5 text-[0.65rem] text-white/42">
          {getStateTransition(alert) ??
            `${alert.direction} momentum intelligence signal`}
        </span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-[0.65rem]">
        <span
          className={`shrink-0 rounded-md px-2 py-1 font-semibold ${EVENT_TONE_CLASSES[getEventTone(alert)]}`}
        >
          {getSetupLabel(alert)}
        </span>
        <span className="truncate text-white/35">
          {alert.strategy_id.replace("momentum-intelligence-", "")}
        </span>
      </span>
      <span className="text-right font-mono text-[0.82rem] tabular-nums text-white/90">
        ${formatPrice(alert.price)}
      </span>
    </button>
  );
}

export function MomentumAlertsPanel() {
  const [inspectorWidth, setInspectorWidth] = useState(420);
  const [strategyId, setStrategyId] =
    useState<StrategySelection>(ALL_STRATEGIES);
  const [direction, setDirection] = useState("");
  const [symbol, setSymbol] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<AlertSortBy>("triggered_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(
    // Audio is opt-in: entering the Alerts page should never unexpectedly
    // start speaking. A user who explicitly enabled it keeps that preference.
    () => localStorage.getItem(VOICE_ALERTS_STORAGE_KEY) === "true",
  );
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() =>
    localStorage.getItem(VOICE_ALERT_GENDER_STORAGE_KEY) === "male"
      ? "male"
      : "female",
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const alertListRef = useRef<HTMLDivElement>(null);
  const knownAlertIdsRef = useRef(new Set<string>());
  const voiceAlertsPrimedRef = useRef(false);
  const skipVoiceForNextPageRef = useRef(false);
  const lastVoiceAlertAtRef = useRef(0);
  const queryLimit = (page + 1) * PAGE_SIZE;
  const baseQueryParams = {
    limit: queryLimit,
    offset: 0,
    direction: direction || undefined,
    symbol: symbol || undefined,
    // The API supports one event type. For a multi-select, fetch the current
    // alert stream and apply the selected event types in the client.
    alertType:
      selectedEventTypes.length === 1 ? selectedEventTypes[0] : undefined,
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
    .filter(
      (alert) =>
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(
          alert.alert_type ?? String(alert.trigger_values.event_type ?? ""),
        ),
    )
    .sort((left, right) => {
      const comparison =
        sortBy === "alert_type"
          ? (left.alert_type ?? "").localeCompare(right.alert_type ?? "")
          : Date.parse(left.triggered_at ?? left.time) -
            Date.parse(right.triggered_at ?? right.time);
      return sortOrder === "asc" ? comparison : -comparison;
    })
    .slice(0, queryLimit);
  const isLoading = activeQueries.some((query) => query.isLoading);
  const isError = activeQueries.some((query) => query.isError);
  const alertQueryScope = `${strategyId}:${direction}:${symbol}:${selectedEventTypes.join(",")}:${sortBy}:${sortOrder}`;
  const totalAlerts = activeQueries.reduce(
    (total, query) => total + (query.data?.meta.total ?? 0),
    0,
  );
  const hasMoreAlerts = alerts.length < totalAlerts;
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
    if (!window.speechSynthesis) return;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const scrollContainer = alertListRef.current;
    if (!sentinel || !scrollContainer || !hasMoreAlerts || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // These are older alerts being added by pagination, not new live
          // alerts, so they must not be announced.
          skipVoiceForNextPageRef.current = true;
          setPage((current) => current + 1);
        }
      },
      { root: scrollContainer, rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreAlerts, isLoading]);

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

    if (skipVoiceForNextPageRef.current) {
      if (isLoading) return;

      alerts.forEach((alert) => {
        knownAlertIdsRef.current.add(alert.id);
      });
      skipVoiceForNextPageRef.current = false;
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
        symbol,
        eventTypes: selectedEventTypes,
        sortBy,
        sortOrder,
        page,
      },
      newAlertIds: newAlerts.map((newAlert) => newAlert.id),
      cooldownElapsedMs: now - lastVoiceAlertAtRef.current,
    });

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getVoiceAlertMessage(alert));
    const selectedVoice = getVoiceForGender(voices, voiceGender);
    if (selectedVoice) utterance.voice = selectedVoice;
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
    selectedEventTypes,
    symbol,
    isLoading,
    page,
    sortBy,
    sortOrder,
    strategyId,
    voiceAlertsEnabled,
    voiceGender,
    voices,
  ]);

  const handleVoiceAlertsChange = () => {
    setVoiceAlertsEnabled((enabled) => {
      const nextEnabled = !enabled;
      localStorage.setItem(VOICE_ALERTS_STORAGE_KEY, String(nextEnabled));
      if (!nextEnabled) window.speechSynthesis?.cancel();
      return nextEnabled;
    });
  };

  const handleVoiceGenderChange = (gender: VoiceGender) => {
    setVoiceGender(gender);
    localStorage.setItem(VOICE_ALERT_GENDER_STORAGE_KEY, gender);
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
    <section className="flex min-h-[640px] border border-white/8 bg-[#090b0d]">
      <div
        ref={alertListRef}
        className="min-w-0 flex-1 border-b border-white/8 xl:overflow-y-auto xl:border-b-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.09] bg-[#0a0d0c] px-5 py-4 font-mono text-xs">
          <span className="mr-1 text-[0.64rem] uppercase tracking-[0.2em] text-white/40">
            Event
          </span>
          <FilterDropdown
            ariaLabel="Strategy"
            value={strategyId}
            options={[
              { label: "All strategies", value: ALL_STRATEGIES },
              ...MOMENTUM_INTELLIGENCE_STRATEGY_IDS.map((id) => ({
                label: id
                  .replace("momentum-intelligence-", "")
                  .replace("-v2", ""),
                value: id,
              })),
            ]}
            onValueChange={(value) => {
              setStrategyId(value);
              setPage(0);
            }}
          />
          <FilterDropdown
            ariaLabel="Direction"
            value={direction}
            options={[
              { label: "All directions", value: "" },
              { label: "Long", value: "long" },
              { label: "Short", value: "short" },
            ]}
            onValueChange={(value) => {
              setDirection(value);
              setPage(0);
            }}
          />
          <input
            value={symbol}
            onChange={(event) => {
              setSymbol(event.target.value);
              setPage(0);
            }}
            placeholder="Filter symbol…"
            className="h-9 min-w-36 rounded-md border border-white/15 bg-white/[0.025] px-3 text-white/75 placeholder:text-white/30 outline-none transition-colors hover:border-white/25 focus:border-[#5dc887]/60"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md border-white/15 bg-white/[0.025] px-3 font-mono text-xs font-normal text-white/75 shadow-none hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
              >
                {selectedEventTypes.length === 0
                  ? "All event types"
                  : `${selectedEventTypes.length} event type${selectedEventTypes.length === 1 ? "" : "s"}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 border-white/15 bg-[#101312] font-mono text-xs text-white/80"
            >
              <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
                Event types
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedEventTypes.length === 0}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => {
                  setSelectedEventTypes([]);
                  setPage(0);
                }}
              >
                All event types
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {(alertTypesQuery.data ?? []).map(({ alert_type, total }) => (
                <DropdownMenuCheckboxItem
                  key={alert_type}
                  checked={selectedEventTypes.includes(alert_type)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => {
                    setSelectedEventTypes((current) =>
                      checked
                        ? [...current, alert_type]
                        : current.filter((type) => type !== alert_type),
                    );
                    setPage(0);
                  }}
                >
                  {alert_type.replaceAll("_", " ")} ({total})
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <FilterDropdown
            ariaLabel="Sort field"
            value={sortBy}
            options={[
              { label: "Sort: triggered", value: "triggered_at" },
              { label: "Sort: event type", value: "alert_type" },
            ]}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(0);
            }}
          />
          <FilterDropdown
            ariaLabel="Sort order"
            value={sortOrder}
            options={[
              { label: "Descending", value: "desc" },
              { label: "Ascending", value: "asc" },
            ]}
            onValueChange={(value) => {
              setSortOrder(value);
              setPage(0);
            }}
          />
          <div className="flex overflow-hidden rounded-md">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={voiceAlertsEnabled}
              onClick={handleVoiceAlertsChange}
              className={`h-9 rounded-r-none border px-3 text-[0.65rem] uppercase tracking-[0.08em] shadow-none ${
                voiceAlertsEnabled
                  ? "border-[#5dc887]/40 bg-[#5dc887]/10 text-[#5dc887] hover:bg-[#5dc887]/15 hover:text-[#5dc887]"
                  : "border-white/10 bg-transparent text-white/45 hover:border-white/20 hover:bg-white/[0.03] hover:text-white/70"
              }`}
            >
              {voiceAlertsEnabled ? <Volume2 /> : <VolumeX />}
              Voice {voiceAlertsEnabled ? "on" : "off"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Select voice"
                  className="h-9 rounded-l-none border-l-0 border-white/10 bg-transparent px-2 text-white/60 shadow-none hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
                >
                  {voiceGender}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuLabel>Alert voice</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={voiceGender === "female"}
                  onCheckedChange={() => handleVoiceGenderChange("female")}
                >
                  Female
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={voiceGender === "male"}
                  onCheckedChange={() => handleVoiceGenderChange("male")}
                >
                  Male
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="ml-auto flex items-center gap-2 whitespace-nowrap text-[0.72rem] text-[#5dc887]">
            <span className="h-2 w-2 rounded-full bg-[#5dc887] shadow-[0_0_10px_#5dc887]" />
            Streaming
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[600px] grid-cols-[74px_86px_minmax(120px,1.1fr)_minmax(140px,1.35fr)_88px] gap-2 border-b border-white/[0.1] bg-[#0c0f0e] px-3 py-2 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/40">
            <span>Time</span>
            <span>Symbol</span>
            <span>Event</span>
            <span>Setup</span>
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
        <div
          ref={loadMoreRef}
          className="border-t border-white/8 px-4 py-3 text-center font-mono text-[0.65rem] text-white/40"
        >
          {hasMoreAlerts
            ? "Loading more alerts…"
            : totalAlerts > 0
              ? "End of alert history"
              : ""}
        </div>
      </div>
      <div
        className="alerts-panel-resize hidden xl:block"
        role="slider"
        aria-label="Resize alert inspector"
        aria-orientation="vertical"
        aria-valuemin={300}
        aria-valuemax={700}
        aria-valuenow={inspectorWidth}
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          const startX = event.clientX;
          const startWidth = inspectorWidth;
          const onMove = (moveEvent: PointerEvent) => {
            setInspectorWidth(
              Math.min(
                700,
                Math.max(300, startWidth - (moveEvent.clientX - startX)),
              ),
            );
          };
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp, { once: true });
        }}
      />
      <aside
        className="hidden min-w-0 bg-[#0a0a0a] xl:block"
        style={{ width: inspectorWidth }}
      >
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
