import type { ProductWithRelations } from "@TheCozyBud/schemas";
import { ProductImage } from "@/components/products/ProductImage";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Check, Edit } from "lucide-react";
import ProductTableRowsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { useProductsPageState } from "../hooks/useProductsPageState";
import { useAdminProductsInfiniteQuery } from "../hooks/useAdminProductsInfiniteQuery";

export default function ProductCardGrid() {
  const {
    openUpdateProductForm: openEditProductForm,
    deletingProductIds,
    toggleDeletingProductId,
    searchQuery,
  } = useProductsPageState();

  const { products, sentinelRef, error, isFetching, isFetchingNextPage } =
    useAdminProductsInfiniteQuery();

  if (error && !isFetching) throw error;

  if (!products.length && !isFetching) {
    if (searchQuery) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No products found.
        </div>
      );
    }

    return (
      <div className="py-12 text-center text-muted-foreground">
        No products yet. Create one using the <strong>Plus Icon</strong> button.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => openEditProductForm(product)}
            onToggle={() => toggleDeletingProductId(product.id)}
            isDeleting={deletingProductIds.has(product.id)}
          />
        ))}
      </div>

      {isFetchingNextPage && <ProductTableRowsSkeleton />}

      <div
        ref={sentinelRef}
        className="mx-auto h-5 invisible pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

type ProductCardProps = {
  product: ProductWithRelations;
  onEdit: () => void;
  onToggle: () => void;
  isDeleting: boolean;
};

function ProductCard({
  product,
  onEdit,
  onToggle,
  isDeleting,
}: ProductCardProps) {
  const hasPriceRange = product.minPriceCents !== product.maxPriceCents;
  const updatedAt = new Date(product.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="rounded-2xl border bg-card/95 p-4 transition hover:shadow-sm">
      <div className="flex items-start gap-3">
        <ProductImage
          src={product.primaryImageUrl}
          alt={product.name}
          roundedSize="lg"
          className="size-20 border bg-muted/20"
        />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-sm font-semibold lg:text-base">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {product.description ?? "No description yet."}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground font-mono">
            #{product.id.slice(0, 8)}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={`Select ${product.name}`}
          className={cn(
            "mt-0.5 flex size-6 items-center justify-center rounded-md border-2 transition-all",
            isDeleting
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/70 bg-background hover:border-primary",
          )}
        >
          {isDeleting && <Check className="size-3.5" />}
        </button>
      </div>

      <div className="mt-3 space-y-3 border-t pt-3">
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full border bg-background px-2 py-0.5 text-muted-foreground">
            {product.categoryName ?? "Uncategorized"}
          </span>
          <span className="rounded-full border bg-background px-2 py-0.5 text-muted-foreground">
            {product.collectionName ?? "No collection"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-2 text-xs">
          <div>
            <p className="text-muted-foreground">Options</p>
            <p className="font-medium">{product.options.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Variants</p>
            <p className="font-medium">{product.variants.length}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-primary">
              {formatPriceCents(product.minPriceCents)}
            </p>
            {hasPriceRange && (
              <p className="text-xs text-muted-foreground">
                to {formatPriceCents(product.maxPriceCents)}
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Updated {updatedAt}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="self-end"
            onClick={onEdit}
            aria-label={`Edit ${product.name}`}
          >
            <Edit className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
