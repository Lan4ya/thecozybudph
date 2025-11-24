import { useCallback, useMemo } from "react";
import { DropdownMenuItem } from "@/components/dropdown";
import { Check } from "lucide-react";
import { useFilters } from "../../hooks/useFilters";
import toggleArrItem from "@/lib/utils/toggleArrItem";
import {
  type ArrayFilterKeys,
  type Filters,
  type NonArrayFilterKeys,
  type PriceRangeOption,
} from "../../types";
import { arrayFilters } from "../../types";
import { formatPriceRange } from "./PriceRange";

type ArrayFilterProps<K extends ArrayFilterKeys> = {
  filterKey: K;
  filterVal: Extract<Filters[K], readonly unknown[]>[number];
};

type NonArrayFilterProps<K extends NonArrayFilterKeys> = {
  filterKey: K;
  filterVal: Filters[K];
};

type FilterDropdownMenuItemProps =
  | ArrayFilterProps<ArrayFilterKeys>
  | NonArrayFilterProps<NonArrayFilterKeys>;

// hoist icon
const CheckIcon = <Check className="text-white size-3.5" />;

export const FilterDropdownMenuItem = ({
  filterKey,
  filterVal,
}: FilterDropdownMenuItemProps) => {
  const { filters, setFilters } = useFilters();

  const isArr = useMemo(
    () => arrayFilters.includes(filterKey as ArrayFilterKeys),
    [filterKey],
  );

  const isItemActive = useMemo(() => {
    if (isArr) {
      const vals = filters[filterKey] as readonly unknown[] | undefined;
      return vals?.includes(filterVal);
    }

    return filters[filterKey] === filterVal;
  }, [filters, filterKey, filterVal]);

  const handleToggle = useCallback(() => {
    setFilters((prev) => {
      console.log("filterVal", filterVal);
      const curr = prev[filterKey];
      const updated = isArr
        ? toggleArrItem(curr as unknown[], filterVal)
        : filterVal === curr
          ? undefined
          : filterVal;

      const next = { ...prev, [filterKey]: updated };
      console.log("prev", prev.priceRange);
      console.log("next", next.priceRange);
      return next;
    });
  }, [filterKey, filterVal, isArr]);

  return (
    <DropdownMenuItem
      className="flex-between filter-dropdown-item-spacing focus:bg-input/30"
      onSelect={handleToggle}
    >
      {filterKey === "priceRange"
        ? formatPriceRange(filterVal as PriceRangeOption)
        : filterVal}
      {isItemActive && (
        <div className="grid place-items-center bg-accent rounded-full p-[1.5px] pr-[1.6px]">
          {CheckIcon}
        </div>
      )}
    </DropdownMenuItem>
  );
};
