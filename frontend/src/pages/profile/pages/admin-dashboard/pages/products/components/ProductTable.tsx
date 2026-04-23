import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/api/product";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Check, Edit } from "lucide-react";
import { useEffect, useRef } from "react";
import ProductTableRowsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { cn } from "@/lib/utils/cn";
import { useProductsPageState } from "../hooks/useProductsPageState";
import { formatPriceCents } from "@/lib/utils/format";

export default function ProductTable() {
  const {
    openUpdateProductForm,
    deletingProductIds,
    toggleDeletingProductId,
    searchQuery,
  } = useProductsPageState();

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
      ProductAPI.queryProducts({
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

  const products = productQuery.pages.flat();

  if (error && !isFetching) throw error;

  if (!products.length && !isFetching) {
    if (searchQuery) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No products found.
        </div>
      );
    } else {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No products yet. Create one using the <strong>Plus Icon</strong>{" "}
          button.
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {products.map((p) => (
        <ProductRow
          key={p.id}
          onUpdate={() => openUpdateProductForm(p)}
          onToggle={() => toggleDeletingProductId(p.id)}
          product={p}
          isDeleting={deletingProductIds.has(p.id)}
        />
      ))}

      {isFetchingNextPage && <ProductTableRowsSkeleton />}

      <div
        ref={sentinelRef}
        className="mx-auto h-5 invisible pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

type ProductRowProps = {
  product: ProductWithRelations;
  onUpdate: () => void;
  onToggle: () => void;
  isDeleting: boolean;
};

function ProductRow({
  product,
  onUpdate,
  isDeleting,
  onToggle,
}: ProductRowProps) {
  const updatedAt = new Date(product.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="border grid grid-cols-[auto_auto_3fr_1fr] sm:grid-cols-[auto_auto_2fr_1fr_1fr_1fr] lg:grid-cols-[auto_auto_3fr_1fr_1fr_1fr] items-center justify-items-center gap-4 px-2 py-4 rounded-lg hover:shadow-sm transition">
      {/* Selection Toggle */}
      <div className="flex items-center">
        <div
          onClick={onToggle}
          className={cn(
            "flex-center size-6 border-2 rounded-md cursor-pointer transition-all",
            isDeleting
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/70 bg-background hover:border-primary",
          )}
        >
          {isDeleting && <Check className="size-3" />}
        </div>
      </div>

      {/* Image */}
      <ProductImage
        src={product.primaryImageUrl}
        alt={product.name}
        roundedSize="md"
        className="size-20"
      />

      {/* Details */}
      <div className="justify-self-start flex flex-col">
        <h3 className="text-sm lg:text-base font-medium truncate">
          {product.name}
        </h3>

        <p className="sm:hidden text-xs font-semibold text-primary">
          Price: {formatPriceCents(product.minPriceCents)}
        </p>

        <span className="text-[11px] mt-1 rounded-full border bg-background px-2 py-0.5 text-muted-foreground">
          Collection: {product.categoryName}
        </span>
      </div>

      <div className="hidden sm:flex flex-col">
        <p className="text-sm">Updated</p>
        <p className="text-[11px] text-muted-foreground">{updatedAt}</p>
      </div>

      <div className="hidden sm:flex flex-col">
        <p className="text-sm">Price</p>
        <p className="text-[12px] text-primary">
          {formatPriceCents(product.minPriceCents)}
        </p>
      </div>

      {/* Edit */}
      <div className="">
        <Button
          variant="outline"
          size="sm"
          onClick={onUpdate}
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="size-4" />
        </Button>
      </div>
    </article>
  );
}
