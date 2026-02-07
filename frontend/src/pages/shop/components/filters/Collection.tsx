import searchSubstring from "@/lib/utils/searchSubstring";
import { useMemo, useState } from "react";
import { FilterDropdown } from "./FilterDropDown";
import { FilterDropdownItem } from "./FilterDropdownItem";
import { ProductAPI } from "@/services/api/products";
import { useQuery } from "@tanstack/react-query";
import type { GetCollectionResponse } from "@TheCozyBud/types";

const Collections = () => {
  const [inputValue, setInputValue] = useState("");
  const {
    data: collections,
    error,
    isLoading,
  } = useQuery<GetCollectionResponse[]>({
    queryKey: ["product_colletions"],
    queryFn: ProductAPI.getCollections,
  });

  const filteredCollections = useMemo(() => {
    return searchSubstring(collections ?? [], inputValue, (item) => item.name);
  }, [inputValue, collections]);

  if (error && !isLoading) {
    // console.error(error);
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
