import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/config";
import { getScannerPresetKey } from "../lib/apiAdapters";
import type { ScannerPreset } from "../types";
import type {
  MarketStripResponse,
  RunnersResponse,
  ScannerListTimeframe,
  ScannerPresetKey,
  ScannerResponse,
} from "./scanner.api";

type UseLiveScannerFeedParams = {
  preset: ScannerPreset;
  timeframe: ScannerListTimeframe;
};

const MARKET_STRIP_ROOM = "screener:stats:market-strip:v1";
const RUNNERS_ROOM = "screener:stats:runners:v1";

function getWsNamespaceUrl() {
  if (!API_URL) return null;

  return new URL("/ws", API_URL).toString();
}

function getScannerRoomName(preset: ScannerPreset) {
  return `screener:scanner:${getScannerPresetKey(preset)}:v1`;
}

function isScannerListQueryKey(value: unknown): value is [
  "scanner-v2-list",
  {
    preset?: ScannerPresetKey;
    timeframe?: ScannerListTimeframe;
    search?: string;
    limit?: number;
  },
] {
  if (!Array.isArray(value) || value[0] !== "scanner-v2-list") {
    return false;
  }

  const params = value[1];
  return typeof params === "object" && params !== null;
}

export function useLiveScannerFeed({
  preset,
  timeframe,
}: UseLiveScannerFeedParams) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const roomNames = useMemo(
    () => [MARKET_STRIP_ROOM, RUNNERS_ROOM, getScannerRoomName(preset)],
    [preset],
  );

  useEffect(() => {
    const socketUrl = getWsNamespaceUrl();

    if (!socketUrl) {
      return;
    }

    const socket = io(socketUrl);
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

    const handleMarketStrip = (payload: MarketStripResponse) => {
      queryClient.setQueriesData(
        { queryKey: ["scanner-v2-market-strip"] },
        payload,
      );
    };

    const handleRunners = (payload: RunnersResponse) => {
      queryClient.setQueriesData({ queryKey: ["scanner-v2-runners"] }, payload);
    };

    const handleScanner = (payload: ScannerResponse) => {
      for (const query of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["scanner-v2-list"] })) {
        if (!isScannerListQueryKey(query.queryKey)) {
          continue;
        }

        const [, params] = query.queryKey;
        const matchesPreset = params.preset === (payload.preset ?? undefined);
        const matchesTimeframe =
          params.timeframe === undefined || params.timeframe === timeframe;
        const matchesSearch =
          params.search === undefined || params.search.length === 0;

        if (!matchesPreset || !matchesTimeframe || !matchesSearch) {
          continue;
        }

        queryClient.setQueryData(query.queryKey, payload);
      }
    };

    socket.on("screener.stats.market-strip.v1", handleMarketStrip);
    socket.on("screener.stats.runners.v1", handleRunners);
    socket.on(
      `screener.scanner.${getScannerPresetKey(preset)}.v1`,
      handleScanner,
    );
    socket.on("connect", () => {
      syncRooms(roomNames);
    });

    if (socket.connected) {
      syncRooms(roomNames);
    }

    return () => {
      socket.off("screener.stats.market-strip.v1", handleMarketStrip);
      socket.off("screener.stats.runners.v1", handleRunners);
      socket.off(
        `screener.scanner.${getScannerPresetKey(preset)}.v1`,
        handleScanner,
      );

      for (const room of subscribedRoomsRef.current) {
        socket.emit("unsubscribe", room);
      }

      subscribedRoomsRef.current = new Set();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [preset, queryClient, roomNames, timeframe]);

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
}
