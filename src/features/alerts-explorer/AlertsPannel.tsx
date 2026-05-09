import { useEffect, useRef } from "react";
import { useGetAlertsPaginated } from "./hooks/alerts.api";
import { AlertsChartWrapper } from "./AlertChartWrapper";

export function AlertsPannel() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetAlertsPaginated("15m", 1000);
  const alerts = data?.pages.flatMap((p) => p.data);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);

  const formatType = (type: string) =>
    type
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
    <div className="mt-8 w-full min-w-0 space-y-6 overflow-x-hidden pb-4">
      {/* Section label */}
      <div className="flex items-center gap-3">
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
        <div className="h-px flex-1" style={{ background: "oklch(1 0 0 / 6%)" }} />
        {alerts && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              color: "oklch(0.38 0 0)",
            }}
          >
            {alerts.length} signals
          </span>
        )}
      </div>

      {alerts?.map((alert) => (
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
          {/* Card header */}
          <div className="p-5 pb-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              {/* Symbol info */}
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
                  {alert.asset.symbol}
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

              {/* Alert type badge */}
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

            {/* Metadata grid */}
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { label: "Alert ID", value: String(alert.id) },
                { label: "Asset ID", value: String(alert.asset.id) },
                {
                  label: "Time",
                  value: alert.time
                    ? new Date(alert.time).toLocaleString()
                    : "N/A",
                },
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

          {/* Chart area */}
          <div
            className="h-[320px] w-full min-w-0 overflow-hidden"
            style={{ borderTop: "1px solid oklch(1 0 0 / 5%)" }}
          >
            <AlertsChartWrapper alertTime={alert.time} alertId={alert.id} />
          </div>
        </div>
      ))}

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
      {!hasNextPage && alerts && alerts.length > 0 && (
        <p
          className="pb-2 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: "oklch(0.35 0 0)",
          }}
        >
          — End of signal feed —
        </p>
      )}
    </div>
  );
}
