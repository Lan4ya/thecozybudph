import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdown } from "./FilterDropDown";
import { FilterDropdownItem } from "./FilterDropdownItem";

const collections = [
  "Whispering Garden",
  "Moonlight Sonata",
  "Forest Evergreen",
];

const Collections = () => {
  const [inputValue, setInputValue] = useState("");

  const filteredCollections = useMemo(() => {
    return searchSubstring(collections, inputValue);
  }, [inputValue]);

  return (
    <FilterDropdown
      dropdownType="collectionName"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCollections.map((collection) => (
        <FilterDropdownItem
          key={collection}
          filterKey="collectionName"
          filterVal={collection}
        />
      ))}
    </FilterDropdown>
  );
};

export default Collections;
