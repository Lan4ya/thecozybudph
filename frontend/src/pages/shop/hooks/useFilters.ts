import { useContext } from "react";
import { FilterContext } from "@/providers/FilterProvider";

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must used inside FilterContext");
  return ctx;
};
