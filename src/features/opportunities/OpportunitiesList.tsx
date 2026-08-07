import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AlertsChartWrapper } from "@/features/alerts-explorer/AlertChartWrapper";
import {
  type Opportunity,
  useGetAlertChart,
  useGetOpportunities,
} from "@/features/alerts-explorer/hooks/alerts.api";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function OpportunityCard({
  opportunity,
  rank,
}: {
  opportunity: Opportunity;
  rank: number;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(rank === 1);
  const [isVisible, setIsVisible] = useState(rank === 1);
  const shouldLoadChart = isOpen || isVisible;
  const chartQuery = useGetAlertChart(
    opportunity.alert_id,
    opportunity.timeframe,
    shouldLoadChart,
  );

  useEffect(() => {
    const node = cardRef.current;
    if (!node || isVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  const directionIsLong = opportunity.direction.toLowerCase() === "long";
  const performanceIsPositive = opportunity.performance_pct >= 0;

  return (
    <article
      ref={cardRef}
      data-chart-ready={chartQuery.isFetched || undefined}
      className="overflow-hidden rounded-lg bg-[var(--ds-surface)] shadow-[inset_0_1px_rgb(255_255_255_/_4%),0_14px_30px_rgb(0_0_0_/_14%)]"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-4 text-left transition-colors hover:bg-[var(--ds-surface-raised)]"
        aria-expanded={isOpen}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ds-electric-soft)] font-mono text-xs text-[var(--ds-electric)]">
          {rank === 1 ? <Trophy className="h-4 w-4" /> : `#${rank}`}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <strong className="font-mono text-sm text-[var(--ds-text-primary)]">
              {opportunity.instrument_symbol}
            </strong>
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[0.62rem] uppercase ${
                directionIsLong
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-400/10 text-rose-300"
              }`}
            >
              {opportunity.direction}
            </span>
            <span className="font-mono text-[0.65rem] text-[var(--ds-text-tertiary)]">
              {opportunity.timeframe}
            </span>
          </span>
          <span className="mt-1 block font-mono text-[0.68rem] text-[var(--ds-text-secondary)]">
            Entry ${formatPrice(opportunity.price_at_alert)} · Best ${" "}
            {formatPrice(opportunity.extreme_price)} ·{" "}
            {formatTime(opportunity.extreme_time)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span
            className={`font-mono text-lg font-semibold ${
              performanceIsPositive ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {performanceIsPositive ? "+" : ""}
            {opportunity.performance_pct.toFixed(2)}%
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-[var(--ds-text-tertiary)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--ds-text-tertiary)]" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="h-80 border-t border-[var(--ds-border)]">
          <AlertsChartWrapper
            alertId={opportunity.alert_id}
            alertTime={opportunity.alert_time}
            alertPrice={opportunity.price_at_alert}
            timeframe={opportunity.timeframe}
            enabled={shouldLoadChart}
            showLegend={false}
          />
        </div>
      )}
    </article>
  );
}

export function OpportunitiesList() {
  const opportunities = useGetOpportunities();

  if (opportunities.isLoading) {
    return (
      <p className="font-mono text-xs text-[var(--ds-text-secondary)]">
        Loading opportunities...
      </p>
    );
  }
  if (opportunities.isError) {
    return (
      <p className="font-mono text-xs text-rose-300">
        Opportunities are unavailable.
      </p>
    );
  }
  if (!opportunities.data?.length) {
    return (
      <p className="font-mono text-xs text-[var(--ds-text-secondary)]">
        No ranked opportunities yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {opportunities.data.map((opportunity, index) => (
        <OpportunityCard
          key={opportunity.alert_id}
          opportunity={opportunity}
          rank={index + 1}
        />
      ))}
    </div>
  );
}
