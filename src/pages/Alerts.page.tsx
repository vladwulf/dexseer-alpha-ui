import { MomentumAlertsPanel } from "@/features/v2/scanner/components/MomentumAlertsPanel";

export function AlertsPage() {
  return (
    <main className="terminal-screen terminal-alerts-page">
      <div className="terminal-container">
        <div className="terminal-workspace">
          <MomentumAlertsPanel />
        </div>
      </div>
    </main>
  );
}
