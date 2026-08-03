import { useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ScannerAsset, ScannerTimeframe } from "../../types";
import { ActiveAssetPanel } from "../ActiveAssetPanel/ActiveAssetPanel";
import { ScannerSidePanelBody } from "./components/ScannerSidePanelBody";
import { ScannerSidePanelSkeleton } from "./components/ScannerSidePanelSkeleton";

type ScannerSidePanelProps = {
  asset?: ScannerAsset;
  liveUpdatesEnabled?: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  timeframe: ScannerTimeframe;
};

export function ScannerSidePanel({
  asset,
  liveUpdatesEnabled,
  mobileOpen,
  onMobileOpenChange,
  timeframe,
}: ScannerSidePanelProps) {
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
    <ScannerSidePanelBody asset={asset} timeframe={timeframe} />
  ) : (
    <ScannerSidePanelSkeleton />
  );

  const mobileContent = asset ? (
    <>
      <ActiveAssetPanel
        asset={asset}
        liveUpdatesEnabled={liveUpdatesEnabled}
        timeframe={timeframe}
      />
      <ScannerSidePanelBody asset={asset} timeframe={timeframe} />
    </>
  ) : (
    <ScannerSidePanelSkeleton />
  );

  return (
    <>
      <aside className="hide-scrollbar hidden h-full min-h-0 bg-[#090b0d] xl:block xl:w-full xl:overflow-y-auto">
        {bodyContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-white/8 bg-[#090b0d] p-0 sm:max-w-[460px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <SheetTitle className="sr-only">
            {asset ? `${asset.symbol} details` : "Scanner details"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Asset intelligence details for the selected scanner symbol.
          </SheetDescription>
          <div className="min-h-full pb-6 xl:hidden">{mobileContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
