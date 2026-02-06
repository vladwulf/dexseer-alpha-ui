import { ChartCandlestick } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useMemo, useState } from "react";
import { useBacktestStore } from "./store/backtest.store";
import { Button } from "@/components/ui/button";

export function AssetSearch() {
  const [currentAssetIndex, setCurrentAssetIndex] = useState<number>(0);
  const [asset, setAsset] = useState<string>("");
  const { availableAssets, setSelectedAsset, isLoadingAssets } =
    useBacktestStore();

  const selectedAssets = useMemo(() => {
    if (asset.length === 0) return [];
    return availableAssets.filter((_asset) =>
      _asset.includes(asset.toUpperCase())
    );
  }, [asset, availableAssets]);

  function handlePreviousAsset() {
    if (currentAssetIndex > 0) {
      const index = currentAssetIndex - 1;
      setSelectedAsset(availableAssets[index]);
      setCurrentAssetIndex(index);
    }
  }

  function handleNextAsset() {
    if (currentAssetIndex < availableAssets.length - 1) {
      const index = currentAssetIndex + 1;
      setSelectedAsset(availableAssets[index]);
      setCurrentAssetIndex(index);
    }
  }

  return (
    <div>
      <Command className="rounded-lg border shadow-md md:min-w-[450px]">
        <CommandInput
          placeholder="Type a command or search..."
          value={asset}
          onValueChange={(value) => setAsset(value)}
        />
        <CommandList>
          {asset.length > 0 && <CommandEmpty>No results found.</CommandEmpty>}
          {isLoadingAssets && (
            <CommandGroup heading="Loading...">
              <CommandItem disabled>Loading assets...</CommandItem>
            </CommandGroup>
          )}
          {asset.length > 0 && (
            <CommandGroup heading="Assets">
              {selectedAssets.map((assetOption) => (
                <CommandItem
                  key={assetOption}
                  onSelect={() => {
                    setSelectedAsset(assetOption);
                    setCurrentAssetIndex(availableAssets.indexOf(assetOption));
                    setAsset("");
                  }}
                >
                  <ChartCandlestick />
                  <span>{assetOption}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandSeparator />
        </CommandList>
      </Command>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={handlePreviousAsset}>
          Previous Asset
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextAsset}>
          Next Asset
        </Button>
      </div>
    </div>
  );
}
