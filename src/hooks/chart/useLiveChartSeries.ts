import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/config";
import type { OHLCVExtended } from "@/types/ohlcv";

type LiveScannerCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  asset_volume: number;
  quote_volume: number;
};

type ChartCandleEvent = {
  asset_id: number;
  instrument_id?: string;
  symbol: string;
  timeframe: string;
  candle: LiveScannerCandle;
  is_live: boolean;
  updated_at: string;
};

type ChartSeed = {
  assetId: number;
  instrumentId?: string;
  data: OHLCVExtended[];
};

type UseLiveChartSeriesParams = {
  enabled?: boolean;
  timeframe: string;
  seeds: ChartSeed[];
};

function getWsNamespaceUrl() {
  if (!API_URL) return null;

  return new URL("/ws", API_URL).toString();
}

function mapLiveCandleToOhlcv(
  assetId: number,
  instrumentId: string | undefined,
  candle: LiveScannerCandle,
): OHLCVExtended {
  return {
    asset_id: assetId,
    instrument_id: instrumentId,
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    analytics_updated_at: null,
    asset_volume: candle.asset_volume,
    quote_volume: candle.quote_volume,
    rel_vol_16p: null,
    rel_vol_96p: null,
    is_16p_breakout: false,
    is_16p_breakdown: false,
    is_96p_breakout: false,
    is_96p_breakdown: false,
    ema9: null,
    ema20: null,
    macd_signal: null,
    macd_line: null,
    macd_histogram: null,
  };
}

function mergeCandleIntoSeries(
  current: OHLCVExtended[],
  incoming: OHLCVExtended,
): OHLCVExtended[] {
  if (current.length === 0) {
    return [incoming];
  }

  const existingIndex = current.findIndex(
    (candle) => candle.time === incoming.time,
  );

  if (existingIndex >= 0) {
    return current.map((candle, index) =>
      index === existingIndex ? { ...candle, ...incoming } : candle,
    );
  }

  const lastCandle = current[current.length - 1];

  if (lastCandle.time > incoming.time) {
    return current;
  }

  const next = [...current, incoming];
  const maxPoints = current.length;
  return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
}

function buildRoomName(timeframe: string, instrumentId: string) {
  return `chart:${timeframe}:${instrumentId}`;
}

export function useLiveChartSeries({
  enabled = true,
  timeframe,
  seeds,
}: UseLiveChartSeriesParams) {
  const [seriesByAssetId, setSeriesByAssetId] = useState<
    Map<number, OHLCVExtended[]>
  >(new Map());
  const socketRef = useRef<Socket | null>(null);
  const roomNamesRef = useRef<string[]>([]);
  const assetIdByInstrumentIdRef = useRef<Map<string, number>>(new Map());
  const seedKeyByAssetIdRef = useRef<Map<number, string>>(new Map());
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const roomNames = useMemo(
    () =>
      seeds
        .map((seed) => seed.instrumentId)
        .filter((instrumentId): instrumentId is string => Boolean(instrumentId))
        .sort((left, right) => left.localeCompare(right))
        .map((instrumentId) => buildRoomName(timeframe, instrumentId)),
    [seeds, timeframe],
  );

  useEffect(() => {
    roomNamesRef.current = roomNames;
  }, [roomNames]);

  useEffect(() => {
    assetIdByInstrumentIdRef.current = new Map(
      seeds
        .filter((seed): seed is ChartSeed & { instrumentId: string } =>
          Boolean(seed.instrumentId),
        )
        .map((seed) => [seed.instrumentId, seed.assetId]),
    );

    setSeriesByAssetId((current) => {
      const next = new Map<number, OHLCVExtended[]>();
      const nextSeedKeyByAssetId = new Map<number, string>();

      for (const seed of seeds) {
        const seedKey = `${timeframe}:${seed.assetId}:${seed.instrumentId ?? ""}`;
        const previousSeedKey = seedKeyByAssetIdRef.current.get(seed.assetId);

        nextSeedKeyByAssetId.set(seed.assetId, seedKey);
        next.set(
          seed.assetId,
          previousSeedKey === seedKey
            ? (current.get(seed.assetId) ?? seed.data)
            : seed.data,
        );
      }

      seedKeyByAssetIdRef.current = nextSeedKeyByAssetId;
      return next;
    });
  }, [seeds, timeframe]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socketUrl = getWsNamespaceUrl();

    if (!socketUrl) {
      return;
    }

    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    const syncRooms = (nextRoomNames: string[]) => {
      const previousRooms = subscribedRoomsRef.current;
      const nextRooms = new Set(nextRoomNames);

      for (const room of previousRooms) {
        if (!nextRooms.has(room)) {
          socket.emit("unsubscribe", room);
        }
      }

      for (const room of nextRooms) {
        if (!previousRooms.has(room)) {
          socket.emit("subscribe", room);
        }
      }

      subscribedRoomsRef.current = nextRooms;
    };

    const handleChartCandle = (payload: ChartCandleEvent) => {
      if (payload.timeframe !== timeframe) {
        return;
      }

      if (!payload.instrument_id) {
        return;
      }

      const assetId = assetIdByInstrumentIdRef.current.get(
        payload.instrument_id,
      );

      if (assetId === undefined) {
        return;
      }

      const nextCandle = mapLiveCandleToOhlcv(
        assetId,
        payload.instrument_id,
        payload.candle,
      );

      setSeriesByAssetId((current) => {
        if (!current.has(assetId)) {
          return current;
        }

        const next = new Map(current);
        next.set(
          assetId,
          mergeCandleIntoSeries(current.get(assetId) ?? [], nextCandle),
        );
        return next;
      });
    };

    socket.on("chart.candle.v1", handleChartCandle);
    socket.on("connect", () => {
      syncRooms(roomNamesRef.current);
    });

    if (socket.connected) {
      syncRooms(roomNamesRef.current);
    }

    return () => {
      socket.off("chart.candle.v1", handleChartCandle);

      for (const room of subscribedRoomsRef.current) {
        socket.emit("unsubscribe", room);
      }

      subscribedRoomsRef.current = new Set();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, timeframe]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!enabled || !socket?.connected) {
      return;
    }

    const previousRooms = subscribedRoomsRef.current;
    const nextRooms = new Set(roomNames);

    for (const room of previousRooms) {
      if (!nextRooms.has(room)) {
        socket.emit("unsubscribe", room);
      }
    }

    for (const room of nextRooms) {
      if (!previousRooms.has(room)) {
        socket.emit("subscribe", room);
      }
    }

    subscribedRoomsRef.current = nextRooms;
  }, [enabled, roomNames]);

  return {
    seriesByAssetId,
  };
}
