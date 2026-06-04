import { Button } from "@/lib/ui/__shadcn__/button";
import { Plus, X, Filter } from "lucide-react";
import { useAdminProductsPageState } from "../hooks/useAdminProductsPageState";
import { useToast } from "@/providers/ToastProvider";
import { DeleteProductDialog } from "./DeleteDialog";
import { useProductMutations } from "../hooks/useProductsMutations";
import { useQueryClient } from "@tanstack/react-query";
import Search from "@/pages/shop/components/filters/Search";
import PriceRange from "@/pages/shop/components/filters/PriceRange";
import Categories from "@/pages/shop/components/filters/Categories";
import Collections from "@/pages/shop/components/filters/Collection";
import { SortDropdownMenu } from "@/pages/shop/components/SortDropDown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/ui/__shadcn__/dialog";

import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ProductFilters = () => {
  const { deleteProductMutation } = useProductMutations();
  const queryClient = useQueryClient();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { openCreateProductForm, deletingProductIds, resetDeletingProductIds } =
    useAdminProductsPageState();

  const { addToast } = useToast();

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
    <div className="space-y-6">
      {/* Selection Overlay */}
      {isDeletingMode && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-background/80 backdrop-blur-md border rounded-full p-2 shadow-2xl flex items-center gap-2 min-w-max">
            <span className="text-sm font-medium px-4 border-r">
              {deletingProductIds.size} Selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDeletingProductIds}
              className="rounded-full h-9"
            >
              <X size={16} />
              Cancel
            </Button>
            <DeleteProductDialog
              onConfirm={handleDelete}
              deleteLoading={deleteProductMutation.isPending}
              deletingCount={deletingProductIds.size}
              className="rounded-full px-6 h-9"
            />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-end justify-between">
        <Search className="w-60 h-10" />

        <div className="flex items-center gap-4">
          <Dialog
            open={isFilterOpen}
            onOpenChange={setIsFilterOpen}
            modal={false}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter />
              </Button>
            </DialogTrigger>

            {isFilterOpen && (
              <div
                className="fixed inset-0 z-49 bg-black/50 animate-in fade-in duration-300"
                onClick={() => setIsFilterOpen(false)}
              />
            )}

            <DialogContent className="sm:max-w-xl z-50">
              <VisuallyHidden>
                <DialogHeader>
                  <DialogTitle>Filter & Sort Products</DialogTitle>
                </DialogHeader>
              </VisuallyHidden>
              <div className="grid grid-cols-2 gap-4 py-4">
                <PriceRange />
                <Categories />
                <Collections />
                <div className="flex items-end">
                  <SortDropdownMenu className="w-full h-11" />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" onClick={openCreateProductForm}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
