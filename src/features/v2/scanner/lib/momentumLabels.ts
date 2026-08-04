type MomentumAlertSource = {
  momentum_label?: unknown;
  alert_type?: unknown;
  type?: unknown;
  strategy_id?: unknown;
  trigger_values?: Record<string, unknown>;
};

const formatLabel = (value: unknown) =>
  typeof value === "string" && value.length > 0
    ? value.replaceAll("_", " ")
    : undefined;

/** Uses the backend's descriptive label; legacy alerts retain their old fallback. */
export function getMomentumAlertLabel(alert: MomentumAlertSource) {
  return (
    formatLabel(alert.momentum_label) ??
    formatLabel(alert.alert_type) ??
    formatLabel(alert.trigger_values?.event_type) ??
    formatLabel(alert.type) ??
    formatLabel(alert.strategy_id) ??
    "Momentum update"
  );
}
