import { useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetAlertsPage } from "@/features/alerts-explorer/hooks/alerts.api";
import type { ScannerAsset, ScannerTimeframe } from "../../types";
import { ActiveAssetPanel } from "../ActiveAssetPanel/ActiveAssetPanel";
import { ScannerSidePanelBody } from "./components/ScannerSidePanelBody";
import { ScannerSidePanelSkeleton } from "./components/ScannerSidePanelSkeleton";

type ScannerSidePanelProps = {
  asset?: ScannerAsset;
  hasMoreChartHistory?: boolean;
  isLoadingMoreChartHistory?: boolean;
  liveUpdatesEnabled?: boolean;
  mobileOpen: boolean;
  onLoadMoreChartHistory?: () => void;
  onMobileOpenChange: (open: boolean) => void;
  timeframe: ScannerTimeframe;
};

export function ScannerSidePanel({
  asset,
  hasMoreChartHistory,
  isLoadingMoreChartHistory,
  liveUpdatesEnabled,
  mobileOpen,
  onLoadMoreChartHistory,
  onMobileOpenChange,
  timeframe,
}: ScannerSidePanelProps) {
  const touchStartX = useRef<number | null>(null);
  const alertSymbol = asset?.symbol.replace(/usdt$/i, "") ?? "";
  const alertsQuery = useGetAlertsPage({
    enabled: Boolean(asset),
    limit: 5,
    symbol: alertSymbol,
    refetchInterval: 5_000,
    sortBy: "triggered_at",
    sortOrder: "desc",
  });
  const alerts = (alertsQuery.data?.data ?? []).slice(0, 5);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 80) onMobileOpenChange(false);
  }

  const panelContent = asset ? (
    <>
      <ActiveAssetPanel
        asset={asset}
        flushChart
        hasMoreChartHistory={hasMoreChartHistory}
        isLoadingMoreChartHistory={isLoadingMoreChartHistory}
        liveUpdatesEnabled={liveUpdatesEnabled}
        onLoadMoreChartHistory={onLoadMoreChartHistory}
        showStats={false}
        timeframe={timeframe}
        alerts={alerts}
      />
      <ScannerSidePanelBody
        asset={asset}
        timeframe={timeframe}
        alerts={alerts}
        alertCount={alertsQuery.data?.meta.total ?? 0}
        isAlertsLoading={alertsQuery.isLoading}
        isAlertsError={alertsQuery.isError}
      />
    </>
  ) : (
    <ScannerSidePanelSkeleton />
  );

  return (
    <>
      <aside className="scanner-side-panel hide-scrollbar hidden h-full min-h-0 xl:block xl:w-full xl:overflow-y-auto">
        {panelContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="right"
          className="scanner-side-panel w-full overflow-y-auto border-white/8 p-0 sm:max-w-[460px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <SheetTitle className="sr-only">
            {asset ? `${asset.symbol} details` : "Scanner details"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Asset intelligence details for the selected scanner symbol.
          </SheetDescription>
          <div className="min-h-full pb-6 xl:hidden">{panelContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
