import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/config";
import { getScannerPresetKey } from "../lib/apiAdapters";
import type { ScannerPreset } from "../types";
import type {
  ScannerPresetKey,
  ScannerResponse,
  ScannerSortBy,
  ScannerSortDirection,
} from "./scanner.api";

type UseLiveScannerFeedParams = {
  preset: ScannerPreset;
};

function getWsNamespaceUrl() {
  if (!API_URL) return null;

  return new URL("/ws", API_URL).toString();
}

function getScannerRoomName(preset: ScannerPreset) {
  if (preset === "Classic Rolling") {
    return null;
  }

  return `screener:scanner:${getScannerPresetKey(preset)}:v1`;
}

function getScannerEventName(preset: ScannerPreset) {
  if (preset === "Classic Rolling") {
    return null;
  }

  return `screener.scanner.${getScannerPresetKey(preset)}.v1`;
}

function isScannerListQueryKey(value: unknown): value is [
  "scanner-v2-list",
  {
    preset?: ScannerPresetKey;
    search?: string;
    limit?: number;
    sort_by?: ScannerSortBy;
    sort_direction?: ScannerSortDirection;
  },
] {
  if (!Array.isArray(value) || value[0] !== "scanner-v2-list") {
    return false;
  }

  const params = value[1];
  return typeof params === "object" && params !== null;
}

export function useLiveScannerFeed({ preset }: UseLiveScannerFeedParams) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const subscribedRoomsRef = useRef<Set<string>>(new Set());
  const roomNames = useMemo(() => {
    const roomName = getScannerRoomName(preset);

    return roomName ? [roomName] : [];
  }, [preset]);
  const eventName = useMemo(() => getScannerEventName(preset), [preset]);

  useEffect(() => {
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

    const handleScanner = (payload: ScannerResponse) => {
      for (const query of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["scanner-v2-list"] })) {
        if (!isScannerListQueryKey(query.queryKey)) {
          continue;
        }

        const [, params] = query.queryKey;
        const matchesPreset = params.preset === (payload.preset ?? undefined);
        const matchesSearch =
          params.search === undefined || params.search.length === 0;
        const matchesSort =
          params.sort_by === undefined ||
          (params.sort_by === payload.sort_by &&
            params.sort_direction === payload.sort_direction);

        if (!matchesPreset || !matchesSearch || !matchesSort) {
          continue;
        }

        queryClient.setQueryData(query.queryKey, payload);
      }
    };

    if (eventName) {
      socket.on(eventName, handleScanner);
    }

    socket.on("connect", () => {
      syncRooms(roomNames);
    });

    if (socket.connected) {
      syncRooms(roomNames);
    }

    return () => {
      if (eventName) {
        socket.off(eventName, handleScanner);
      }

      for (const room of subscribedRoomsRef.current) {
        socket.emit("unsubscribe", room);
      }

      subscribedRoomsRef.current = new Set();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventName, queryClient, roomNames]);

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
