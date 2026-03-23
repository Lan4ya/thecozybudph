import { useContext } from "react";
import { ProductQueryStateContext } from "@/providers/ProductQueryProvider";

export const useProductsFilterAndSortState = () => {
  const ctx = useContext(ProductQueryStateContext);
  if (!ctx)
    throw new Error(
      "useProductQueryState must be used within ProductQueryProvider",
    );
  return ctx;
};
