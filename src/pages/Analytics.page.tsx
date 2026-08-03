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
    <main className="analytics-page">
      <header className="analytics-page__header page-intro-card">
        <div>
          <p className="analytics-page__eyebrow">Market intelligence</p>
          <h1>Intelligence</h1>
        </div>
        <p>
          Market activity, momentum, and relative-strength signals across the
          perpetuals universe.
        </p>
      </header>

      <div className="analytics-page__dashboard">
        <section className="analytics-page__widget analytics-page__widget--wide">
          <AnalyticsVolume />
        </section>
        <section className="analytics-page__widget analytics-page__widget--half">
          <AnalyticsTimeframeMovers />
        </section>
        <section className="analytics-page__widget analytics-page__widget--half">
          <AnalyticsPerformanceDistriubtion />
        </section>
        <section className="analytics-page__widget analytics-page__widget--half">
          <AnalyticsBtcCorrelation />
        </section>
        <section className="analytics-page__widget analytics-page__widget--half">
          <AnalyticsBreakoutHours />
        </section>
        <section className="analytics-page__widget analytics-page__widget--wide">
          <AnalyticsRunners />
        </section>
        <section className="analytics-page__widget analytics-page__widget--wide analytics-page__widget--heatmap">
          <ScannerMomentumHeatmap
            selectedSymbol=""
            onSelectSymbol={(symbol) => navigate(`/assets/${symbol}`)}
          />
        </section>
      </div>
    </main>
  );
}
