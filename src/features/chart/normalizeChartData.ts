import type { Time } from "lightweight-charts";

type TimedChartPoint = {
  time: Time;
};

const getTimeValue = (time: Time): number =>
  typeof time === "number" ? time : Number.NaN;

export const normalizeChartData = <T extends TimedChartPoint>(
  data: T[],
): T[] => {
  const byTime = new Map<number, T>();

  for (const item of data) {
    const time = getTimeValue(item.time);

    if (!Number.isFinite(time)) continue;

    byTime.set(time, item);
  }

  return [...byTime.entries()]
    .sort(([timeA], [timeB]) => timeA - timeB)
    .map(([, item]) => item);
};
