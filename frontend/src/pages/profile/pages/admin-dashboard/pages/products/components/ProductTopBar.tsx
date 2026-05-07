import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";
import { Search, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAdminProductsPageState } from "../hooks/useAdminProductsPageState";
import { useToast } from "@/providers/ToastProvider";
import { DeleteProductDialog } from "./DeleteDialog";
import { useProductMutations } from "../hooks/useProductsMutations";
import { useQueryClient } from "@tanstack/react-query";

const ProductFilters = () => {
  const { deleteProductMutation } = useProductMutations();
  const queryClient = useQueryClient();

  const {
    setSearchQuery,
    searchQuery,
    openCreateProductForm,
    deletingProductIds,
    resetDeletingProductIds,
  } = useAdminProductsPageState();

  const { addToast } = useToast();

  const [isSearchInputOpen, setSearchInputOpen] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState(searchQuery);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchInputVal.trim();
    if (q === searchQuery) return;

    const handler = setTimeout(() => {
      setSearchQuery(q);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchInputVal, searchQuery, setSearchQuery]);

  useEffect(() => {
    if (isSearchInputOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchInputOpen]);

  const handleSearchToggle = () => {
    setSearchInputOpen((prev) => {
      const next = !prev;

      if (!next) {
        setSearchInputVal("");
      }

      return next;
    });
  };

  const handleDelete = () => {
    if (deletingProductIds.size === 0) {
      addToast("Please select product(s)", "error");
      return;
    }

    const idsToDelete = Array.from(deletingProductIds);

    deleteProductMutation.mutate(
      { productIds: idsToDelete },
      {
        onSettled: () => {
          resetDeletingProductIds();
          queryClient.resetQueries({ queryKey: ["cart"] });
        },
      },
    );
  };

  const isDeletingMode = deletingProductIds.size > 0;

  return (
    <div className="flex items-center justify-between">
      {isDeletingMode ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={resetDeletingProductIds}>
            Cancel
          </Button>

          <DeleteProductDialog
            onConfirm={handleDelete}
            deleteLoading={deleteProductMutation.isPending}
            deletingCount={deletingProductIds.size}
          />
        </div>
      ) : (
        <div />
      )}

      <div className="flex-center gap-3">
        <div className="relative flex h-8 items-center justify-end">
          <Input
            ref={searchInputRef}
            value={searchInputVal}
            onChange={(e) => setSearchInputVal(e.target.value)}
            placeholder="Search..."
            className={cn(
              "placeholder:text-muted-foreground transition-all duration-300 placeholder:text-xs",
              isSearchInputOpen
                ? "w-[min(90%,222px)] pr-12 opacity-100"
                : "w-0 border-0 p-0 opacity-0",
            )}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchToggle}
            className={cn(
              "absolute top-0 right-0",
              isSearchInputOpen &&
                "border-0 bg-transparent! hover:bg-accent/33!",
            )}
          >
            <Search />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={openCreateProductForm}>
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
