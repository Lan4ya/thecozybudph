import { AdminAPI } from "@/api";
import type { ProductFilters } from "@/types";
import {
  type QueryFunctionContext,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useAdminProductsPageState } from "./useAdminProductsPageState";
import { useCollectionsQuery } from "@/pages/shop/hooks/useCollectionsQuery";
import { useCategoriesQuery } from "@/pages/shop/hooks/useCategoriesQuery";
import type { ProductWithRelations } from "@cozybud/schemas";

export const useAdminProductsSuspenseInfiniteQuery = () => {
  const { productQuery } = useAdminProductsPageState();

  const { categories } = useCategoriesQuery();
  const { collections } = useCollectionsQuery();

  const collectionMap = useMemo(() => {
    const map = new Map<string, string>();
    collections?.forEach((c) => map.set(c.name, c.id));
    return map;
  }, [collections]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => map.set(c.name, c.id));
    return map;
  }, [categories]);

  const hasFilters = useMemo(() => {
    const { filters } = productQuery;
    if (!filters) return false;
    return Object.values(filters).some((v) =>
      Array.isArray(v) ? v.length > 0 : Boolean(v),
    );
  }, [productQuery.filters]);

  const queryKey = [
    "__admin__products__",
    productQuery.filters?.search,
    productQuery.filters?.categories,
    productQuery.filters?.collectionNames,
    productQuery.filters?.priceRange,
    productQuery.sort,
  ];

  const perPage = 12;
  const DAY = 1000 * 60 * 60 * 24;

  const queryFn = useCallback(
    async ({ pageParam = 0 }: QueryFunctionContext) => {
      const filtersDomain = productQuery.filters;

      const filtersAPI: ProductFilters = {};

      if (filtersDomain?.search) {
        filtersAPI.search = filtersDomain.search;
      }

      if (filtersDomain?.priceRange) {
        const pr = filtersDomain.priceRange;

        if (pr.endsWith("+")) {
          filtersAPI.priceRange = { min: Number(pr.slice(0, -1)) };
        } else {
          const [min, max] = pr.split("-");
          filtersAPI.priceRange = { min: Number(min), max: Number(max) };
        }
      }

      if (filtersDomain?.categories && filtersDomain.categories.length > 0) {
        filtersAPI.categoryIds = filtersDomain.categories
          .map((c) => categoryMap.get(c))
          .filter((id): id is string => id !== undefined);
      }

      if (
        filtersDomain?.collectionNames &&
        filtersDomain.collectionNames.length > 0
      ) {
        filtersAPI.collectionIds = filtersDomain.collectionNames
          .map((c) => collectionMap.get(c))
          .filter((id): id is string => id !== undefined);
      }

      return await AdminAPI.queryProducts({
        page: pageParam as number,
        perPage,
        filters: filtersAPI,
        sort: productQuery.sort,
      });
    },
    [productQuery, categoryMap, collectionMap],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    error,
  } = useSuspenseInfiniteQuery<ProductWithRelations[]>({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < perPage ? undefined : allPages.length,
    staleTime: hasFilters ? 0 : DAY * 7,
    gcTime: hasFilters ? 5 * 60 * 1000 : DAY * 14,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
  };
};
