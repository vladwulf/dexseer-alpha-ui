export const numberFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const getChangeTone = (value: number) =>
  value > 0 ? "text-[#5dc887]" : value < 0 ? "text-[#e35561]" : "text-white/45";

export const formatSigned = (value: number | null, suffix = "%") =>
  value === null
    ? "—"
    : `${value > 0 ? "+" : ""}${numberFormat.format(value)}${suffix}`;

export const formatFundingRate = (value: number | null) => {
  if (value === null) return "—";

  const percentage = value * 100;
  return `${percentage > 0 ? "+" : ""}${percentage.toFixed(4)}%`;
};

export const formatCompactUsd = (value: number | null) => {
  if (value === null) return "—";

  return `$${formatCompactNumber(value)}`;
};

export const formatCompactNumber = (value: number | null) => {
  if (value === null) return "—";

  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
};

export const formatPrice = (value: number | null) => {
  if (value === null) return "—";

  if (value < 1) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 6,
    });
  }

  return numberFormat.format(value);
};
