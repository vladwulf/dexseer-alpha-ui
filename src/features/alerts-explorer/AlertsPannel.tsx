import { useEffect, useRef } from "react";
import { useGetAlertsPaginated } from "./hooks/alerts.api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="mt-10 w-full min-w-0 space-y-10 overflow-x-hidden pb-4">
      {alerts?.map((alert) => (
        <Card
          key={alert.id}
          className="w-full overflow-hidden rounded-lg border border-border/70 bg-gradient-to-b from-zinc-950 to-zinc-950/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors"
        >
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Symbol
                </p>
                <h3 className="truncate text-lg font-semibold leading-tight text-foreground">
                  {alert.asset.symbol}
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-300">
                  ${formatPrice(alert.price)}
                </p>
              </div>
              <div className="flex items-start">
                <Badge
                  variant="outline"
                  className="border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                >
                  {formatType(alert.type)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2">
                <p className="uppercase tracking-wide text-zinc-500">
                  Alert ID
                </p>
                <p className="mt-1 font-medium text-zinc-200">{alert.id}</p>
              </div>
              <div className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2">
                <p className="uppercase tracking-wide text-zinc-500">
                  Asset ID
                </p>
                <p className="mt-1 font-medium text-zinc-200">
                  {alert.asset.id}
                </p>
              </div>
              <div className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2">
                <p className="uppercase tracking-wide text-zinc-500">Time</p>
                <p className="mt-1 font-medium text-zinc-200">
                  {alert.time ? new Date(alert.time).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="h-[320px] w-full min-w-0 overflow-hidden">
            <AlertsChartWrapper alertTime={alert.time} alertId={alert.id} />
          </div>
        </Card>
      ))}

      <div ref={loadMoreRef} className="h-6 w-full" />
      {isFetchingNextPage && (
        <p className="pb-2 text-center text-sm text-muted-foreground">
          Loading more alerts...
        </p>
      )}
      {!hasNextPage && alerts && alerts.length > 0 && (
        <p className="pb-2 text-center text-xs text-muted-foreground/70">
          End of alerts
        </p>
      )}
    </div>
  );
}
