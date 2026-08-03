import { MomentumAlertsPanel } from "@/features/v2/scanner/components/MomentumAlertsPanel";

export function AlertsPage() {
  return (
    <main className="terminal-alerts-page">
      <header className="terminal-alerts-page__header page-intro-card">
        <div>
          <p className="terminal-alerts-page__eyebrow">
            Live market intelligence
          </p>
          <h1>Alerts</h1>
        </div>
        <span>Select an alert to inspect its chart and trigger context.</span>
      </header>
      <MomentumAlertsPanel />
    </main>
  );
}
