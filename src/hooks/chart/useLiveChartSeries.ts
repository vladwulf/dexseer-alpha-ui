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
  symbol: string;
  timeframe: string;
  candle: LiveScannerCandle;
  is_live: boolean;
  updated_at: string;
};

type ChartSeed = {
  assetId: number;
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
  candle: LiveScannerCandle,
): OHLCVExtended {
  return {
    asset_id: assetId,
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

function buildRoomName(timeframe: string, assetId: number) {
  return `chart:${timeframe}:${assetId}`;
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
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const roomNames = useMemo(
    () =>
      seeds
        .map((seed) => seed.assetId)
        .sort((left, right) => left - right)
        .map((assetId) => buildRoomName(timeframe, assetId)),
    [seeds, timeframe],
  );

  useEffect(() => {
    roomNamesRef.current = roomNames;
  }, [roomNames]);

  useEffect(() => {
    setSeriesByAssetId(new Map(seeds.map((seed) => [seed.assetId, seed.data])));
  }, [seeds]);

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

      const nextCandle = mapLiveCandleToOhlcv(payload.asset_id, payload.candle);

      setSeriesByAssetId((current) => {
        if (!current.has(payload.asset_id)) {
          return current;
        }

        const next = new Map(current);
        next.set(
          payload.asset_id,
          mergeCandleIntoSeries(
            current.get(payload.asset_id) ?? [],
            nextCandle,
          ),
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
