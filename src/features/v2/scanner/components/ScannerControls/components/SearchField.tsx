import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchFieldProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function SearchField({ search, onSearchChange }: SearchFieldProps) {
  return (
    <div className="flex w-full max-w-[320px] shrink-0 items-center gap-2 rounded-2xl">
      <Search className="h-4 w-4 shrink-0 text-white/35" />
      <Input
        aria-label="Filter symbol"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="filter symbol..."
        className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/30"
      />
    </div>
  );
}
