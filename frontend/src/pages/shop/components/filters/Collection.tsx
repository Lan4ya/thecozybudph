import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdown } from "./FilterDropdown";
import { FilterDropdownItem } from "./FilterDropdownItem";
import { useCollectionsQuery } from "../../hooks/useCollectionsQuery";

const Collections = () => {
  const [inputValue, setInputValue] = useState("");
  const { collections, error, isLoading } = useCollectionsQuery();

  const filteredCollections = useMemo(() => {
    return searchSubstring(collections ?? [], inputValue, (item) => item.name);
  }, [inputValue, collections]);

  if (error && !isLoading) {
    return (
      <FilterDropdown
        dropdownType="collectionNames"
        inputValue={inputValue}
        setInputValue={setInputValue}
      >
        <div></div>
      </FilterDropdown>
    );
  }

  return (
    <FilterDropdown
      dropdownType="collectionNames"
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      {filteredCollections.map((collection) => (
        <FilterDropdownItem
          key={collection.id}
          filterKey="collectionNames"
          filterVal={collection.name}
        />
      ))}
    </FilterDropdown>
  );
};

export default Collections;
