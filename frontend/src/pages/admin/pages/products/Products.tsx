import PersistSuspense from "@/components/PersistSuspense";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import ProductTable from "./components/Table";
import ProductForm from "./components/form/Form";
import {
  Plus,
  Search,
  TableProperties,
  Grid3x3,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductPayloadFromDB } from "@/lib/supabase/products";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import ProductTableItemSkeleton from "../../skeletons/ProductTableItemSkeleton";

export default function AdminDashboardProducts() {
  const [formOpen, setFormOpen] = useState(false);
  const [updatingProduct, setUpdatingProduct] =
    useState<ProductPayloadFromDB | null>(null);

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

  function openEditForm(product: ProductPayloadFromDB) {
    setUpdatingProduct(product);
    setFormOpen(true);
  }

  return (
    <div className="py-6 max-w-[1550px] mx-auto">
      <div className="flex flex-col gap-5">
        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold">
          Products
        </h1>

        <div className="flex items-center justify-between mb-9">
          <div className="flex-center gap-2">
            <Button size="sm" variant="outline" className="">
              <TableProperties />
            </Button>
            <Button size="sm" variant="outline">
              <LayoutGrid />
            </Button>
            <Button size="sm" variant="outline">
              <Grid3x3 />
            </Button>
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
            <ProductTableItemSkeleton />
          </div>
        }
      >
        <ProductTable onEdit={openEditForm} />

        <ProductForm
          open={formOpen}
          updatingProduct={updatingProduct}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
          }}
        />
      </PersistSuspense>
    </div>
  );
}
