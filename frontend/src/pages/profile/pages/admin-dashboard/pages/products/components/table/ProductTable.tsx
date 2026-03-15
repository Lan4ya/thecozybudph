import ProductColorVariantCircles from "@/components/products/ProductColorVariants";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/api/product";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useProductMutations } from "@/features/admin/hooks/useProductsMutations";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Check, Edit } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import ProductTableItemsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { DeleteProductDialog } from "./DeleteDialog";
import { cn } from "@/lib/utils/cn";

export default function ProductTable({
  onEdit,
}: {
  onEdit: (selectedProduct: ProductWithRelations) => void;
}) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const perPage = 12;
  const {
    data: products,
    fetchNextPage,
    hasNextPage,
    error,
    isFetchingNextPage,
    isFetching,
  } = useSuspenseInfiniteQuery<ProductWithRelations[]>({
    queryKey: ["__admin__products__"],
    queryFn: ({ pageParam }) =>
      ProductAPI.queryProducts({
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
        <ProductTableRow
          key={p.id}
          onEdit={onEdit}
          product={p}
          deletingIds={deletingIds}
          setDeletingIds={setDeletingIds}
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
  product: ProductWithRelations;
  onEdit: (selectedProduct: ProductWithRelations) => void;
  deletingIds: Set<string>;
  setDeletingIds: Dispatch<SetStateAction<Set<string>>>;
};

function ProductTableInner({
  product,
  onEdit,
  deletingIds,
  setDeletingIds,
}: ProductTableInnerProps) {
  const isDeleting = deletingIds.has(product.id);

  const { deleteProductMutation } = useProductMutations();

  const handleDelete = useCallback(async () => {
    setDeletingIds((prev) => new Set(prev).add(product.id));

    deleteProductMutation.mutate(
      { productIds: [product.id] },
      {
        onSettled: () => {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
        },
      },
    );
  }, [deleteProductMutation, product.id]);

  return (
    <article className="border flex items-center gap-4 px-2 py-4 rounded-lg hover:shadow-sm transition">
      {/* Selection Toggle */}
      <div className="flex items-center">
        <div
          onClick={(e) => {
            // e.stopPropagation();
            // onToggleSelection();
          }}
          className={cn(
            "flex-center size-5 border-2 rounded cursor-pointer transition-all",
            // selected
            false
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground hover:border-primary",
          )}
        >
          {/* {selected && <Check className="size-3" />} */}
        </div>
      </div>

      {/* Image */}
      <div className="flex items-center gap-4 min-w-0">
        {product.primaryImageUrl && (
          <ProductImage
            src={product.primaryImageUrl ?? product.imageUrls[0]}
            alt={product.name}
            roundedSize="md"
            className="size-20"
          />
        )}

        {/* Row Details */}
        <div className="min-w-0 w-40 flex flex-col flex-1">
          <h3 className="text-sm lg:text-base font-medium truncate">
            {product.name}
          </h3>

          {product.collectionName && (
            <p className="text-xs lg:text-sm mt-1 text-muted-foreground line-clamp-2">
              Collection: {product.collectionName}
            </p>
          )}
        </div>
      </div>

      {/* Edit */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="size-4" />
        </Button>

        {/*   <DeleteProductDialog */}
        {/*     product={product} */}
        {/*     onConfirm={handleDelete} */}
        {/*     isDeleting={isDeleting} */}
        {/*   /> */}
      </div>
    </article>
  );
}

const ProductTableRow = memo(ProductTableInner);
