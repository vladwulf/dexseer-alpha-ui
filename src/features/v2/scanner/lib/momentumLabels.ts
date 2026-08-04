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

/** Pullbacks are persisted as event types alongside a generic momentum label. */
export function isMomentumPullback(alert: MomentumAlertSource) {
  return alert.trigger_values?.event_type === "pullback_entered";
}

/** Returns the event type used to filter scanner alerts. */
export function getMomentumAlertEventType(alert: MomentumAlertSource) {
  return isMomentumPullback(alert)
    ? "pullback_entered"
    : typeof alert.alert_type === "string"
      ? alert.alert_type
      : typeof alert.trigger_values?.event_type === "string"
        ? alert.trigger_values.event_type
        : undefined;
}

/** Uses the backend's descriptive label; legacy alerts retain their old fallback. */
export function getMomentumAlertLabel(alert: MomentumAlertSource) {
  if (isMomentumPullback(alert)) return "pullback";

  return (
    formatLabel(alert.momentum_label) ??
    formatLabel(alert.alert_type) ??
    formatLabel(alert.trigger_values?.event_type) ??
    formatLabel(alert.type) ??
    formatLabel(alert.strategy_id) ??
    "Momentum update"
  );
}
