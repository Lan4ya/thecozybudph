import { useRef, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { ShopProductGridItemsSkeleton } from "@/lib/ui/skeletons/ShopProductGridItemsSkeleton";
import { useProductsSuspenseInfiniteQuery } from "@/pages/shop/hooks/useProductsSuspenseInfiniteQuery";
import ProductCardDetailed from "@/components/products/ProductCardDetailed";
import { cn } from "@/lib/utils/cn";
import { ShopProductGridDetailedItemsSkeleton } from "@/lib/ui/skeletons/ShopProductGridDetailedItemsSkeleton";
import { ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8 2xl:gap-10"
          : "grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 md:gap-10",
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

      {isFetchingNextPage ? (
        cardType === "default" ? (
          <ShopProductGridItemsSkeleton />
        ) : (
          <ShopProductGridDetailedItemsSkeleton />
        )
      ) : null}

      <div
        ref={sentinelRef}
        className="mx-auto border w-5 h-5 invisible pointer-events-none"
        aria-hidden="true"
      />

      {!hasNextPage && products.length > 0 && (
        <div className="col-span-full flex flex-col items-center justify-center mt-20 gap-6">
          <motion.button
            onClick={scrollToTop}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
          >
            <div className="p-3 rounded-full border border-border group-hover:border-primary transition-colors">
              <ChevronUp className="size-5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider">
              Back to Top
            </span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
