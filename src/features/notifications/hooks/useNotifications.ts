import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "@/config";
import { getMomentumAlertLabel } from "@/features/v2/scanner/lib/momentumLabels";

const STORAGE_KEY = "dexseer.notifications";
const MAX_NOTIFICATIONS = 50;

export type Notification = {
  id: string;
  createdAt: string;
  isRead: boolean;
  title: string;
  description: string;
};

type AlertEventPayload = {
  id: string;
  created_at?: string;
  time?: string;
  triggered_at?: string;
  timeframe?: string;
  direction: string;
  type: string;
  alert_type?: string;
  momentum_label?: string;
  strategyId?: string;
  triggerValues?: {
    event_type?: string;
    is_confirmed?: number | boolean;
  };
  instrument: {
    instrument_symbol: string;
  };
};

function readNotifications(): Notification[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (notification): notification is Notification =>
        typeof notification?.id === "string" &&
        typeof notification?.createdAt === "string" &&
        typeof notification?.isRead === "boolean" &&
        typeof notification?.title === "string" &&
        typeof notification?.description === "string",
    );
  } catch {
    return [];
  }
}

function toNotification(alert: AlertEventPayload): Notification {
  const symbol = alert.instrument.instrument_symbol;
  const timeframe = alert.timeframe ? ` · ${alert.timeframe}` : "";

  const isMomentumIntelligence = alert.strategyId?.startsWith(
    "momentum-intelligence-",
  );
  const confirmation =
    alert.triggerValues?.is_confirmed === 1 ||
    alert.triggerValues?.is_confirmed === true
      ? "closed candle"
      : "provisional";

  return {
    id: alert.id,
    createdAt:
      alert.triggered_at ??
      alert.time ??
      alert.created_at ??
      new Date().toISOString(),
    isRead: false,
    title: `${symbol} ${alert.direction.toUpperCase()}`,
    description: isMomentumIntelligence
      ? `${getMomentumAlertLabel({
          momentum_label: alert.momentum_label,
          alert_type: alert.alert_type,
          type: alert.type,
          trigger_values: alert.triggerValues,
          strategy_id: alert.strategyId,
        })}${timeframe} · ${confirmation}`
      : `${alert.type.replaceAll("_", " ")}${timeframe}`,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState(readNotifications);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Local storage can be unavailable or full; the in-memory notifications still work.
    }
  }, [notifications]);

  useEffect(() => {
    if (!API_URL) return;

    const socket = io(new URL("/ws", API_URL).toString(), {
      transports: ["websocket"],
    });
    const handleAlertCreated = (payload: AlertEventPayload) => {
      const notification = toNotification(payload);

      setNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) return current;
        return [notification, ...current].slice(0, MAX_NOTIFICATIONS);
      });
    };

    socket.on("alert.created", handleAlertCreated);
    socket.on("connect", () => socket.emit("subscribe", "alerts"));
    if (socket.connected) socket.emit("subscribe", "alerts");

    return () => {
      socket.off("alert.created", handleAlertCreated);
      socket.emit("unsubscribe", "alerts");
      socket.disconnect();
    };
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.isRead)
      .length,
    markAllAsRead,
    clearNotifications,
  };
}
