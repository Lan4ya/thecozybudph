import { Button } from "@/lib/ui/__shadcn__/button";
import { cn } from "@/lib/utils/cn";
import { Plus, X } from "lucide-react";
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
import AdminFilterTags from "./AdminFilterTags";

const ProductFilters = () => {
  const { deleteProductMutation } = useProductMutations();
  const queryClient = useQueryClient();

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-x-4 md:gap-x-6 gap-y-4">
          <div className="w-full sm:w-[200px]">
            <Search />
          </div>
          <div className="w-full sm:w-[180px]">
            <PriceRange />
          </div>
          <div className="w-full sm:w-[180px]">
            <Categories />
          </div>
          <div className="w-full sm:w-[180px]">
            <Collections />
          </div>

          <div className="flex items-center gap-3 h-[45px] ml-auto">
            <SortDropdownMenu className="h-[45px]" />
            <Button variant="outline" size="sm" onClick={openCreateProductForm}>
              <Plus />
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        <AdminFilterTags />
      </div>
    </div>
  );
};

export default ProductFilters;
