import PersistSuspense from "@/components/PersistSuspense";
import ProductTable from "./components/table/ProductTable";
import ProductForm from "./components/form/ProductForm";
import ProductTableRowsSkeleton from "../../../../../../lib/ui/skeletons/AdminProductTableItemSkeleton";
import AdminProductsProvider from "./providers/AdminProductsProvider";
import TopBar from "./components/TopBar";
import { useState } from "react";

export default function Products() {
  // const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
  // const [searchInputVal, setSearchInputVal] = useState("");
  // const searchInputRef = useRef<HTMLInputElement>(null);
  //
  //
  // useEffect(() => {
  //   if (isSearchOpen) searchInputRef.current?.focus();
  // }, [isSearchOpen]);
  //
  // function handleSearchToggle() {
  //   setSearchOpen((p) => !p);
  //   if (isSearchOpen) {
  //     setSearchInputVal("");
  //   }
  // }

  return (
    <AdminProductsProvider>
      <div className="max-w-[1080px] mx-auto space-y-4">
        <TopBar />

        <PersistSuspense fallback={<ProductTableRowsSkeleton />}>
          <ProductTable />
        </PersistSuspense>

        <ProductForm />
      </div>
    </AdminProductsProvider>
  );
}
