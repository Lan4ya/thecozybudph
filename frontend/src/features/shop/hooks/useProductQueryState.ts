import { useContext } from "react";
import { ProductQueryStateContext } from "@/providers/ProductQueryProvider";

export const useProductQueryState = () => {
  const ctx = useContext(ProductQueryStateContext);
  if (!ctx) throw new Error("useFilters must used inside FilterContext");
  return ctx;
};
