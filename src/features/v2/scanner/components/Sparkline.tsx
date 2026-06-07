export function Sparkline({ values }: { values: number[] }) {
  const width = 88;
  const height = 28;
  const normalizedValues = values.length >= 2 ? values : [14, 14];
  const max = Math.max(...normalizedValues);
  const min = Math.min(...normalizedValues);
  const range = Math.max(max - min, 1);

  const points = normalizedValues
    .map((value, index) => {
      const x = (index / (normalizedValues.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-label="Sparkline"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      className="block h-7 w-[88px] overflow-hidden"
    >
      <title>Sparkline</title>
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
