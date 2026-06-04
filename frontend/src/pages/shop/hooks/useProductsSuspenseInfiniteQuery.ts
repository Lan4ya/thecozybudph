import { ProductAPI } from "@/api/product";
import type { ProductFilters } from "@/types";
import {
  type QueryFunctionContext,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useProductsFilterAndSortState } from "./useProductsFilterAndSortState";
import { useCollectionsQuery } from "./useCollectionsQuery";
import { useCategoriesQuery } from "./useCategoriesQuery";

export const useProductsSuspenseInfiniteQuery = () => {
  const { productQuery, hasProductQueryFilters } =
    useProductsFilterAndSortState();

  const { categories } = useCategoriesQuery();
  const { collections } = useCollectionsQuery();

  const collectionMap = new Map<string, string>();
  collections?.forEach((c) => collectionMap.set(c.name, c.id));

  const categoryMap = new Map<string, string>();
  categories?.forEach((c) => categoryMap.set(c.name, c.id));

  const hasQueries =
    hasProductQueryFilters || productQuery.sort !== "Popularity";

  const queryKey = hasQueries
    ? ["products", productQuery]
    : ["products", "Popularity"]; // default queryKey

  const perPage = 12;

  const queryFn = async ({ pageParam = 0 }: QueryFunctionContext) => {
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

    return await ProductAPI.queryProducts({
      page: pageParam as number,
      perPage,
      sort: productQuery?.sort ?? "Popularity",
      filters: filtersAPI,
    });
  };

  const staleTime = 1000 * 60 * 5; // 5 mins

  /**
   * Keep this query in-memory. Do not use a localStorage persister.
   * The queryKey dynamically changes with every filter/sort permutation.
   * Because it's an infinite query tracking multiple pages of data, saving every
   * permutation will quickly exhaust the browser's 5MB storage quota and crash
   * the app via a QuotaExceededError.
   */
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
    staleTime,
    gcTime: staleTime * 2,
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
