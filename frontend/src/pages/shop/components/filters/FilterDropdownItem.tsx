import { useCallback, useMemo } from "react";
import { DropdownMenuItem } from "../dropdown";
import { Check } from "lucide-react";
import { useProductQuery } from "../../hooks/useFilters";
import toggleArrItem from "@/lib/utils/toggleArrItem";
import {
  type ArrayFilterKeys,
  type FiltersDomain,
  type NonArrayFilterKeys,
  type PriceRangeOption,
} from "../../../../types";
import { arrayFiltersKeys } from "../../../../types";
import { formatPriceRange } from "./PriceRange";

type ArrayFilterProps<K extends ArrayFilterKeys> = {
  filterKey: K;
  filterVal: Extract<FiltersDomain[K], readonly unknown[]>[number];
};

type NonArrayFilterProps<K extends NonArrayFilterKeys> = {
  filterKey: K;
  filterVal: FiltersDomain[K];
};

type FilterDropdownItemProps =
  | ArrayFilterProps<ArrayFilterKeys>
  | NonArrayFilterProps<NonArrayFilterKeys>;

// hoist icon
const CheckIcon = <Check className="text-white size-3" />;

export const FilterDropdownItem = ({
  filterKey,
  filterVal,
}: FilterDropdownItemProps) => {
  const { productQuery, setProductQuery } = useProductQuery();

  const isArr = useMemo(
    () => arrayFiltersKeys.includes(filterKey as ArrayFilterKeys),
    [filterKey],
  );

  const isItemActive = useMemo(() => {
    if (isArr) {
      const vals = productQuery.filters?.[filterKey] as
        | readonly unknown[]
        | undefined;
      return vals?.includes(filterVal);
    }

    return productQuery.filters?.[filterKey] === filterVal;
  }, [productQuery, filterKey, filterVal]);

  const handleToggle = useCallback(() => {
    setProductQuery((prev) => {
      // console.log("filterVal", filterVal);

      const curr = prev.filters?.[filterKey];
      const updated = isArr
        ? toggleArrItem(curr as unknown[], filterVal)
        : filterVal === curr
          ? undefined
          : filterVal;

      const next = {
        ...prev,
        filters: {
          ...prev.filters,
          [filterKey]: updated,
        },
      };

      return next;
    });
  }, [filterKey, filterVal, isArr]);

  // Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quia, omnis perferendis aspernatur qui, assumenda reprehenderit possimus fugit debitis officiis, odit veritatis aliquam totam corrupti. Mollitia sunt cum et neque sequi?
  return (
    <DropdownMenuItem
      className="flex-between filter-dropdown-item-spacing focus:bg-input/30"
      onSelect={handleToggle}
    >
      {filterKey === "priceRange"
        ? formatPriceRange(filterVal as PriceRangeOption)
        : filterVal}
      {isItemActive && (
        <div className="grid place-items-center bg-accent rounded-full p-[1.2px] pr-[2.4px]">
          {CheckIcon}
        </div>
      )}
    </DropdownMenuItem>
  );
};
