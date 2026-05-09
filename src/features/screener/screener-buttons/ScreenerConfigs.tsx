import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Search, ChevronDown } from "lucide-react";

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";
export type ScreenerProfile = "day-trading" | "swing-trading";
export type RefreshInterval = "manual" | "5s" | "10s" | "30s" | "1m" | "5m";
export type ScreenerDensity = "compact" | "extended";
export type SortPreset =
  | "top-gainers"
  | "top-losers"
  | "highest-volume"
  | "most-volatile";

const timeframes: { value: Timeframe; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1d" },
];

const refreshIntervals: { value: RefreshInterval; label: string }[] = [
  { value: "manual", label: "Off" },
  { value: "5s", label: "5s" },
  { value: "10s", label: "10s" },
  { value: "30s", label: "30s" },
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
];

export type ColumnKey =
  | "price"
  | "change_1m"
  | "change_5m"
  | "change_15m"
  | "change_1h"
  | "change_4h"
  | "volume_1d"
  | "volume_delta_1m"
  | "volume_delta_5m"
  | "volume_delta_1h"
  | "volume_delta_4h";

export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  minPerformance?: number;
  maxPerformance?: number;
}

interface ScreenerConfigsProps {
  timeframe?: Timeframe;
  profile?: ScreenerProfile;
  refreshInterval?: RefreshInterval;
  density?: ScreenerDensity;
  assetNameFilter?: string;
  isRefreshing?: boolean;
  onTimeframeChange?: (timeframe: Timeframe) => void;
  onProfileChange?: (profile: ScreenerProfile) => void;
  onRefreshIntervalChange?: (interval: RefreshInterval) => void;
  onDensityChange?: (density: ScreenerDensity) => void;
  onAssetNameFilterChange?: (value: string) => void;
  onManualRefresh?: () => void;
  onSortPresetChange?: (preset: SortPreset) => void;
  onColumnVisibilityChange?: (columns: ColumnKey[]) => void;
  onFiltersChange?: (filters: FilterValues) => void;
}

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.58rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "oklch(0.42 0 0)",
  whiteSpace: "nowrap",
};

const chipBase: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  fontWeight: 500,
  letterSpacing: "0.05em",
  padding: "3px 9px",
  borderRadius: "4px",
  cursor: "pointer",
  border: "1px solid transparent",
  transition: "all 0.12s",
  background: "transparent",
  color: "oklch(0.48 0 0)",
};

const chipActive: React.CSSProperties = {
  ...chipBase,
  color: "oklch(0.72 0.18 248)",
  background: "oklch(0.72 0.18 248 / 12%)",
  border: "1px solid oklch(0.72 0.18 248 / 30%)",
};

export function ScreenerConfigs({
  timeframe = "15m",
  profile = "day-trading",
  refreshInterval = "manual",
  density = "compact",
  assetNameFilter = "",
  isRefreshing = false,
  onTimeframeChange,
  onProfileChange,
  onRefreshIntervalChange,
  onDensityChange,
  onAssetNameFilterChange,
  onManualRefresh,
}: ScreenerConfigsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(timeframe);
  const [selectedProfile, setSelectedProfile] = useState<ScreenerProfile>(profile);
  const [selectedRefreshInterval, setSelectedRefreshInterval] = useState<RefreshInterval>(refreshInterval);
  const [selectedDensity, setSelectedDensity] = useState<ScreenerDensity>(density);

  useEffect(() => { setSelectedTimeframe(timeframe); }, [timeframe]);
  useEffect(() => { setSelectedRefreshInterval(refreshInterval); }, [refreshInterval]);
  useEffect(() => { setSelectedDensity(density); }, [density]);

  const handleTimeframeChange = (value: Timeframe) => {
    setSelectedTimeframe(value);
    onTimeframeChange?.(value);
  };

  const handleProfileChange = (value: ScreenerProfile) => {
    setSelectedProfile(value);
    onProfileChange?.(value);
  };

  const handleRefreshIntervalChange = (value: RefreshInterval) => {
    setSelectedRefreshInterval(value);
    onRefreshIntervalChange?.(value);
  };

  const handleDensityToggle = (isExtended: boolean) => {
    const next: ScreenerDensity = isExtended ? "extended" : "compact";
    setSelectedDensity(next);
    onDensityChange?.(next);
  };

  const selectedRefreshLabel =
    refreshIntervals.find((r) => r.value === selectedRefreshInterval)?.label ?? selectedRefreshInterval;
  const isExtended = selectedDensity === "extended";

  const divider = (
    <div style={{ width: 1, height: 16, background: "oklch(1 0 0 / 8%)", flexShrink: 0 }} />
  );

  return (
    <div
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 7%)",
        padding: "10px 16px",
      }}
    >
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="flex items-center gap-2">
          <span style={monoLabel}>Search</span>
          <div className="relative">
            <Search
              size={11}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "oklch(0.42 0 0)",
                pointerEvents: "none",
              }}
            />
            <Input
              placeholder="BTC, ETH…"
              value={assetNameFilter}
              onChange={(e) => onAssetNameFilterChange?.(e.target.value)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                height: 28,
                width: 120,
                paddingLeft: 24,
                background: "oklch(0.1 0 0)",
                border: "1px solid oklch(1 0 0 / 8%)",
                borderRadius: 4,
                color: "oklch(0.85 0 0)",
              }}
            />
          </div>
        </div>

        {divider}

        {/* Timeframe chips */}
        <div className="flex items-center gap-2">
          <span style={monoLabel}>Timeframe</span>
          <div className="flex items-center gap-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                type="button"
                onClick={() => handleTimeframeChange(tf.value)}
                style={selectedTimeframe === tf.value ? chipActive : chipBase}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {divider}

        {/* Profile toggle */}
        <div className="flex items-center gap-2">
          <span style={monoLabel}>Profile</span>
          <div
            className="flex items-center"
            style={{
              background: "oklch(0.1 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: 4,
              padding: 2,
              gap: 2,
            }}
          >
            {(["day-trading", "swing-trading"] as ScreenerProfile[]).map((p) => {
              const label = p === "day-trading" ? "Day" : "Swing";
              const active = selectedProfile === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProfileChange(p)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.06em",
                    padding: "2px 10px",
                    borderRadius: 3,
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.12s",
                    background: active ? "oklch(0.72 0.18 248 / 15%)" : "transparent",
                    color: active ? "oklch(0.72 0.18 248)" : "oklch(0.45 0 0)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {divider}

        {/* Refresh */}
        <div className="flex items-center gap-2">
          <span style={monoLabel}>Refresh</span>
          <button
            type="button"
            onClick={onManualRefresh}
            aria-label="Refresh"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: 4,
              border: "1px solid oklch(1 0 0 / 8%)",
              background: "oklch(0.1 0 0)",
              cursor: "pointer",
              color: "oklch(0.48 0 0)",
              transition: "color 0.12s, border-color 0.12s",
            }}
          >
            <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  height: 26,
                  padding: "0 8px",
                  borderRadius: 4,
                  border: "1px solid oklch(1 0 0 / 8%)",
                  background: selectedRefreshInterval !== "manual"
                    ? "oklch(0.72 0.18 248 / 10%)"
                    : "oklch(0.1 0 0)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  color: selectedRefreshInterval !== "manual"
                    ? "oklch(0.72 0.18 248)"
                    : "oklch(0.48 0 0)",
                  transition: "all 0.12s",
                }}
              >
                {selectedRefreshLabel}
                <ChevronDown size={10} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuLabel
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em" }}
              >
                Auto Refresh
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedRefreshInterval}
                onValueChange={(v) => handleRefreshIntervalChange(v as RefreshInterval)}
              >
                {refreshIntervals.map((r) => (
                  <DropdownMenuRadioItem
                    key={r.value}
                    value={r.value}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                  >
                    {r.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {divider}

        {/* Extended toggle */}
        <div className="flex items-center gap-2">
          <span style={monoLabel}>Extended</span>
          <button
            type="button"
            role="switch"
            aria-checked={isExtended}
            onClick={() => handleDensityToggle(!isExtended)}
            style={{
              position: "relative",
              display: "inline-flex",
              height: 18,
              width: 32,
              alignItems: "center",
              borderRadius: 9,
              border: `1px solid ${isExtended ? "oklch(0.72 0.18 248 / 50%)" : "oklch(1 0 0 / 12%)"}`,
              background: isExtended ? "oklch(0.72 0.18 248 / 15%)" : "oklch(0.1 0 0)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                display: "inline-block",
                height: 12,
                width: 12,
                borderRadius: "50%",
                transform: isExtended ? "translateX(16px)" : "translateX(2px)",
                background: isExtended ? "oklch(0.72 0.18 248)" : "oklch(0.35 0 0)",
                transition: "transform 0.15s, background 0.15s",
              }}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
