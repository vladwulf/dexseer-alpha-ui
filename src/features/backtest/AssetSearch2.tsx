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
import { useState } from "react";
import { useGetAssets } from "./hooks/useGetAssets";

type Props = {
  onSelect: (assetId: number) => void;
};
export const AssetSearch2: React.FC<Props> = ({ onSelect }) => {
  const [openSearch, setOpenSearch] = useState<boolean>(false);
  const [asset, setAsset] = useState<string>("");
  const { data: assets, isLoading: isLoadingAssets } = useGetAssets(asset);

  return (
    <div>
      <Command className="rounded-lg border shadow-md md:min-w-[450px]">
        <CommandInput
          onFocus={() => setOpenSearch(true)}
          placeholder="Type a command or search..."
          value={asset}
          onValueChange={(value) => setAsset(value)}
        />
        <CommandList>
          {assets?.data && assets?.data.length > 0 && (
            <CommandGroup heading="Assets">
              {assets.data.map((a) => (
                <CommandItem
                  key={a.id}
                  onSelect={() => {
                    onSelect(a.id);
                    setAsset("");
                    setOpenSearch(false);
                  }}
                >
                  <ChartCandlestick />
                  <span>{a.symbol}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {openSearch &&
            asset.length > 0 &&
            assets?.data &&
            assets.data.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          {isLoadingAssets && (
            <CommandGroup heading="Loading...">
              <CommandItem disabled>Loading assets...</CommandItem>
            </CommandGroup>
          )}
          <CommandSeparator />
        </CommandList>
      </Command>
    </div>
  );
};
