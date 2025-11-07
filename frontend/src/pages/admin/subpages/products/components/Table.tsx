import React from "react";
import ProductColorVariants from "@/components/ProductColorVariants";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Trash2, Edit } from "lucide-react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { cn } from "@/lib/utils/cn";
import { ProductImage } from "@/components/ProductImage";
import { DeleteProductDialog } from "./DeleteDialog";
import type { ProductPayloadFromDB } from "@/lib/supabase/products";

export default function ProductTable({
  onEdit,
}: {
  onEdit: (selectedProduct: ProductPayloadFromDB) => void;
}) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const {
    data: products = [],
    error,
    isFetching,
    deleteProductMutation,
  } = useProducts();

  if (error && !isFetching) throw error;

  const handleDelete = React.useCallback(
    (id: string) => {
      setDeletingId(id);
      deleteProductMutation.mutate(id, {
        onSettled: () => setDeletingId(null),
      });
    },
    [deleteProductMutation],
  );

  const handleEdit = React.useCallback(
    (p: ProductPayloadFromDB) => onEdit(p),
    [onEdit],
  );

  if (!products.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No products yet. Create one using the <strong>Plus Icon</strong> button.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {products.map((p) => (
        <ProductTableItem
          key={p.id}
          product={p}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}

type ProductTableInnerProps = {
  product: ProductPayloadFromDB;
  onEdit: (p: ProductPayloadFromDB) => void;
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

  const deleteTrigger = React.useMemo(
    () => (
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        className={cn(isDeleting && "opacity-70 pointer-events-none")}
        aria-label={`Delete ${product.name}`}
      >
        {isDeleting ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
    ),
    [isDeleting, product.name],
  );

  const handleEdit = React.useCallback(
    () => onEdit(product),
    [onEdit, product],
  );

  const handleConfirmDelete = React.useCallback(
    () => onDelete(product.id),
    [onDelete, product.id],
  );

  return (
    <article className="border flex-between gap-4 px-3 py-4 rounded-lg hover:shadow-sm transition">
      <div className="flex items-center gap-4 min-w-0">
        {product.image_urls?.[0] && (
          <ProductImage
            src={product.image_urls[0]}
            alt={product.name}
            className="size-25"
          />
        )}

        <div className="min-w-0 flex flex-col flex-1">
          <h3 className="text-xs lg:text-base font-medium truncate">
            {product.name}
          </h3>

          {product.products_collection?.name && (
            <p className="text-xs lg:text-sm mt-1 text-muted-foreground line-clamp-2">
              Collection: {product.products_collection.name}
            </p>
          )}

          {product.color_variants !== undefined &&
            product.color_variants.length && (
              <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground line-clamp-2">
                Color Variants:
                <ProductColorVariants colorVariants={product.color_variants} />
              </div>
            )}

          <p className="text-primary text-md">
            ₱{product.price.toLocaleString()}
          </p>
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

const ProductTableItem = React.memo(ProductTableItemInner);
