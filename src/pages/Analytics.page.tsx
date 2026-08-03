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
        <div className="analytics-page__title-block">
          <p className="analytics-page__eyebrow">
            <span className="analytics-page__live-dot" /> Market intelligence
          </p>
          <h1>Intelligence desk</h1>
          <p className="analytics-page__lede">
            Read the market’s rhythm before it becomes a move.
          </p>
        </div>
        <div className="analytics-page__header-aside">
          <p>
            Market activity, momentum, and relative-strength signals across the
            perpetuals universe.
          </p>
          <span className="analytics-page__utc-label">All times in UTC</span>
        </div>
      </header>

      <nav className="analytics-page__jump-nav" aria-label="Analytics areas">
        <a href="#liquidity">Liquidity rhythm</a>
        <a href="#momentum">Momentum scan</a>
        <a href="#behaviour">Market behaviour</a>
        <a href="#opportunities">Opportunity radar</a>
      </nav>

      <div className="analytics-page__dashboard">
        <section
          className="analytics-page__widget analytics-page__widget--wide"
          id="liquidity"
        >
          <AnalyticsVolume />
        </section>
        <section
          className="analytics-page__widget analytics-page__widget--half"
          id="momentum"
        >
          <AnalyticsTimeframeMovers />
        </section>
        <section className="analytics-page__widget analytics-page__widget--half">
          <AnalyticsPerformanceDistriubtion />
        </section>
        <section
          className="analytics-page__widget analytics-page__widget--half"
          id="behaviour"
        >
          <AnalyticsBtcCorrelation />
        </section>
        <section className="analytics-page__widget analytics-page__widget--half">
          <AnalyticsBreakoutHours />
        </section>
        <section
          className="analytics-page__widget analytics-page__widget--wide"
          id="opportunities"
        >
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
