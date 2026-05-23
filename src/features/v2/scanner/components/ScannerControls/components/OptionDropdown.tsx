import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chipDropdown } from "./styles";

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
        <button type="button" style={chipDropdown}>
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
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
            >
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
