import { useLocation, useSearchParams } from "react-router";
import { createContext, useCallback, useEffect, useMemo } from "react";
import type { ProductQueryDomain } from "@/types";
import { parseProductQueryParams } from "@/pages/shop/utils/parseProductQueryParams";

type ProductQueryStateContextType = {
  productQuery: ProductQueryDomain;
  setProductQuery: (
    updates:
      | Partial<ProductQueryDomain>
      | ((filters: ProductQueryDomain) => Partial<ProductQueryDomain>),
  ) => void;
  hasProductQueryFilters: boolean;
  clearProductQueryFilters: () => void;
};

export const ProductQueryStateContext =
  createContext<ProductQueryStateContextType | null>(null);

export function ProductQueryStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathname = useLocation().pathname;

  const productQuery: ProductQueryDomain =
    parseProductQueryParams(searchParams);

  // default sort search param
  useEffect(() => {
    if (!productQuery.sort && pathname === "/shop") {
      searchParams.set("sort", "Popularity");
      setSearchParams(searchParams);
    }
  }, [productQuery.sort, pathname]);

  const setProductQuery = useCallback(
    (
      updates:
        | Partial<ProductQueryDomain>
        | ((pq: ProductQueryDomain) => Partial<ProductQueryDomain>),
    ) => {
      const qp: ProductQueryDomain = parseProductQueryParams(searchParams);
      const nextQp = typeof updates === "function" ? updates(qp) : updates;

      // Handle filters
      if (nextQp.filters) {
        Object.entries(nextQp.filters).forEach(([key, val]) => {
          if (!val || (Array.isArray(val) && !val.length)) {
            searchParams.delete(key);
          }
          // else if (key === "priceRange") {
          //   searchParams.set(key, JSON.stringify(val));
          // }
          else if (Array.isArray(val)) {
            searchParams.delete(key);
            val.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.set(key, String(val));
          }
        });
      }

      // Handle sort
      if (nextQp.sort) {
        searchParams.set("sort", nextQp.sort);
      }

      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearProductQueryFilters = useCallback(() => {
    const qp = parseProductQueryParams(searchParams);

    if (qp.filters) {
      Object.keys(qp.filters).forEach((key) => {
        searchParams.delete(key);
      });
    }

    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const hasProductQueryFilters = useMemo(() => {
    const { filters } = productQuery;
    if (!filters) return false;
    return Object.values(filters).some((v) =>
      Array.isArray(v) ? v.length > 0 : Boolean(v),
    );
  }, [productQuery.filters]);

  const value = useMemo(
    () => ({
      productQuery,
      setProductQuery,
      hasProductQueryFilters,
      clearProductQueryFilters,
    }),
    [productQuery, setProductQuery, clearProductQueryFilters],
  );

  return (
    <ProductQueryStateContext.Provider value={value}>
      {children}
    </ProductQueryStateContext.Provider>
  );
}
