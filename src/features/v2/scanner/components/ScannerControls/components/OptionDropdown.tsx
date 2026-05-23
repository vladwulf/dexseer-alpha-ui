import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OptionDropdownProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onValueChange: (value: T) => void;
};

export function OptionDropdown<T extends string>({
  label,
  options,
  value,
  onValueChange,
}: OptionDropdownProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex cursor-pointer items-center gap-[5px] whitespace-nowrap rounded-[4px] border border-transparent bg-transparent px-[9px] py-[3px] font-mono text-[0.7rem] font-medium tracking-[0.05em] text-[oklch(0.48_0_0)] transition-all duration-150",
          )}
        >
          {label}
          <ChevronDown size={11} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) => onValueChange(nextValue as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              className="font-mono text-[0.7rem]"
            >
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
