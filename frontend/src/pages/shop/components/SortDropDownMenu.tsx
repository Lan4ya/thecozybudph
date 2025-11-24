import * as React from "react";

import { Button } from "@/lib/ui/__shadcn__/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/ui/__shadcn__/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import { useFilters } from "../hooks/useFilters";
import type { SortOption } from "../types";
import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";

export function SortDropdownMenu() {
  const { setFilters } = useFilters();
  const [sortOpt, setSortOpt] = React.useState<SortOption>("Popularity");
  const focusStyle = "focus:bg-input/30 focus:text-accent-foreground";

  const handleToggle = React.useCallback(
    (value: SortOption) => {
      setSortOpt(value);

      setFilters((prev) => {
        const curr = prev.sort;
        const next = curr === value ? undefined : value;
        return { ...prev, sort: next };
      });
    },
    [setFilters],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="minimal" size="lg">
          <ArrowUpDown className="text-muted-foreground" /> {sortOpt}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioItem
          value="Popularity"
          className={focusStyle}
          onSelect={() => handleToggle("Popularity")}
        >
          Popularity
        </DropdownMenuRadioItem>

        <DropdownMenuRadioGroup value={sortOpt} onValueChange={handleToggle}>
          <DropdownMenuRadioItem value="Most Recent" className={focusStyle}>
            Most Recent
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="Highest Price" className={focusStyle}>
            Highest Price
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="Lowest Price" className={focusStyle}>
            Lowest Price
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
