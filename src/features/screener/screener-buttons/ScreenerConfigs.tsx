import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, Eye, EyeOff, Filter } from "lucide-react";

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
export type ScreenerProfile = "day-trading" | "swing-trading";
export type RefreshInterval = "manual" | "5s" | "10s" | "30s" | "1m" | "5m";
export type SortPreset =
  | "top-gainers"
  | "top-losers"
  | "highest-volume"
  | "most-volatile";

const timeframes: { value: Timeframe; label: string }[] = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "1 day" },
];

const profiles: { value: ScreenerProfile; label: string }[] = [
  { value: "day-trading", label: "Day Trading" },
  { value: "swing-trading", label: "Swing Trading" },
];

const refreshIntervals: { value: RefreshInterval; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "5s", label: "5 seconds" },
  { value: "10s", label: "10 seconds" },
  { value: "30s", label: "30 seconds" },
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
];

const sortPresets: { value: SortPreset; label: string }[] = [
  { value: "top-gainers", label: "Top Gainers" },
  { value: "top-losers", label: "Top Losers" },
  { value: "highest-volume", label: "Highest Volume" },
  { value: "most-volatile", label: "Most Volatile" },
];

// Column keys that can be toggled
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
  onTimeframeChange?: (timeframe: Timeframe) => void;
  onProfileChange?: (profile: ScreenerProfile) => void;
  onRefreshIntervalChange?: (interval: RefreshInterval) => void;
  onSortPresetChange?: (preset: SortPreset) => void;
  onColumnVisibilityChange?: (columns: ColumnKey[]) => void;
  onFiltersChange?: (filters: FilterValues) => void;
}

export function ScreenerConfigs({
  timeframe = "1h",
  profile = "day-trading",
  refreshInterval = "manual",
  onTimeframeChange,
  onProfileChange,
  onRefreshIntervalChange,
  onSortPresetChange,
  onColumnVisibilityChange,
  onFiltersChange,
}: ScreenerConfigsProps) {
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>(timeframe);
  const [selectedProfile, setSelectedProfile] =
    useState<ScreenerProfile>(profile);
  const [selectedRefreshInterval, setSelectedRefreshInterval] =
    useState<RefreshInterval>(refreshInterval);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    "price",
    "change_1m",
    "change_5m",
    "change_15m",
    "change_1h",
    "change_4h",
    "volume_1d",
    "volume_delta_1m",
    "volume_delta_5m",
    "volume_delta_1h",
    "volume_delta_4h",
  ]);
  const [filters, setFilters] = useState<FilterValues>({});
  const [showFilters, setShowFilters] = useState(false);

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

  const handleSortPreset = (preset: SortPreset) => {
    onSortPresetChange?.(preset);
  };

  const handleColumnToggle = (column: ColumnKey) => {
    const newVisibleColumns = visibleColumns.includes(column)
      ? visibleColumns.filter((c) => c !== column)
      : [...visibleColumns, column];
    setVisibleColumns(newVisibleColumns);
    onColumnVisibilityChange?.(newVisibleColumns);
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    const newFilters = { ...filters, [key]: numValue };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const selectedTimeframeLabel =
    timeframes.find((t) => t.value === selectedTimeframe)?.label ||
    selectedTimeframe;
  const selectedProfileLabel =
    profiles.find((p) => p.value === selectedProfile)?.label || selectedProfile;
  const selectedRefreshLabel =
    refreshIntervals.find((r) => r.value === selectedRefreshInterval)?.label ||
    selectedRefreshInterval;

  const columnLabels: Record<ColumnKey, string> = {
    price: "Price",
    change_1m: "1m %",
    change_5m: "5m %",
    change_15m: "15m %",
    change_1h: "1h %",
    change_4h: "4h %",
    volume_1d: "Volume 1d",
    volume_delta_1m: "Volume Δ 1m",
    volume_delta_5m: "Volume Δ 5m",
    volume_delta_1h: "Volume Δ 1h",
    volume_delta_4h: "Volume Δ 4h",
  };

  return (
    <div className="border-b border-border min-h-26">
      {/* Main Controls Row */}
      <div className="flex justify-between items-center gap-4 flex-wrap p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Chart timeframe:
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 text-sm">
                    {selectedTimeframeLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuLabel>Chart Timeframe</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedTimeframe}
                    onValueChange={(value) =>
                      handleTimeframeChange(value as Timeframe)
                    }
                  >
                    {timeframes.map((tf) => (
                      <DropdownMenuRadioItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Profile:
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 text-sm">
                  {selectedProfileLabel}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Screener Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedProfile}
                  onValueChange={(value) =>
                    handleProfileChange(value as ScreenerProfile)
                  }
                >
                  {profiles.map((p) => (
                    <DropdownMenuRadioItem key={p.value} value={p.value}>
                      {p.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Refresh:
            </label>
            <Button variant="outline" className="h-8 w-8 text-sm">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 text-sm">
                  {selectedRefreshLabel}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>Auto Refresh</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedRefreshInterval}
                  onValueChange={(value) =>
                    handleRefreshIntervalChange(value as RefreshInterval)
                  }
                >
                  {refreshIntervals.map((r) => (
                    <DropdownMenuRadioItem key={r.value} value={r.value}>
                      {r.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* <div>
          <div className="flex items-center gap-2 ml-auto">
            {sortPresets.map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-border hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSortPreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div> */}

        {/* <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Chart timeframe:
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 text-sm">
                    {selectedTimeframeLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuLabel>Chart Timeframe</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedTimeframe}
                    onValueChange={(value) =>
                      handleTimeframeChange(value as Timeframe)
                    }
                  >
                    {timeframes.map((tf) => (
                      <DropdownMenuRadioItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Refresh:
              </label>
              <Button variant="outline" className="h-8 w-8 text-sm">
                <RefreshCw className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 text-sm">
                    {selectedRefreshLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuLabel>Auto Refresh</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedRefreshInterval}
                    onValueChange={(value) =>
                      handleRefreshIntervalChange(value as RefreshInterval)
                    }
                  >
                    {refreshIntervals.map((r) => (
                      <DropdownMenuRadioItem key={r.value} value={r.value}>
                        {r.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Profile:
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 text-sm">
                    {selectedProfileLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Screener Profile</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedProfile}
                    onValueChange={(value) =>
                      handleProfileChange(value as ScreenerProfile)
                    }
                  >
                    {profiles.map((p) => (
                      <DropdownMenuRadioItem key={p.value} value={p.value}>
                        {p.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div> */}

        {/* Column Visibility Toggle */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-sm">
              {visibleColumns.length === Object.keys(columnLabels).length ? (
                <Eye className="mr-2 h-3 w-3" />
              ) : (
                <EyeOff className="mr-2 h-3 w-3" />
              )}
              Columns
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Show Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(columnLabels) as ColumnKey[]).map((column) => (
              <DropdownMenuCheckboxItem
                key={column}
                checked={visibleColumns.includes(column)}
                onCheckedChange={() => handleColumnToggle(column)}
              >
                {columnLabels[column]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Filters Toggle */}
        {/* <Button
          variant={showFilters ? "default" : "outline"}
          className="h-8 text-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-3 w-3" />
          Filters
        </Button> */}
      </div>

      {/* Filters Row */}
      {/* {showFilters && (
        <div className="flex items-center gap-4 p-4 border-t border-border bg-muted/30 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              Min Price:
            </label>
            <Input
              type="number"
              placeholder="0"
              className="h-8 w-24 text-sm"
              value={filters.minPrice || ""}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              Max Price:
            </label>
            <Input
              type="number"
              placeholder="∞"
              className="h-8 w-24 text-sm"
              value={filters.maxPrice || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              Min Volume:
            </label>
            <Input
              type="number"
              placeholder="0"
              className="h-8 w-24 text-sm"
              value={filters.minVolume || ""}
              onChange={(e) => handleFilterChange("minVolume", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              Min Performance %:
            </label>
            <Input
              type="number"
              placeholder="-∞"
              className="h-8 w-24 text-sm"
              value={filters.minPerformance || ""}
              onChange={(e) =>
                handleFilterChange("minPerformance", e.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              Max Performance %:
            </label>
            <Input
              type="number"
              placeholder="+∞"
              className="h-8 w-24 text-sm"
              value={filters.maxPerformance || ""}
              onChange={(e) =>
                handleFilterChange("maxPerformance", e.target.value)
              }
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs ml-auto"
            onClick={() => {
              setFilters({});
              onFiltersChange?.({});
            }}
          >
            Clear Filters
          </Button>
        </div>
      )} */}
    </div>
  );
}
