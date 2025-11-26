import ProductColorVariantCircles from "@/components/products/ProductColorVariants";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/services/api/products";
import type { ProductDataWithJoins } from "@TheCozyBud/schema";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { useProductMutations } from "@/pages/admin/hooks/useProductsMutations";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductTableItemsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { DeleteProductDialog } from "./DeleteDialog";

export default function ProductTable({
  onEdit,
}: {
  onEdit: (selectedProduct: ProductDataWithJoins) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { deleteProductMutation } = useProductMutations();

  const perPage = 12;
  const {
    data: products,
    fetchNextPage,
    hasNextPage,
    error,
    isFetchingNextPage,
    isFetching,
  } = useSuspenseInfiniteQuery<ProductDataWithJoins[]>({
    queryKey: ["products"],
    queryFn: ({ pageParam }) =>
      ProductAPI.getAll({
        page: pageParam as number,
        perPage,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      return lastPage.length < perPage ? undefined : allPages.length;
    },
    staleTime: 1000 * 60 * 60 * 7,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
  if (error && !isFetching) throw error;

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

  const allProducts = products.pages.flat();

  const handleDelete = useCallback(
    (id: string) => {
      setDeletingId(id);
      deleteProductMutation.mutate(id, {
        onSettled: () => setDeletingId(null),
      });
    },
    [deleteProductMutation],
  );

  const handleEdit = useCallback(
    (p: ProductDataWithJoins) => onEdit(p),
    [onEdit],
  );

  if (!allProducts.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No products yet. Create one using the <strong>Plus Icon</strong> button.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allProducts.map((p) => (
        <ProductTableItem
          key={p.id}
          product={p}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      ))}

      {isFetchingNextPage && <ProductTableItemsSkeleton />}

      <div
        ref={sentinelRef}
        className="mx-auto h-5 invisible pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

type ProductTableInnerProps = {
  product: ProductDataWithJoins;
  onEdit: (p: ProductDataWithJoins) => void;
  deletingId: string | null;
  onDelete: (id: string) => void;
};

function ProductTableItemInner({
  product,
  onEdit,
  deletingId,
  onDelete,
}: ProductTableInnerProps) {
  const isDeleting = deletingId === product.id;

  const deleteTrigger = useMemo(
    () => (
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        className={cn(isDeleting && "opacity-70 pointer-events-none")}
        aria-label={`Delete ${product.name}`}
      >
        {isDeleting ? <Spinner /> : <Trash2 className="size-4" />}
      </Button>
    ),
    [isDeleting, product.name],
  );

  const handleEdit = useCallback(() => onEdit(product), [onEdit, product]);

  const handleConfirmDelete = useCallback(
    () => onDelete(product.id),
    [onDelete, product.id],
  );

  return (
    <article className="border flex-between gap-4 px-3 py-4 rounded-lg hover:shadow-sm transition">
      <div className="flex items-center gap-4 min-w-0">
        {product.imageUrls?.[0] && (
          <ProductImage
            src={product.imageUrls[0]}
            alt={product.name}
            roundedSize="md"
            className="size-25"
          />
        )}

        <div className="min-w-0 flex flex-col flex-1">
          <h3 className="text-xs lg:text-base font-medium truncate">
            {product.name}
          </h3>

          {product.productsCollection?.name && (
            <p className="text-xs lg:text-sm mt-1 text-muted-foreground line-clamp-2">
              Collection: {product.productsCollection.name}
            </p>
          )}

          {product.colorVariants.length > 0 && (
            <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground line-clamp-2">
              Color Variants:
              <ProductColorVariantCircles
                colorVariants={product.colorVariants}
              />
            </div>
          )}

          <p className="text-primary text-md">{formatPrice(product.price)}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="size-4" />
        </Button>

        <DeleteProductDialog
          product={product}
          onConfirm={handleConfirmDelete}
          trigger={deleteTrigger}
        />
      </div>
    </article>
  );
}

const ProductTableItem = memo(ProductTableItemInner);
