import { ProductAPI } from "@/api/product";
import type { ProductFilters } from "@/types";
import {
  type QueryFunctionContext,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { useProductsFilterAndSortState } from "./useProductsFilterAndSortState";
import { useCollectionsQuery } from "./useCollectionsQuery";
import { useCategoriesQuery } from "./useCategoriesQuery";

export const useProductsSuspenseInfiniteQuery = () => {
  const { productQuery, hasProductQueryFilters } =
    useProductsFilterAndSortState();

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
    : ["products", "Popularity"]; // default queryKey

  const perPage = 12;

  useEffect(() => {
    console.log({ hasQueries });
  }, []);

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
        return await ProductAPI.queryProducts({
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
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
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
