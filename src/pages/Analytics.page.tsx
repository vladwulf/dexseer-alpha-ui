import { useNavigate } from "react-router";
import { AnalyticsBreakoutHours } from "@/features/analytics/AnalyticsBreakoutHours";
import { AnalyticsBtcCorrelation } from "@/features/analytics/AnalyticsBtcCorrelation";
import { AnalyticsPerformanceDistriubtion } from "@/features/analytics/AnalyticsPerformanceDistriubtion";
import { AnalyticsRunners } from "@/features/analytics/AnalyticsRunners";
import { AnalyticsTimeframeMovers } from "@/features/analytics/AnalyticsTimeframeMovers";
import { AnalyticsVolume } from "@/features/analytics/AnalyticsVolume";
import { ScannerMomentumHeatmap } from "@/features/v2/scanner/components/ScannerMomentumHeatmap";

export function AnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 pb-16 pt-8 max-w-7xl mx-auto">
      <AnalyticsVolume />
      <AnalyticsTimeframeMovers />
      <AnalyticsPerformanceDistriubtion />
      <AnalyticsBtcCorrelation />
      <AnalyticsBreakoutHours />
      <AnalyticsRunners />
      <ScannerMomentumHeatmap
        selectedSymbol=""
        onSelectSymbol={(symbol) => navigate(`/assets/${symbol}`)}
      />
    </div>
  );
}
