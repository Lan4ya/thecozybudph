import { useCallback, useMemo } from "react";
import { DropdownMenuItem } from "../custom-base-dropdown";
import { Check } from "lucide-react";
import { useProductsFilterAndSortState } from "../../hooks/useProductsFilterAndSortState";
import toggleArrItem from "@/lib/utils/toggleArrItem";
import {
  type ArrayFilterKeys,
  type ProductFiltersDomain,
  type NonArrayFilterKeys,
  type ProductPriceRangeOption,
} from "../../../../types";
import { arrayFiltersKeys } from "../../../../types";
import { formatPriceRange } from "./PriceRange";

type ArrayFilterProps<K extends ArrayFilterKeys> = {
  filterKey: K;
  filterVal: Extract<ProductFiltersDomain[K], readonly unknown[]>[number];
};

type NonArrayFilterProps<K extends NonArrayFilterKeys> = {
  filterKey: K;
  filterVal: ProductFiltersDomain[K];
};

type FilterDropdownItemProps =
  | ArrayFilterProps<ArrayFilterKeys>
  | NonArrayFilterProps<NonArrayFilterKeys>;

export const FilterDropdownItem = ({
  filterKey,
  filterVal,
}: FilterDropdownItemProps) => {
  const { productQuery, setProductQuery } = useProductsFilterAndSortState();

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

  const handleSelect = useCallback(() => {
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

  return (
    <DropdownMenuItem
      className="flex-between filter-dropdown-item-spacing"
      onSelect={handleSelect}
      onMouseDown={(e) => e.preventDefault()} // Keep input focused; prevents "Any" flicker
    >
      {filterKey === "priceRange"
        ? formatPriceRange(filterVal as ProductPriceRangeOption)
        : filterVal}
      {isItemActive && <Check className="size-4" />}
    </DropdownMenuItem>
  );
};
