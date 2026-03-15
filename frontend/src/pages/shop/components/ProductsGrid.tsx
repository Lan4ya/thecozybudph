import { useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { ShopProductGridSkeleton } from "@/lib/ui/skeletons/ShopProductGridItemsSkeleton";
import { ErrorBoundary } from "react-error-boundary";
import { ShopProductGridError } from "@/lib/ui/errors/ShopProductGridError";
import { useNavigate } from "react-router";
import { useInfiniteProductsQuery } from "@/features/shop/hooks/useInfiniteProductsQuery";

const ProductsGrid = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    queryKey,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    data,
    error,
    isFetching,
  } = useInfiniteProductsQuery();

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
            imageUrl={p.primaryImageUrl}
            price={p.minPriceCents}
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

export default ProductsGrid;
