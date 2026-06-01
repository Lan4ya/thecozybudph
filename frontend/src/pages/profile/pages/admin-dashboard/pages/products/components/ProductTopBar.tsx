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
import { useIsXlScreenMin } from "@/hooks/useMediaQuery";

const ProductFilters = () => {
  const { deleteProductMutation } = useProductMutations();
  const queryClient = useQueryClient();
  const isXlScreen = useIsXlScreenMin();

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
        <div className="xl:flex xl:gap-6 items-end">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-4 flex-1">
            <Search />
            <PriceRange />
            <Categories />
            <Collections />
          </div>

          {isXlScreen && (
            <div className="flex items-center gap-3">
              <SortDropdownMenu className="h-[45px]" />
              <Button
                variant="outline"
                className="h-[45px]"
                onClick={openCreateProductForm}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center xl:block">
          <AdminFilterTags />

          {!isXlScreen && (
            <div className="flex items-center gap-3">
              <SortDropdownMenu className="h-[45px]" />
              <Button
                variant="outline"
                className="h-[45px]"
                onClick={openCreateProductForm}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
