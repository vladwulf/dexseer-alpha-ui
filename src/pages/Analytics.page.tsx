import { AnalyticsBreakoutHours } from "@/features/analytics/AnalyticsBreakoutHours";
import { AnalyticsBtcCorrelation } from "@/features/analytics/AnalyticsBtcCorrelation";
import { AnalyticsPerformanceDistriubtion } from "@/features/analytics/AnalyticsPerformanceDistriubtion";
import { AnalyticsRunners } from "@/features/analytics/AnalyticsRunners";
import { AnalyticsTimeframeMovers } from "@/features/analytics/AnalyticsTimeframeMovers";
import { AnalyticsVolume } from "@/features/analytics/AnalyticsVolume";

export function AnalyticsPage() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-8 max-w-7xl mx-auto">
      <AnalyticsVolume />
      <AnalyticsTimeframeMovers />
      <AnalyticsPerformanceDistriubtion />
      <AnalyticsBtcCorrelation />
      <AnalyticsBreakoutHours />
      <AnalyticsRunners />
    </div>
  );
}
