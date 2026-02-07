import {
  useQueryClient,
  useSuspenseInfiniteQuery,
  type QueryFunctionContext,
} from "@tanstack/react-query";
import { useRef, useEffect, useMemo, useCallback } from "react";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { ProductAPI } from "@/services/api/products";
import ProductCard from "@/components/products/ProductCard";
import { useProductQuery } from "../hooks/useFilters";
import { ShopProductGridSkeleton } from "@/lib/ui/skeletons/ShopProductGridItemsSkeleton";
import { ErrorBoundary } from "react-error-boundary";
import { ShopProductGridError } from "@/lib/ui/errors/ShopProductGridError";
import { useCategoryNameToId } from "../hooks/useCategoryNameToId";
import { useCollectionNameToId } from "../hooks/useCollectionNameToId";
import type { ProductFilters } from "@/types";
import { useNavigate } from "react-router";

const ShopProductGrid = () => {
  const { productQuery, hasProductQueryFilters } = useProductQuery();
  const { categoryNameToId } = useCategoryNameToId();
  const { collectionNameToId } = useCollectionNameToId();

  const navigate = useNavigate();

  const hasQueries = useMemo(
    () => hasProductQueryFilters || productQuery.sort !== "Popularity",
    [hasProductQueryFilters, productQuery.sort],
  );

  const queryClient = useQueryClient();

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
          .map((c) => categoryNameToId.get(c))
          .filter((id): id is string => id !== undefined);
      }

      if (filtersDomain?.collectionNames) {
        filtersAPI.collectionIds = filtersDomain.collectionNames
          .map((c) => collectionNameToId.get(c))
          .filter((id): id is string => id !== undefined);
      }

      try {
        return await ProductAPI.getAll({
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
  } = useSuspenseInfiniteQuery<ProductWithRelations[]>({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < perPage ? undefined : allPages.length,
    staleTime: hasQueries ? 0 : 30 * 60 * 1000, // cache only the default page

    // keepPreviousData: true, // avoids flicker when switching queries
    // enabled: true, // we’ll handle disabled via queryKey if needed
  });

  if (error && !isFetching) throw error;

  const products = data?.pages.flat() ?? [];

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (hasNextPage && entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "-20px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!products.length)
    return (
      <div className="text-lg lg:text-xl text-muted-foreground text-center mt-6">
        No Products Found
      </div>
    );

  return (
    <ErrorBoundary
      FallbackComponent={ShopProductGridError}
      onReset={() => {
        queryClient.invalidateQueries({ queryKey: queryKey });
        navigate(0);
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 xl:gap-8 2xl:gap-10 ">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            productId={p.id}
            name={p.name}
            imageUrl={p.imageUrls[0]}
            price={p.price}
          />
        ))}

        {isFetchingNextPage && <ShopProductGridSkeleton />}

        <div
          ref={sentinelRef}
          className="mx-auto border w-5 h-5 invisible pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </ErrorBoundary>
  );
};

export default ShopProductGrid;
