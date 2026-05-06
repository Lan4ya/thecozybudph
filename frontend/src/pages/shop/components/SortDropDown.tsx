import * as React from "react";

import { Button } from "@/lib/ui/__shadcn__/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/lib/ui/__shadcn__/dropdown-menu";
import { ArrowUpDown, Check } from "lucide-react";
import { useProductsFilterAndSortState } from "../hooks/useProductsFilterAndSortState";
import type { ProductSortOption } from "../../../types";
import { cn } from "@/lib/utils/cn";

const options: ProductSortOption[] = [
  "Popularity",
  "Most Recent",
  "Highest Price",
  "Lowest Price",
];

export function SortDropdownMenu() {
  const { productQuery, setProductQuery } = useProductsFilterAndSortState();
  const [sortOpt, setSortOpt] = React.useState<ProductSortOption>(
    productQuery.sort ?? "Popularity",
  );

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
          <ArrowUpDown className="size-3.5 text-muted-foreground" /> {sortOpt}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Sort by
          </DropdownMenuLabel>

          {options.map((option) => {
            const active = sortOpt === option;

            return (
              <DropdownMenuItem
                key={option}
                onSelect={() => handleToggle(option)}
                className={cn(
                  "cursor-pointer",
                  "focus:bg-accent focus:text-accent-foreground",
                  // active && "bg-accent text-accent-foreground font-medium",
                )}
              >
                <span className="flex-1">{option}</span>

                {active && <Check className="size-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
