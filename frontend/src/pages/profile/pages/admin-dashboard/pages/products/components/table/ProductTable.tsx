import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/api/product";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Check, Edit } from "lucide-react";
import { useEffect, useRef } from "react";
import ProductTableRowsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { cn } from "@/lib/utils/cn";
import { useProductsPageState } from "../../hooks/useProductsPageState";
import { formatPriceCents } from "@/lib/utils/format";

export default function ProductTable() {
  const {
    openEditProductForm,
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
          onEdit={() => openEditProductForm(p)}
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
  onEdit: () => void;
  onToggle: () => void;
  isDeleting: boolean;
};

function ProductRow({
  product,
  onEdit,
  isDeleting,
  onToggle,
}: ProductRowProps) {
  return (
    <article className="border grid grid-cols-[auto_auto_7fr_1fr] items-center gap-4 px-2 py-4 rounded-lg hover:shadow-sm transition">
      {/* Selection Toggle */}
      <div className="flex items-center">
        <div
          onClick={onToggle}
          className={cn(
            "flex-center size-5 border-2 rounded cursor-pointer transition-all",
            isDeleting
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground hover:border-primary",
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
      <div className="flex flex-col">
        <h3 className="text-sm lg:text-base font-medium truncate">
          {product.name}
        </h3>

        <p className="text-xs font-semibold lg:text-sm text-primary">
          Price: {formatPriceCents(product.minPriceCents)}
        </p>

        <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
          Category: {product.categoryName}
        </p>
      </div>

      {/* Edit */}
      <div className="">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="size-4" />
        </Button>
      </div>
    </article>
  );
}
