import { useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLiveChartSeries } from "@/hooks/chart/useLiveChartSeries";
import type { ScannerAsset, ScannerTimeframe } from "../../types";
import { ScannerSidePanelBody } from "./components/ScannerSidePanelBody";
import { ScannerSidePanelSkeleton } from "./components/ScannerSidePanelSkeleton";

type ScannerSidePanelProps = {
  asset?: ScannerAsset;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  timeframe: ScannerTimeframe;
};

export function ScannerSidePanel({
  asset,
  mobileOpen,
  onMobileOpenChange,
  timeframe,
}: ScannerSidePanelProps) {
  const { seriesByAssetId } = useLiveChartSeries({
    timeframe,
    seeds: asset?.assetId
      ? [
        {
          assetId: asset.assetId,
          instrumentId: asset.instrumentId ?? asset.chart[0]?.instrument_id,
          data: asset.chart,
        },
      ]
      : [],
  });

  const series = asset?.assetId
    ? seriesByAssetId.get(asset.assetId)
    : undefined;
  const klines = asset ? (series?.length ? series : asset.chart) : [];

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 80) onMobileOpenChange(false);
  }

  const bodyContent = asset ? (
    <ScannerSidePanelBody asset={asset} timeframe={timeframe} klines={klines} />
  ) : (
    <ScannerSidePanelSkeleton />
  );

  return (
    <>
      <aside className="hide-scrollbar hidden bg-[#040404] xl:sticky xl:top-28 xl:block xl:w-[350px] xl:max-h-[calc(100vh-7rem)] xl:shrink-0 xl:overflow-y-auto 2xl:w-[450px]">
        {bodyContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-white/8 bg-[#040404] p-3 sm:max-w-[460px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <SheetTitle className="sr-only">
            {asset ? `${asset.symbol} details` : "Scanner details"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Asset intelligence details for the selected scanner symbol.
          </SheetDescription>
          <div className="pr-10 xl:hidden">{bodyContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
