import { AnalyticsBreakoutHours } from "@/features/analytics/AnalyticsBreakoutHours";
import { AnalyticsBtcCorrelation } from "@/features/analytics/AnalyticsBtcCorrelation";
import { AnalyticsHourlyMovers } from "@/features/analytics/AnalyticsHourlyMovers";
import { AnalyticsVolume } from "@/features/analytics/AnalyticsVolume";

export function AnalyticsPage() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-8 max-w-7xl mx-auto">
      <AnalyticsVolume />
      <AnalyticsHourlyMovers />
      <AnalyticsBtcCorrelation />
      <AnalyticsBreakoutHours />
    </div>
  );
}
