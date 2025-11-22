import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdownMenu } from "./FilterDropDownMenu";
import { FilterDropdownMenuItem } from "./FilterDropdownMenuItem";
import type { PriceRangeOption } from "../../types";

const PRICE_RANGES: PriceRangeOption[] = [
  "0-2000",
  "2000-4000",
  "4000-6000",
  "6000-8000",
  "8000-10000",
  "10000+",
];

export const formatPriceRange = (range: PriceRangeOption) => {
  console.log("formatPriceRange input:", range);
  if (!PRICE_RANGES.includes(range)) return undefined;

  if (range.endsWith("+")) {
    const min = Number(range.slice(0, -1));
    return `₱${min.toLocaleString()}+`;
  }

  const [minStr, maxStr] = range.split("-");
  const min = Number(minStr);
  const max = Number(maxStr);
  return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
};

const PriceRange = () => {
  const [inputValue, setInputValue] = useState("");

  const filteredPriceRanges = useMemo(() => {
    return searchSubstring(PRICE_RANGES, inputValue);
  }, [inputValue]);

  return (
    <FilterDropdownMenu
      dropdownType="priceRange"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredPriceRanges.map((range) => (
        <FilterDropdownMenuItem
          key={range}
          filterKey="priceRange"
          filterVal={range}
        />
      ))}
    </FilterDropdownMenu>
  );
};

export default PriceRange;
