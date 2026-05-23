import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchFieldProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function SearchField({ search, onSearchChange }: SearchFieldProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2 sm:max-w-[200px]">
      <Search className="h-3.5 w-3.5 shrink-0 text-[oklch(0.42_0_0)]" />
      <Input
        aria-label="Filter symbol"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="filter symbol..."
        className="h-7 rounded-[4px] border-white/8 bg-[#0d0d0d] px-2.5 font-mono text-[0.7rem] text-[oklch(0.85_0_0)] placeholder:text-[oklch(0.42_0_0)]"
      />
    </div>
  );
}
