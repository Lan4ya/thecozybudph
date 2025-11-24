import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdownMenu } from "./FilterDropDownMenu";
import { FilterDropdownMenuItem } from "./FilterDropdownMenuItem";
import { CATEGORIES } from "../../types";

const Categories = () => {
  const [inputValue, setInputValue] = useState("");

  const filteredCategories = useMemo(() => {
    return searchSubstring([...CATEGORIES], inputValue);
  }, [inputValue]);

  return (
    <FilterDropdownMenu
      dropdownType="categories"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCategories.map((category) => (
        <FilterDropdownMenuItem
          key={category}
          filterKey="categories"
          filterVal={category}
        />
      ))}
    </FilterDropdownMenu>
  );
};

export default Categories;
