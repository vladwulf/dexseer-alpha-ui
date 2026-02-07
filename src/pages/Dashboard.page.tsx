import { AlertsSidePanel } from "@/features/alerts-side-panel/AlertsSidePanel";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { FaqAccordion } from "@/features/faq/faq-accordion";
import { MarketMovers } from "@/features/market-movers/MarketMovers";
import { ScreenerConfigs } from "@/features/screener/screener-buttons/ScreenerConfigs";
import { ScreenerTable } from "@/features/screener/screener-table/ScreenerTable";
import { useOneWayScrollLock } from "@/hooks/chart/misc/useOneWayScrollLock";

export function DashboardPage() {
  const hasScrolledPast = useOneWayScrollLock();

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        {!hasScrolledPast && <DashboardHeader />}
        <div className="min-h-screen pt-20 container mx-auto">
          <div className="pb-10">
            <div className="my-4">
              <MarketMovers />
            </div>

            <div className="mt-20">
              {/* <div className="border p-2 rounded-md">
                <h2 className="text-xl font-semibold">Screener Parameters</h2>
                <div className="my-4">
                  <ScreenerConfigs />
                </div>
              </div> */}
              <div className="grid grid-cols-12">
                <div className="col-span-10">
                  <ScreenerTable />
                </div>
                <div className="col-span-2">
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
