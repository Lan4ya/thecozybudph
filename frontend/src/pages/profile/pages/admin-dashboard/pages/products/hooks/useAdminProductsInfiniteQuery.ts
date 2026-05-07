import type { ProductWithRelations } from "@TheCozyBud/schemas";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useAdminProductsPageState } from "./useAdminProductsPageState";
import { AdminAPI } from "@/api";

export const useAdminProductsInfiniteQuery = () => {
  const { searchQuery } = useAdminProductsPageState();
  const perPage = 12;
  const DAY = 1000 * 60 * 60 * 24;
  const queryKey = searchQuery
    ? ["__admin__products__", { search: searchQuery }]
    : ["__admin__products__"];

  const {
    data: productQuery,
    fetchNextPage,
    hasNextPage,
    error,
    isFetchingNextPage,
    isFetching,
  } = useSuspenseInfiniteQuery<ProductWithRelations[]>({
    queryKey,
    queryFn: ({ pageParam }) =>
      AdminAPI.queryProducts({
        page: pageParam as number,
        perPage,
        search: searchQuery,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      return lastPage.length < perPage ? undefined : allPages.length;
    },
    staleTime: searchQuery ? 0 : DAY * 7,
    gcTime: searchQuery ? 5 * 60 * 1000 : DAY * 14,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (hasNextPage && entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "-20px" },
    );
    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    products: productQuery.pages.flat(),
    sentinelRef,
    error,
    isFetching,
    isFetchingNextPage,
  };
};
