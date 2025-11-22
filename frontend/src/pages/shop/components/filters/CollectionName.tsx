import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdownMenu } from "./FilterDropDownMenu";
import { FilterDropdownMenuItem } from "./FilterDropdownMenuItem";
import { CATEGORIES } from "../../types";

const CollectionName = () => {
  const [inputValue, setInputValue] = useState("");

  const filteredCategories = useMemo(() => {
    return searchSubstring([...CATEGORIES], inputValue);
  }, [inputValue]);

  return (
    <FilterDropdownMenu
      dropdownType="collectionName"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCategories.map((categories) => (
        <FilterDropdownMenuItem
          key={categories}
          filterKey="collectionName"
          filterVal={categories}
        />
      ))}
    </FilterDropdownMenu>
  );
};

export default CollectionName;
