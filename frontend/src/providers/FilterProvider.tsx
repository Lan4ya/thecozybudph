import { useSearchParams } from "react-router";
import { createContext, useCallback, useMemo } from "react";
import type {
  Filters,
  Category,
  SortOption,
  PriceRange,
} from "@/pages/shop/types";

type FilterContextType = {
  filters: Filters;
  setFilters: (
    updates: Partial<Filters> | ((filters: Filters) => Partial<Filters>),
  ) => void;
  hasFilters: boolean;
  clearFilters: () => void;
};

export const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Filters = useMemo(() => {
    return {
      search: searchParams.get("search") || undefined,
      categories: searchParams.getAll("categories").length
        ? (searchParams.getAll("categories") as Category[])
        : undefined,
      collectionName: searchParams.getAll("collectionName").length
        ? (searchParams.getAll("collectionName") as Filters["collectionName"])
        : undefined,
      priceRange: searchParams.get("priceRange") as PriceRange,
      sort: (searchParams.get("sort") as SortOption) || undefined,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (updates: Partial<Filters> | ((filters: Filters) => Partial<Filters>)) => {
      // Rebuild current filters from searchParams
      const currentFilters: Filters = {
        search: searchParams.get("search") || undefined,
        categories: searchParams.getAll("categories").length
          ? (searchParams.getAll("categories") as Category[])
          : undefined,
        collectionName: searchParams.getAll("collectionName").length
          ? (searchParams.getAll("collectionName") as Filters["collectionName"])
          : undefined,
        priceRange: searchParams.get("priceRange") as PriceRange,
        sort: (searchParams.get("sort") as SortOption) || undefined,
      };

      console.log("filters in setFilters", filters.categories);
      const next =
        typeof updates === "function" ? updates(currentFilters) : updates;

      Object.entries(next).forEach(([key, val]) => {
        const isArrVal = Array.isArray(val);
        if (!val || (isArrVal && !val.length)) {
          searchParams.delete(key);
          return;
        }

        if (key === "priceRange") {
          const serialized = val as Filters["priceRange"];
          if (serialized) {
            searchParams.set(key, serialized);
          } else {
            searchParams.delete(key);
          }
          return;
        }

        if (isArrVal) {
          searchParams.delete(key); // needed avoid duplication
          val.forEach((v) => searchParams.append(key, v));
        } else if (val != undefined && typeof val === "string") {
          searchParams.set(key, val);
        }
      });

      setSearchParams(searchParams, { replace: true });
    },
    [filters],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, []);

  const hasFilters = useMemo(
    (): boolean =>
      Object.values(filters).some((v) =>
        Array.isArray(v) ? v.length > 0 : Boolean(v),
      ),
    [filters],
  );

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      hasFilters,
      clearFilters,
    }),
    [filters, setFilters, clearFilters],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function parsePriceRange(s: string | null) {
  if (!s) return undefined;

  if (s.endsWith("+")) {
    const min = Number(s.slice(0, -1));
    if (!Number.isFinite(min) || min < 0 || min > 1_000_000) return undefined;
    return { min };
  }

  // Handle "min-max"
  const parts = s.split("-");
  if (parts.length !== 2) return undefined;

  const [min, max] = parts.map(Number);

  // Validate both numbers
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min < 0 ||
    max < 0 ||
    max < min ||
    min > 1_000_000 ||
    max > 1_000_000
  ) {
    return undefined;
  }

  return { min, max };
}
