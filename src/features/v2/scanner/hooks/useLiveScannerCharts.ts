import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/config";
import type { OHLCVExtended } from "@/types/ohlcv";
import { mapScannerCandlesToOhlcv } from "../lib/apiAdapters";
import type {
  ScannerBatchChartsResponse,
  ScannerChartTimeframe,
  ScannerDetailsChartResponse,
} from "./scanner.api";

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
  timeframe: ScannerChartTimeframe;
  candle: LiveScannerCandle;
  is_live: boolean;
  updated_at: string;
};

type UseLiveScannerChartsParams = {
  timeframe: ScannerChartTimeframe;
  tableAssetIds: number[];
  tableCharts?: ScannerBatchChartsResponse;
  selectedAssetId?: number;
  detailsChart?: ScannerDetailsChartResponse;
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

function buildRoomName(timeframe: ScannerChartTimeframe, assetId: number) {
  return `chart:${timeframe}:${assetId}`;
}

export function useLiveScannerCharts({
  timeframe,
  tableAssetIds,
  tableCharts,
  selectedAssetId,
  detailsChart,
}: UseLiveScannerChartsParams) {
  const [tableChartSeriesByAssetId, setTableChartSeriesByAssetId] = useState<
    Map<number, OHLCVExtended[]>
  >(new Map());
  const [detailsChartSeries, setDetailsChartSeries] =
    useState<OHLCVExtended[]>();
  const socketRef = useRef<Socket | null>(null);
  const roomNamesRef = useRef<string[]>([]);
  const selectedAssetIdRef = useRef<number | undefined>(selectedAssetId);
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const roomNames = useMemo(() => {
    const assetIds = new Set(tableAssetIds);

    if (selectedAssetId !== undefined) {
      assetIds.add(selectedAssetId);
    }

    return [...assetIds]
      .sort((left, right) => left - right)
      .map((assetId) => buildRoomName(timeframe, assetId));
  }, [selectedAssetId, tableAssetIds, timeframe]);

  useEffect(() => {
    roomNamesRef.current = roomNames;
  }, [roomNames]);

  useEffect(() => {
    selectedAssetIdRef.current = selectedAssetId;
  }, [selectedAssetId]);

  useEffect(() => {
    if (!tableCharts) {
      setTableChartSeriesByAssetId(new Map());
      return;
    }

    setTableChartSeriesByAssetId(
      new Map(
        tableCharts.assets
          .filter((assetChart) => assetChart.status === "ok")
          .map((assetChart) => [
            assetChart.asset_id,
            mapScannerCandlesToOhlcv(assetChart.asset_id, assetChart.candles),
          ]),
      ),
    );
  }, [tableCharts]);

  useEffect(() => {
    if (!detailsChart || detailsChart.asset_id !== selectedAssetId) {
      setDetailsChartSeries(undefined);
      return;
    }

    setDetailsChartSeries(
      mapScannerCandlesToOhlcv(detailsChart.asset_id, detailsChart.candles),
    );
  }, [detailsChart, selectedAssetId]);

  useEffect(() => {
    const socketUrl = getWsNamespaceUrl();

    if (!socketUrl) {
      return;
    }

    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    const handleChartCandle = (payload: ChartCandleEvent) => {
      if (payload.timeframe !== timeframe) {
        return;
      }

      const nextCandle = mapLiveCandleToOhlcv(payload.asset_id, payload.candle);

      setTableChartSeriesByAssetId((current) => {
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

      if (payload.asset_id === selectedAssetIdRef.current) {
        setDetailsChartSeries((current) =>
          current === undefined
            ? current
            : mergeCandleIntoSeries(current, nextCandle),
        );
      }
    };

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
  }, [timeframe]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket?.connected) {
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
  }, [roomNames]);

  return {
    detailsChartSeries,
    tableChartSeriesByAssetId,
  };
}
