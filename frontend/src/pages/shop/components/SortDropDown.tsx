import * as React from "react";

import { Button } from "@/lib/ui/__shadcn__/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/ui/__shadcn__/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import { useProductsFilterAndSortState } from "../hooks/useProductsFilterAndSortState";
import type { ProductSortOption } from "../../../types";
import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";

export function SortDropdownMenu() {
  const { productQuery, setProductQuery } = useProductsFilterAndSortState();
  const [sortOpt, setSortOpt] = React.useState<ProductSortOption>(
    productQuery.sort ?? "Popularity",
  );
  const focusStyle = "focus:bg-input/30 focus:text-accent-foreground";

  const handleToggle = React.useCallback(
    (value: ProductSortOption) => {
      setSortOpt(value);

      setProductQuery((prev) => {
        const curr = prev.sort;
        const next = curr === value ? undefined : value;
        return { ...prev, sort: next };
      });
    },
    [setProductQuery],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="minimal" size="lg" className="w-40 border">
          <ArrowUpDown className="text-muted-foreground" /> {sortOpt}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={sortOpt} onValueChange={handleToggle}>
          <DropdownMenuRadioItem value="Popularity" className={focusStyle}>
            Popularity
          </DropdownMenuRadioItem>

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
