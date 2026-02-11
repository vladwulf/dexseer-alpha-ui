import { AlertsSidePanel } from "@/features/alerts-side-panel/AlertsSidePanel";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { FaqAccordion } from "@/features/faq/faq-accordion";
import { MarketMovers } from "@/features/market-movers/MarketMovers";
import { ScreenerConfigs } from "@/features/screener/screener-buttons/ScreenerConfigs";
import { ScreenerTable } from "@/features/screener/screener-table/ScreenerTable";
import { ScrollingBanner } from "@/features/scrolling-banner/ScrollingBanner";
import { useOneWayScrollLock } from "@/hooks/chart/misc/useOneWayScrollLock";

export function DashboardPage() {
  const hasScrolledPast = useOneWayScrollLock();

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        {!hasScrolledPast && <DashboardHeader />}
        <div className="min-h-screen px-4">
          <div className="h-16 p-4 container mx-auto">
            {hasScrolledPast && (
              <div className="flex items-center gap-4">
                <img src="/dexseer-logo2.png" className="h-16 w-16" />
                <h1 className="font-light text-xl">Dex Seer</h1>
              </div>
            )}
          </div>
          <div className="pb-10 pt-14">
            <div className="my-4">
              <MarketMovers />
            </div>

            <div className="my-10 container mx-auto">
              <ScrollingBanner />
            </div>

            <div className="mt-20">
              {/* <div className="border p-2 rounded-md">
                <h2 className="text-xl font-semibold">Screener Parameters</h2>
                <div className="my-4">
                  
                </div>
              </div> */}

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-9">
                  <ScreenerTable />
                </div>
                <div className="col-span-3">
                  <AlertsSidePanel />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <FaqAccordion />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
