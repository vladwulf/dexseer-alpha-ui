import type { CSSProperties } from "react";

export const chipBase: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  fontWeight: 500,
  letterSpacing: "0.05em",
  padding: "6px 12px",
  borderRadius: "999px",
  cursor: "pointer",
  border: "1px solid oklch(1 0 0 / 10%)",
  transition: "all 0.12s",
  background: "transparent",
  color: "oklch(0.78 0 0)",
  whiteSpace: "nowrap",
};

export const chipActive: CSSProperties = {
  ...chipBase,
  color: "oklch(0.98 0 0)",
  background: "oklch(0.72 0.18 248)",
  border: "1px solid oklch(0.72 0.18 248)",
};

export const chipDropdown: CSSProperties = {
  ...chipBase,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};
