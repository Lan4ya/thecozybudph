import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdownMenu } from "./FilterDropDownMenu";
import { FilterDropdownMenuItem } from "./FilterDropdownMenuItem";

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
    <FilterDropdownMenu
      dropdownType="collectionName"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCollections.map((collection) => (
        <FilterDropdownMenuItem
          key={collection}
          filterKey="collectionName"
          filterVal={collection}
        />
      ))}
    </FilterDropdownMenu>
  );
};

export default Collections;
