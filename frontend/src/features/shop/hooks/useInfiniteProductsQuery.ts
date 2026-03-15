import { ProductAPI } from "@/api/product";
import type { ProductFilters } from "@/types";
import {
  type QueryFunctionContext,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useProductQueryState } from "./useProductQueryState";
import { useCollectionsQuery } from "./useCollectionsQuery";
import { useCategoriesQuery } from "./useCategoriesQuery";

export const useInfiniteProductsQuery = () => {
  const { productQuery, hasProductQueryFilters } = useProductQueryState();

  const { categories } = useCategoriesQuery();
  const { collections } = useCollectionsQuery();

  const collectionMap = new Map<string, string>();
  const collectionNameToId = collections?.forEach((c) =>
    collectionMap.set(c.name, c.id),
  );

  const categoryMap = new Map<string, string>();
  const categoryNameToId = categories?.forEach((c) =>
    categoryMap.set(c.name, c.id),
  );

  const hasQueries = useMemo(
    () => hasProductQueryFilters || productQuery.sort !== "Popularity",
    [hasProductQueryFilters, productQuery.sort],
  );

  const queryKey = hasQueries
    ? ["products", productQuery]
    : ["products", "Popularity"]; // default page

  const queryFn = useCallback(
    async ({ pageParam = 0 }: QueryFunctionContext) => {
      const filtersDomain = productQuery.filters;

      let filtersAPI: ProductFilters = {};

      if (filtersDomain?.search) {
        filtersAPI.search = filtersDomain.search;
      }

      if (filtersDomain?.priceRange) {
        let pr = filtersDomain.priceRange;

        if (pr.endsWith("+")) {
          filtersAPI.priceRange = { min: Number(pr.slice(0, -1)) };
        } else {
          const [min, max] = pr.split("-");
          filtersAPI.priceRange = { min: Number(min), max: Number(max) };
        }
      }

      if (filtersDomain?.categories) {
        filtersAPI.categoryIds = filtersDomain.categories
          .map((c) => categoryMap.get(c))
          .filter((id): id is string => id !== undefined);
      }

      if (filtersDomain?.collectionNames) {
        filtersAPI.collectionIds = filtersDomain.collectionNames
          .map((c) => collectionMap.get(c))
          .filter((id): id is string => id !== undefined);
      }

      try {
        return await ProductAPI.queryListItems({
          page: pageParam as number,
          perPage,
          sort: productQuery?.sort ?? "Popularity",
          filters: filtersAPI,
        });
      } catch (err) {
        console.error("Products fetch failed:", err);
        return [];
      }
    },
    [productQuery, categoryNameToId, collectionNameToId],
  );

  const perPage = 12;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    error,
  } = useSuspenseInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < perPage ? undefined : allPages.length,
    staleTime: hasQueries ? 0 : 30 * 60 * 1000, // cache only the default page
    meta: { persist: false },

    // keepPreviousData: true, // avoids flicker when switching queries
    // enabled: true, // we’ll handle disabled via queryKey if needed
  });

  return {
    queryKey,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
  };
};
