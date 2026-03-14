import PersistSuspense from "@/components/PersistSuspense";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import ProductTable from "./components/table/ProductTable";
import ProductForm from "./components/form/ProductForm";
import {
  Plus,
  Search,
  TableProperties,
  // Grid3x3,
  LayoutGrid,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import ProductTableItemsSkeleton from "../../../../../../lib/ui/skeletons/AdminProductTableItemSkeleton";

export default function AdminDashboardProducts() {
  const [formOpen, setFormOpen] = useState(false);
  const [updatingProduct, setUpdatingProduct] =
    useState<ProductWithRelations | null>(null);

  const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchInputVal, setSearchInputVal] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useLockBodyScroll(formOpen);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  function handleSearchToggle() {
    setSearchOpen((p) => !p);
    if (isSearchOpen) {
      setSearchInputVal("");
    }
  }

  function openCreateForm() {
    setUpdatingProduct(null);
    setFormOpen(true);
  }

  function openUpdateForm(product: ProductWithRelations) {
    setUpdatingProduct(product);
    setFormOpen(true);
  }

  return (
    <div className="max-w-[1550px] mx-auto">
      <div className="flex flex-col gap-5">
        <div className="flex items-center border rounded-lg p-2 justify-between mb-9">
          <div className="flex-center gap-2">
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
                  isSearchOpen
                    ? "opacity-100 w-[min(90%,222px)]  pr-12"
                    : "opacity-0 w-0 p-0 border-0",
                )}
              />
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  isSearchOpen &&
                    "bg-transparent! hover:bg-accent/33! border-0",
                  "absolute top-0 right-0",
                )}
                onClick={handleSearchToggle}
              >
                <Search />
              </Button>
            </div>

            {/* Edit Products */}
            <Button size="icon" variant="outline">
              <Edit />
            </Button>

            {/* Add Product */}
            <Button variant="outline" size="sm" onClick={openCreateForm}>
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      <PersistSuspense
        fallback={
          <div className="flex flex-col gap-4">
            <ProductTableItemsSkeleton />
          </div>
        }
      >
        <ProductTable onEdit={openUpdateForm} />

        {/* <UpdateProductForm */}
        {/*   open={formOpen} */}
        {/*   updatingProduct={updatingProduct} */}
        {/*   onToggle={setFormOpen} */}
        {/* /> */}

        <ProductForm
          open={formOpen}
          updatingProduct={updatingProduct}
          onToggle={setFormOpen}
        />
      </PersistSuspense>
    </div>
  );
}
