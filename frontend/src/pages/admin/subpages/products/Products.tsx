import PersistSuspense from "@/components/PersistSuspense";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import ProductTable from "./components/Table";
import ProductForm from "./components/form/Form";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductPayloadFromDB } from "@/lib/supabase/products";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

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
      <div className="flex items-center justify-between mb-9">
        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold">
          Products
        </h1>

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
                isSearchOpen && "bg-transparent! hover:bg-accent/33! border-0",
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

      {/* NOTE: I might refactor this so that they both have Suspense individually, who knows  */}
      <PersistSuspense
        fallback={
          <div className="h-56 flex-center">
            <Spinner className="size-10 text-primary" />
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
