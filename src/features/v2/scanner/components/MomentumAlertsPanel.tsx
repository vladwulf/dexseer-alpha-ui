import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Flame,
  LoaderCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { type Ref, useCallback, useEffect, useRef, useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { AlertsChartWrapper } from "@/features/alerts-explorer/AlertChartWrapper";
import {
  type AlertListItem,
  type AlertTimeframe,
  MOMENTUM_INTELLIGENCE_STRATEGY_IDS,
  useGetAlertsPaginated,
  useGetAlertTypes,
  useLiveMomentumIntelligenceAlerts,
} from "@/features/alerts-explorer/hooks/alerts.api";
import { useIsMobileScanner } from "@/features/v2/scanner/hooks/useIsMobileScanner";
import {
  getMomentumAlertEventType,
  getMomentumAlertLabel,
} from "@/features/v2/scanner/lib/momentumLabels";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
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

const alertControlClass =
  "inline-flex h-[26px] items-center gap-[5px] whitespace-nowrap rounded-[4px] border border-[var(--ds-border)] bg-[var(--ds-canvas-raised)] px-[8px] font-mono text-[0.68rem] font-medium tracking-[0.05em] text-[var(--ds-text-secondary)] shadow-none transition-colors duration-150 hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-surface-raised)] hover:text-[var(--ds-text-primary)] focus-visible:border-[var(--ds-electric)] focus-visible:outline-none";

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
        <button
          type="button"
          aria-label={ariaLabel}
          className={alertControlClass}
        >
          {selectedOption?.label}
          <ChevronDown size={10} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-white/15 bg-[var(--ds-surface-raised)] font-mono text-xs text-white/80"
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
  return getMomentumAlertLabel(alert);
}

function isConfirmed(alert: AlertListItem) {
  const value = alert.trigger_values.is_confirmed;
  return value === 1 || value === "1" || value === true;
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

  const isBearish = alert.direction.toLowerCase().includes("short");
  return `${isBearish ? "↓ Bearish" : "↑ Bullish"} · ${alert.timeframe}`;
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

const ALERT_TABLE_COLUMNS =
  "grid-cols-[74px_132px_minmax(120px,1.1fr)_minmax(140px,1.35fr)_88px]";

function EventStateIcon({ alert }: { alert: AlertListItem }) {
  const event = getMomentumEvent(alert);

  if (event.includes("pullback")) {
    return <RotateCcw aria-hidden="true" className="size-3" />;
  }

  if (event.includes("exited")) {
    return <XCircle aria-hidden="true" className="size-3" />;
  }

  return alert.direction.toLowerCase().includes("short") ? (
    <ArrowDownRight aria-hidden="true" className="size-3" />
  ) : (
    <ArrowUpRight aria-hidden="true" className="size-3" />
  );
}

function isUnusualMomentum(alert: AlertListItem) {
  const values = [
    alert.momentum_label,
    alert.alert_type,
    alert.type,
    alert.trigger_values.event_type,
    alert.trigger_values.severity,
    alert.trigger_values.state,
  ];

  return values.some(
    (value) =>
      typeof value === "string" && value.toLowerCase().includes("unusual"),
  );
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
  const unusual = isUnusualMomentum(alert);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onSelect}
      className={`grid w-full min-w-[650px] ${ALERT_TABLE_COLUMNS} items-center gap-2 px-3 py-1.5 text-left outline-none transition-colors hover:bg-white/[0.035] ${selected ? "bg-[#5dc887]/[0.065] shadow-[inset_2px_0_0_#5dc887]" : unusual ? "bg-[#ffae45]/[0.045] shadow-[inset_2px_0_0_#ffae45] hover:bg-[#ffae45]/[0.075]" : "bg-transparent"}`}
    >
      <span className="font-mono text-[0.76rem] tabular-nums text-white/50">
        {formatAlertTime(alert.triggered_at ?? alert.time)}
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[0.9rem] font-bold italic leading-tight text-white/95">
            {alert.instrument.instrument_symbol.replace(/[-_/].*$/, "")}
          </span>
          {isUnusualMomentum(alert) && (
            <span
              role="img"
              aria-label="Unusual momentum"
              title="Unusual momentum"
              className="unusual-momentum-flame relative inline-flex size-3.5 shrink-0 text-[#ffae45]"
            >
              <Flame
                aria-hidden="true"
                className="unusual-momentum-flame__outline absolute inset-0 size-3.5"
              />
              <Flame
                aria-hidden="true"
                className="unusual-momentum-flame__fill absolute inset-0 size-3.5"
              />
            </span>
          )}
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
          {alert.direction} momentum intelligence signal
        </span>
      </span>
      <span className="flex min-w-0 items-center text-[0.65rem]">
        <span
          title={getSetupLabel(alert)}
          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-semibold ${EVENT_TONE_CLASSES[getEventTone(alert)]}`}
        >
          <EventStateIcon alert={alert} />
          {getSetupLabel(alert).replace(/^[↑↓↘]\s*/, "")}
        </span>
      </span>
      <span className="text-right font-mono text-[0.82rem] tabular-nums text-white/90">
        ${formatPrice(alert.price)}
      </span>
    </button>
  );
}

function AlertInspectorContent({
  alert,
  renderChart = true,
}: {
  alert: AlertListItem;
  renderChart?: boolean;
}) {
  return (
    <>
      <div className="border-b border-[var(--ds-border)] p-4 font-mono">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-white/35">
          Momentum Intelligence update
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold text-white/90">
            {alert.instrument.instrument_symbol}
          </h2>
          <span className="text-xs text-white/55">
            {formatTime(alert.triggered_at ?? alert.time)}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/55">
          {alert.direction} · {alert.timeframe} · {getMomentumEvent(alert)} ·{" "}
          {isConfirmed(alert) ? "closed candle" : "provisional"} · $
          {formatPrice(alert.price)}
        </p>
      </div>
      <div className="h-72 border-b border-[var(--ds-border)] sm:h-80">
        {renderChart ? (
          <AlertsChartWrapper
            alertId={alert.id}
            alertTime={alert.triggered_at ?? alert.time}
            alertPrice={alert.price}
            alertDirection={alert.direction}
            expectedInstrumentId={alert.instrument.instrument_id}
            timeframe={alert.timeframe as AlertTimeframe}
            showLegend={false}
            initialVisibleCandleCount={50}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[0.7rem] tracking-[0.08em] text-white/35">
            Loading chart…
          </div>
        )}
      </div>
    </>
  );
}

export function MomentumAlertsPanel() {
  const isMobile = useIsMobileScanner();
  useLiveMomentumIntelligenceAlerts();
  const [inspectorWidth, setInspectorWidth] = useState(420);
  const [strategyId, setStrategyId] =
    useState<StrategySelection>(ALL_STRATEGIES);
  const [direction, setDirection] = useState("");
  const [symbol, setSymbol] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(
    // Mobile always starts muted, even when voice was previously enabled on a
    // desktop device. Users can still explicitly turn it on from the control.
    () =>
      !isMobile && localStorage.getItem(VOICE_ALERTS_STORAGE_KEY) === "true",
  );
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() =>
    localStorage.getItem(VOICE_ALERT_GENDER_STORAGE_KEY) === "male"
      ? "male"
      : "female",
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const mobileSheetTouchStartX = useRef<number | null>(null);
  const mobileSelectionTimeoutRef = useRef<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const alertListRef = useRef<HTMLDivElement>(null);
  const knownAlertIdsRef = useRef(new Set<string>());
  const voiceAlertsPrimedRef = useRef(false);
  const skipVoiceForNextPageRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const lastVoiceAlertAtRef = useRef(0);
  const previewVoiceRef = useRef<VoiceGender | null>(null);
  const baseQueryParams = {
    limit: PAGE_SIZE,
    direction: direction || undefined,
    symbol: symbol || undefined,
    // The API supports one event type. For a multi-select, fetch the current
    // alert stream and apply the selected event types in the client.
    alertType:
      selectedEventTypes.length === 1 ? selectedEventTypes[0] : undefined,
    sortBy: "triggered_at" as const,
    sortOrder: "desc" as const,
  };
  const alertTypesQuery = useGetAlertTypes();
  const fiveMinuteQuery = useGetAlertsPaginated({
    ...baseQueryParams,
    enabled:
      strategyId === ALL_STRATEGIES ||
      strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[0],
    strategyId: MOMENTUM_INTELLIGENCE_STRATEGY_IDS[0],
  });
  const fifteenMinuteQuery = useGetAlertsPaginated({
    ...baseQueryParams,
    enabled:
      strategyId === ALL_STRATEGIES ||
      strategyId === MOMENTUM_INTELLIGENCE_STRATEGY_IDS[1],
    strategyId: MOMENTUM_INTELLIGENCE_STRATEGY_IDS[1],
  });
  const oneHourQuery = useGetAlertsPaginated({
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
  const loadedAlerts = activeQueries.flatMap(
    (query) => query.data?.pages.flatMap((page) => page.data) ?? [],
  );
  const alertTypes = (() => {
    const types = new Map(
      (alertTypesQuery.data ?? []).map(({ alert_type, total }) => [
        alert_type,
        total,
      ]),
    );

    for (const alert of loadedAlerts) {
      const eventType = getMomentumAlertEventType(alert);
      if (eventType === "pullback_entered" && !types.has(eventType)) {
        types.set(
          eventType,
          loadedAlerts.filter(
            (item) => getMomentumAlertEventType(item) === eventType,
          ).length,
        );
      }
    }

    return [...types].map(([alert_type, total]) => ({ alert_type, total }));
  })();
  const alerts = loadedAlerts
    .filter(
      (alert) =>
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(getMomentumAlertEventType(alert) ?? ""),
    )
    .sort(
      (left, right) =>
        Date.parse(right.triggered_at ?? right.time) -
        Date.parse(left.triggered_at ?? left.time),
    );
  const isLoading = activeQueries.some((query) => query.isLoading);
  const isFetching = activeQueries.some((query) => query.isFetching);
  const isFetchingMore = activeQueries.some(
    (query) => query.isFetchingNextPage,
  );
  const isError = activeQueries.some((query) => query.isError);
  const alertQueryScope = `${strategyId}:${direction}:${symbol}:${selectedEventTypes.join(",")}`;
  const hasMoreAlerts = activeQueries.some((query) => query.hasNextPage);
  const [selectedAlertId, setSelectedAlertId] = useState<string>();
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [mobileChartReady, setMobileChartReady] = useState(false);
  const selectedAlert =
    alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];
  const selectedAlertKey = selectedAlert?.id ?? "";

  const handleSelectAlert = useCallback(
    (alertId: string) => {
      if (isMobile) {
        setMobileChartReady(false);
        setMobileInspectorOpen(true);
        if (mobileSelectionTimeoutRef.current !== null) {
          window.clearTimeout(mobileSelectionTimeoutRef.current);
        }
        mobileSelectionTimeoutRef.current = window.setTimeout(() => {
          setSelectedAlertId(alertId);
          mobileSelectionTimeoutRef.current = null;
        }, 16);
        return;
      }

      setSelectedAlertId(alertId);
    },
    [isMobile],
  );

  useEffect(
    () => () => {
      if (mobileSelectionTimeoutRef.current !== null) {
        window.clearTimeout(mobileSelectionTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (selectedAlert && selectedAlert.id !== selectedAlertId)
      setSelectedAlertId(selectedAlert.id);
  }, [selectedAlert, selectedAlertId]);

  useEffect(() => {
    if (!isMobile || !mobileInspectorOpen || !selectedAlertKey) {
      setMobileChartReady(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMobileChartReady(true);
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [isMobile, mobileInspectorOpen, selectedAlertKey]);

  useEffect(() => {
    if (!alertQueryScope) return;

    voiceAlertsPrimedRef.current = false;
    isLoadingMoreRef.current = false;
  }, [alertQueryScope]);

  useEffect(() => {
    if (!isFetchingMore) isLoadingMoreRef.current = false;
  }, [isFetchingMore]);

  useEffect(() => {
    // Mobile voice alerts are intentionally disabled. Avoid asking mobile
    // browsers for their voice objects: some expose non-standard values that
    // cannot safely be stored in React state.
    if (isMobile || !window.speechSynthesis) return;

    const loadVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(Array.isArray(availableVoices) ? availableVoices : []);
      } catch {
        setVoices([]);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isMobile]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const scrollContainer = alertListRef.current;
    if (
      !sentinel ||
      !scrollContainer ||
      !hasMoreAlerts ||
      isLoading ||
      isFetchingMore
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMoreRef.current) {
          // These are older alerts being added by pagination, not new live
          // alerts, so they must not be announced. The ref prevents the
          // sentinel from incrementing more than once before the fetch settles.
          isLoadingMoreRef.current = true;
          skipVoiceForNextPageRef.current = true;
          activeQueries.forEach((query) => {
            if (query.hasNextPage) query.fetchNextPage();
          });
        }
      },
      { root: scrollContainer, rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeQueries, hasMoreAlerts, isFetchingMore, isLoading]);

  useEffect(() => {
    if (!voiceAlertsPrimedRef.current) {
      // The panel first renders an empty list while its alert history loads.
      // Establish the baseline only after that request settles, so opening the
      // Alerts view never treats existing history as new live alerts.
      if (isLoading || isFetching) return;

      alerts.forEach((alert) => {
        knownAlertIdsRef.current.add(alert.id);
      });
      voiceAlertsPrimedRef.current = true;
      return;
    }

    if (skipVoiceForNextPageRef.current) {
      if (isLoading || isFetching) return;

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
    isFetching,
    isLoading,
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

  const handleTestVoice = (gender: VoiceGender) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `This is the ${gender} alert voice.`,
    );
    const selectedVoice = getVoiceForGender(voices, gender);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 1.1;
    utterance.volume = 0.7;
    window.speechSynthesis.speak(utterance);
  };

  const handleMobileSheetTouchStart = (event: React.TouchEvent) => {
    mobileSheetTouchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleMobileSheetTouchEnd = (event: React.TouchEvent) => {
    if (mobileSheetTouchStartX.current === null) return;

    const delta =
      event.changedTouches[0].clientX - mobileSheetTouchStartX.current;
    mobileSheetTouchStartX.current = null;
    if (delta > 80) setMobileInspectorOpen(false);
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

      handleSelectAlert(nextAlert.id);
      rowRefs.current.get(nextAlert.id)?.scrollIntoView({ block: "nearest" });
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [alerts, handleSelectAlert, selectedAlert?.id]);

  return (
    <section className="flex min-h-[640px] bg-[var(--ds-canvas)]">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] bg-[var(--ds-canvas-raised)] shadow-[inset_0_1px_rgb(255_255_255_/_4%)]">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 font-mono text-xs">
          <span className="mr-1 text-[0.58rem] uppercase tracking-[0.14em] text-white/35">
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
            }}
          />
          <FilterDropdown
            ariaLabel="Direction"
            value={direction}
            options={[
              { label: "All directions", value: "" },
              { label: "Bullish", value: "long" },
              { label: "Bearish", value: "short" },
            ]}
            onValueChange={(value) => {
              setDirection(value);
            }}
          />
          <input
            value={symbol}
            onChange={(event) => {
              setSymbol(event.target.value);
            }}
            placeholder="Filter symbol…"
            className="h-[26px] min-w-32 rounded-[4px] border border-[var(--ds-border)] bg-[var(--ds-canvas-raised)] px-[8px] font-mono text-[0.68rem] font-medium tracking-[0.05em] text-[var(--ds-text-secondary)] placeholder:text-[var(--ds-text-tertiary)] outline-none transition-colors duration-150 hover:border-[var(--ds-border-strong)] focus:border-[var(--ds-electric)]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={alertControlClass}>
                {selectedEventTypes.length === 0
                  ? "All event types"
                  : `${selectedEventTypes.length} event type${selectedEventTypes.length === 1 ? "" : "s"}`}
                <ChevronDown size={10} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 border-white/15 bg-[var(--ds-surface-raised)] font-mono text-xs text-white/80"
            >
              <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
                Event types
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedEventTypes.length === 0}
                onSelect={(event) => {
                  if (!isMobile) event.preventDefault();
                }}
                onCheckedChange={() => {
                  setSelectedEventTypes([]);
                }}
              >
                All event types
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {alertTypes.map(({ alert_type, total }) => (
                <DropdownMenuCheckboxItem
                  key={alert_type}
                  checked={selectedEventTypes.includes(alert_type)}
                  onSelect={(event) => {
                    if (!isMobile) event.preventDefault();
                  }}
                  onCheckedChange={(checked) => {
                    setSelectedEventTypes((current) =>
                      checked
                        ? [...current, alert_type]
                        : current.filter((type) => type !== alert_type),
                    );
                  }}
                >
                  {alert_type.replaceAll("_", " ")} ({total})
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex overflow-hidden rounded-[4px]">
            <button
              type="button"
              aria-pressed={voiceAlertsEnabled}
              onClick={handleVoiceAlertsChange}
              className={cn(
                "inline-flex h-[26px] items-center gap-[5px] rounded-r-none border px-[8px] font-mono text-[0.68rem] font-medium tracking-[0.05em] transition-colors duration-150 focus-visible:outline-none",
                voiceAlertsEnabled
                  ? "border-[var(--ds-positive)] bg-[color-mix(in_srgb,var(--ds-positive)_12%,transparent)] text-[var(--ds-positive)] hover:bg-[color-mix(in_srgb,var(--ds-positive)_18%,transparent)]"
                  : "border-[var(--ds-border)] bg-[var(--ds-canvas-raised)] text-[var(--ds-text-tertiary)] hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-surface-raised)] hover:text-[var(--ds-text-primary)]",
              )}
            >
              {voiceAlertsEnabled ? (
                <Volume2 size={11} />
              ) : (
                <VolumeX size={11} />
              )}
              Voice {voiceAlertsEnabled ? "on" : "off"}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Select voice"
                  className="inline-flex h-[26px] items-center gap-1 rounded-l-none border border-l-0 border-[var(--ds-border)] bg-[var(--ds-canvas-raised)] px-[7px] font-mono text-[0.64rem] font-medium tracking-[0.05em] text-[var(--ds-text-secondary)] transition-colors duration-150 hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-surface-raised)] hover:text-[var(--ds-text-primary)] focus-visible:outline-none"
                >
                  {voiceGender}
                  <ChevronDown size={10} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuLabel>Alert voice</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={voiceGender === "female"}
                  onSelect={(event) => {
                    if (previewVoiceRef.current !== "female") return;
                    event.preventDefault();
                    previewVoiceRef.current = null;
                  }}
                  onCheckedChange={() => handleVoiceGenderChange("female")}
                >
                  <span>Female</span>
                  <button
                    type="button"
                    aria-label="Test female voice"
                    className="ml-auto rounded-sm p-0.5 hover:bg-accent focus-visible:outline-none"
                    onPointerDown={(event) => {
                      previewVoiceRef.current = "female";
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTestVoice("female");
                    }}
                  >
                    <Volume2 size={12} />
                  </button>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={voiceGender === "male"}
                  onSelect={(event) => {
                    if (previewVoiceRef.current !== "male") return;
                    event.preventDefault();
                    previewVoiceRef.current = null;
                  }}
                  onCheckedChange={() => handleVoiceGenderChange("male")}
                >
                  <span>Male</span>
                  <button
                    type="button"
                    aria-label="Test male voice"
                    className="ml-auto rounded-sm p-0.5 hover:bg-accent focus-visible:outline-none"
                    onPointerDown={(event) => {
                      previewVoiceRef.current = "male";
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTestVoice("male");
                    }}
                  >
                    <Volume2 size={12} />
                  </button>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--ds-positive)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-positive)] shadow-[0_0_8px_var(--ds-positive)]" />
            Streaming
          </span>
        </div>
        <div ref={alertListRef} className="min-h-0 flex-1 overflow-auto">
          <div
            className={`sticky top-0 z-10 grid min-w-[650px] ${ALERT_TABLE_COLUMNS} gap-2 border-b border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-2 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-tertiary)] shadow-[0_1px_0_var(--ds-border)]`}
          >
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
              onSelect={() => handleSelectAlert(alert.id)}
              buttonRef={(element) => {
                if (element) rowRefs.current.set(alert.id, element);
                else rowRefs.current.delete(alert.id);
              }}
            />
          ))}
          <div
            ref={loadMoreRef}
            className="border-t border-[var(--ds-border)] px-4 py-3 text-center font-mono text-[0.65rem] text-[var(--ds-text-tertiary)]"
          >
            {hasMoreAlerts ? (
              isFetchingMore ? (
                <span className="inline-flex items-center gap-2 text-white/55">
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-3 animate-[spin_1.8s_linear_infinite] text-[#5dc887]"
                  />
                  Loading more alerts…
                </span>
              ) : (
                "Scroll for more alerts"
              )
            ) : alerts.length > 0 ? (
              "End of alert history"
            ) : (
              ""
            )}
          </div>
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
        className="hidden min-w-0 overflow-hidden rounded-[6px] bg-[var(--ds-canvas-raised)] shadow-[inset_0_1px_rgb(255_255_255_/_4%)] xl:block"
        style={{ width: inspectorWidth }}
      >
        {!isMobile && selectedAlert ? (
          <div className="flex h-full min-h-[640px] flex-col">
            <AlertInspectorContent alert={selectedAlert} />
          </div>
        ) : (
          <p className="p-6 font-mono text-xs text-white/40">
            Select an alert to inspect its chart context.
          </p>
        )}
      </aside>
      <Sheet
        open={isMobile && mobileInspectorOpen}
        onOpenChange={setMobileInspectorOpen}
      >
        <SheetContent
          side="right"
          className="h-[100dvh] transform-gpu overflow-y-auto border-[var(--ds-border)] bg-[var(--ds-canvas-raised)] p-0 pb-[env(safe-area-inset-bottom)] will-change-transform data-[state=closed]:duration-150 data-[state=open]:duration-200 xl:hidden"
          onTouchStart={handleMobileSheetTouchStart}
          onTouchEnd={handleMobileSheetTouchEnd}
        >
          <SheetTitle className="sr-only">
            {selectedAlert
              ? `${selectedAlert.instrument.instrument_symbol} alert chart`
              : "Alert chart"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Chart context for the selected Momentum Intelligence alert.
          </SheetDescription>
          <div aria-hidden="true" className="mobile-sheet-swipe-hint">
            <ChevronRight className="size-6" strokeWidth={1.25} />
          </div>
          {selectedAlert && (
            <AlertInspectorContent
              alert={selectedAlert}
              renderChart={mobileChartReady}
            />
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
