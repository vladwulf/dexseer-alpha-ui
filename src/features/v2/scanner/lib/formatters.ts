export const numberFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const getChangeTone = (value: number) =>
  value > 0 ? "text-[#5dc887]" : value < 0 ? "text-[#e35561]" : "text-white/45";

export const formatSigned = (value: number, suffix = "%") =>
  `${value > 0 ? "+" : ""}${numberFormat.format(value)}${suffix}`;

export const formatPrice = (value: number) => {
  if (value < 0.001) {
    return value.toFixed(7);
  }

  if (value < 1) {
    return value.toFixed(4);
  }

  return numberFormat.format(value);
};
