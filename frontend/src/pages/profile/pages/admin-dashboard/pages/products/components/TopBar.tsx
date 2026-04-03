import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";
import { TableProperties, LayoutGrid, Search, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useProductsPageState } from "../hooks/useProductsPageState";
import { useToast } from "@/providers/ToastProvider";
import { DeleteProductDialog } from "./table/DeleteDialog";
import { useProductMutations } from "../hooks/useProductsMutations";
import { useQueryClient } from "@tanstack/react-query";

const TopBar = () => {
  const { deleteProductMutation } = useProductMutations();
  const queryClient = useQueryClient();

  const {
    setSearchQuery,
    searchQuery,
    openCreateProductForm,
    deletingProductIds,
    resetDeletingProductIds,
  } = useProductsPageState();

  const { addToast } = useToast();
  const [isSearchInputOpen, setSearchInputOpen] = useState<boolean>(false);
  // sync default val with search query url.
  const [searchInputVal, setSearchInputVal] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchInputVal.trim();
    if (q === searchQuery) return;

    // debounced search
    const handler = setTimeout(() => {
      console.log("Debounced Search Hit...");
      setSearchQuery(q);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchInputVal, searchQuery]);

  useEffect(() => {
    if (isSearchInputOpen) searchInputRef.current?.focus();
  }, [isSearchInputOpen]);

  const handleSearchToggle = () => {
    setSearchInputOpen((p) => !p);
    if (isSearchInputOpen) {
      setSearchInputVal("");
    }
  };

  const handleDelete = async () => {
    if (deletingProductIds.size === 0) {
      addToast("Please select product(s)", "error");
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

  return (
    <div className="flex items-center rounded-lg justify-between h-[38px]">
      {deletingProductIds.size > 0 ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className=""
            onClick={resetDeletingProductIds}
          >
            Cancel
          </Button>

          <DeleteProductDialog
            onConfirm={handleDelete}
            deleteLoading={deleteProductMutation.isPending}
            deletingCount={deletingProductIds.size}
          />
        </div>
      ) : (
        <>
          <div className="flex-center gap-3">
            <Button size="icon" variant="outline" className="">
              <TableProperties />
            </Button>

            <Button size="icon" variant="outline">
              <LayoutGrid />
            </Button>

            {/* <Button size="sm" variant="outline"> */}
            {/*   <Grid3x3 /> */}
            {/* </Button> */}
          </div>

          <div className="flex-center gap-3">
            {/* Search */}
            <div className="h-8 relative flex items-center justify-end">
              <Input
                ref={searchInputRef}
                value={searchInputVal}
                onChange={(e) => setSearchInputVal(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "transition-all duration-300 placeholder:text-xs placeholder:text-muted-foreground",
                  isSearchInputOpen
                    ? "opacity-100 w-[min(90%,222px)]  pr-12"
                    : "opacity-0 w-0 p-0 border-0",
                )}
              />
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  isSearchInputOpen &&
                    "bg-transparent! hover:bg-accent/33! border-0",
                  "absolute top-0 right-0",
                )}
                onClick={handleSearchToggle}
              >
                <Search />
              </Button>
            </div>

            {/* Add Product */}
            <Button variant="outline" size="sm" onClick={openCreateProductForm}>
              <Plus />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TopBar;
