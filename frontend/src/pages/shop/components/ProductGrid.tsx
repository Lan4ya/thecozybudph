import { useRef, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { ShopProductGridSkeleton } from "@/lib/ui/skeletons/ShopProductGridItemsSkeleton";
import { useProductsSuspenseInfiniteQuery } from "@/pages/shop/hooks/useProductsSuspenseInfiniteQuery";
import ProductCardDetailed from "@/components/products/ProductCardDetailed";
import { cn } from "@/lib/utils/cn";
import type { ProductListItem } from "@TheCozyBud/schemas";

export type ProductCardProps = {
  cardType: "default" | "detailed";
};

const ProductGrid = ({ cardType }: ProductCardProps) => {
  const {
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    data,
  } = useProductsSuspenseInfiniteQuery();
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

  if (error && !isFetching) throw error;

  if (!products.length && !isFetching)
    return (
      <div className="text-lg lg:text-xl text-muted-foreground text-center mt-6">
        No Products Found
      </div>
    );

  return (
    <div
      className={cn(
        "grid",
        cardType === "default"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 xl:gap-8 2xl:gap-10"
          : "grid-cols-[repeat(auto-fit,minmax(400px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-10",
      )}
    >
      {products.map((p) =>
        cardType === "default" ? (
          <ProductCard
            key={p.id}
            productId={p.id}
            name={p.name}
            imageUrl={p.primaryImageUrl}
            price={p.minPriceCents}
          />
        ) : (
          <ProductCardDetailed key={p.id} product={p} />
        ),
      )}

      {isFetchingNextPage && <ShopProductGridSkeleton />}

      <div
        ref={sentinelRef}
        className="mx-auto border w-5 h-5 invisible pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default ProductGrid;
