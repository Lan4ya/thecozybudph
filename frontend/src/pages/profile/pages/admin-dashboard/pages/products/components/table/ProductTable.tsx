import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/api/product";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useProductMutations } from "@/pages/profile/pages/admin-dashboard/pages/products/hooks/useProductsMutations";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import ProductTableItemsSkeleton from "@/lib/ui/skeletons/AdminProductTableItemSkeleton";
import { cn } from "@/lib/utils/cn";
import { useProductsPageState } from "../../hooks/useProductsPageState";
import { formatPriceCents } from "@/lib/utils/format";

export default function ProductTable() {
  const { setEditingProduct, setFormOpen } = useProductsPageState();

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
    <div className="flex flex-col gap-5">
      {allProducts.map((p) => (
        <ProductRow
          key={p.id}
          onEdit={() => {
            setEditingProduct(p);
            setFormOpen(true);
          }}
          product={p}
          isDeleting={deletingIds.has(p.id)}
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

type ProductRowProps = {
  product: ProductWithRelations;
  onEdit: () => void;
  isDeleting: boolean;
  setDeletingIds: Dispatch<SetStateAction<Set<string>>>;
};

function ProductRow({
  product,
  onEdit,
  isDeleting,
  setDeletingIds,
}: ProductRowProps) {
  const { deleteProductMutation } = useProductMutations();

  const handleDelete = async () => {
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
  };

  return (
    <article className="border grid grid-cols-[auto_auto_5fr_1fr] items-center gap-4 px-2 py-4 rounded-lg hover:shadow-sm transition">
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
      <ProductImage
        src={product.primaryImageUrl}
        alt={product.name}
        roundedSize="md"
        className="size-20"
      />

      {/* Row Details */}
      <div className="flex flex-col flex-1">
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
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
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
