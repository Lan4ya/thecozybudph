import PersistSuspense from "@/components/PersistSuspense";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/form/ProductForm";
import ProductTableRowsSkeleton from "../../../../../../lib/ui/skeletons/AdminProductTableItemSkeleton";
import AdminProductsProvider from "./providers/AdminProductsProvider";
import ProductFilters from "./components/ProductFilters";
export default function Products() {
  return (
    <AdminProductsProvider>
      <div className="lg:py-6 space-y-6">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between">
          <h1 className="text-header font-semibold">Products</h1>
        </header>

        <ProductFilters />

        <PersistSuspense fallback={<ProductTableRowsSkeleton />}>
          <ProductTable />
        </PersistSuspense>
        <ProductForm />
      </div>
    </AdminProductsProvider>
  );
}
