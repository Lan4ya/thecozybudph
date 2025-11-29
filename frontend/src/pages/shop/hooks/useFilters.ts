import { useContext } from "react";
import { ProductQueryContext } from "@/providers/ProductQueryProvider";

export const useProductQuery = () => {
  const ctx = useContext(ProductQueryContext);
  if (!ctx) throw new Error("useFilters must used inside FilterContext");
  return ctx;
};
