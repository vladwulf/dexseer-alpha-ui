import { MarketMovers } from "@/features/market-movers/MarketMovers";
import { ScreenerTable } from "@/features/screener/screener-table/ScreenerTable";

export function DashboardPage() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-8">
      <div className="mb-8 hidden sm:block">
        <MarketMovers />
      </div>

      <div className="mt-4">
        <ScreenerTable />
      </div>
    </div>
  );
}
