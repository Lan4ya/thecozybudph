import { ProductImage } from "@/components/products/ProductImage";
import type { ProductWithRelations } from "@cozybud/schemas";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Check, Edit } from "lucide-react";
import { useEffect, useRef } from "react";
import ProductTableRowsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { cn } from "@/lib/utils/cn";
import { useAdminProductsPageState } from "../hooks/useAdminProductsPageState";
import { formatPriceCents } from "@/lib/utils/format";
import { MetaBadge } from "@/components/MetaBadge";
import { useProductMutations } from "../hooks/useProductsMutations";
import { useAdminProductsSuspenseInfiniteQuery } from "../hooks/useAdminProductsSuspenseInfiniteQuery";

export default function ProductTable() {
  const { openUpdateProductForm, deletingProductIds, toggleDeletingProductId } =
    useAdminProductsPageState();

  const { deleteProductMutation } = useProductMutations();

  const {
    data: productData,
    fetchNextPage,
    hasNextPage,
    error,
    isFetchingNextPage,
    isFetching,
  } = useAdminProductsSuspenseInfiniteQuery();

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

  const products = productData.pages.flat();

  if (error && !isFetching) throw error;

  if (!products.length && !isFetching) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No products found. Create one using the <strong>Plus Icon</strong>{" "}
        button.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {products.map((p) => (
        <ProductRow
          key={p.id}
          onUpdate={() => openUpdateProductForm(p)}
          onToggle={() => toggleDeletingProductId(p.id)}
          product={p}
          isSelected={deletingProductIds.has(p.id)}
          isDeleting={deleteProductMutation.isPending}
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
  isSelected: boolean;
};

function ProductRow({
  product,
  onUpdate,
  isDeleting,
  isSelected,
  onToggle,
}: ProductRowProps) {
  const updatedAt = new Date(product.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="border grid grid-cols-[auto_auto_3fr_1fr] sm:grid-cols-[auto_auto_3fr_repeat(3,1fr)]  xl:grid-cols-[auto_auto_3fr_repeat(5,1fr)] items-center justify-items-center gap-4 lg:gap-6 px-2 py-4 rounded-lg hover:shadow-sm transition">
      {/* Selection Toggle */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggle}
          disabled={isDeleting && isSelected}
          className={cn(
            "flex-center size-6 border-2 rounded-md cursor-pointer transition-all",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/70 bg-background hover:border-primary",
          )}
          aria-label={`${isDeleting ? "Deleting" : "Select"} ${product.name}`}
        >
          {isSelected && <Check className="size-3" />}
        </button>
      </div>

      {/* Image */}
      <ProductImage
        src={product.primaryImageUrl}
        alt={product.name}
        roundedSize="md"
        className="size-20"
      />

      {/* Details */}
      <div className="items-start justify-self-start flex flex-col">
        <h3 className="capitalize text-sm lg:text-base font-medium truncate">
          {product.name}
        </h3>

        <p className="sm:hidden mt-1 text-xs font-semibold text-primary">
          Price: {formatPriceCents(product.minPriceCents)}
        </p>

        <div className="flex-center gap-2 mt-2">
          <MetaBadge
            className="truncate"
            label={"category"}
            value={product.categoryName}
          />

          {product.collectionName && (
            <MetaBadge
              className="hidden xl:inline truncate"
              label="collection"
              value={product.collectionName}
            />
          )}
        </div>
      </div>

      <div className="hidden xl:block text-center ">
        <p className="text-sm text-muted-foreground">Variants</p>
        <p className="text-[12.5px]">{product.variants.length}</p>
      </div>

      <div className="text-center hidden sm:block">
        <p className="text-sm text-muted-foreground">Min Price</p>
        <p className="text-[12.5px] text-primary">
          {formatPriceCents(product.minPriceCents)}
        </p>
      </div>

      <div className="text-center hidden xl:block">
        <p className="text-sm text-muted-foreground">Images</p>
        <p className="text-[12.5px]">{product.imageUrls.length}</p>
      </div>

      <div className="hidden sm:block">
        <p className="text-sm text-muted-foreground">Updated</p>
        <p className="text-[12.5px]">{updatedAt}</p>
      </div>

      {/* Edit */}
      <div className="">
        <Button
          variant="outline"
          size="sm"
          onClick={onUpdate}
          disabled={isSelected}
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="size-4" />
        </Button>
      </div>
    </article>
  );
}
