import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdown } from "./FilterDropDown";
import { FilterDropdownItem } from "./FilterDropdownItem";
import { CATEGORIES } from "../../types";

const Categories = () => {
  const [inputValue, setInputValue] = useState("");

  const filteredCategories = useMemo(() => {
    return searchSubstring([...CATEGORIES], inputValue);
  }, [inputValue]);

  return (
    <FilterDropdown
      dropdownType="categories"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCategories.map((category) => (
        <FilterDropdownItem
          key={category}
          filterKey="categories"
          filterVal={category}
        />
      ))}
    </FilterDropdown>
  );
};

export default Categories;
