import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdown } from "./FilterDropDown";
import { FilterDropdownItem } from "./FilterDropdownItem";
import { useQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import type { ProductsCategoryData } from "@TheCozyBud/schema";

const Categories = () => {
  const [inputValue, setInputValue] = useState("");

  const {
    data: categories,
    error,
    isLoading,
  } = useQuery<ProductsCategoryData[]>({
    queryKey: ["product_categories"],
    queryFn: ProductAPI.getCategories,
  });

  if (error && !isLoading) throw error;

  const filteredCategories = useMemo(() => {
    return searchSubstring(categories ?? [], inputValue, (item) => item.name);
  }, [inputValue, categories]);

  return (
    <FilterDropdown
      dropdownType="categories"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCategories.map((category) => (
        <FilterDropdownItem
          key={category.id}
          filterKey="categories"
          filterVal={category.name}
        />
      ))}
    </FilterDropdown>
  );
};

export default Categories;
