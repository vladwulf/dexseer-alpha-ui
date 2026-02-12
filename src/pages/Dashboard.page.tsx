import { AlertsSidePanel } from "@/features/alerts-side-panel/AlertsSidePanel";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { FaqAccordion } from "@/features/faq/faq-accordion";
import { MarketMovers } from "@/features/market-movers/MarketMovers";
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
                <img src="/dexseer-logo3.svg" className="h-12 w-12" />
                <div className="relative">
                  <h1 className="font-base text-xl text-gray-200">Dex Seer</h1>
                  <span className="font-light text-xs absolute -bottom-1 -right-10 text-green-300">
                    alpha
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="pb-10 pt-14">
            <div className="my-4 hidden sm:block">
              <MarketMovers />
            </div>

            <div className="my-10 container mx-auto">
              <ScrollingBanner />
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-12 md:col-span-7 lg:col-span-8 xl:col-span-9">
                  <ScreenerTable />
                </div>
                <div className="col-span-12 sm:col-span-12 md:col-span-5 lg:col-span-4 xl:col-span-3">
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
