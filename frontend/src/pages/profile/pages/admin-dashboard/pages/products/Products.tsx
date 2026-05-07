import PersistSuspense from "@/components/PersistSuspense";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/form/ProductForm";
import ProductTableRowsSkeleton from "../../../../../../lib/ui/skeletons/AdminProductTableItemSkeleton";
import AdminProductsProvider from "./providers/AdminProductsProvider";
import ProductFilters from "./components/ProductTopBar";
export default function Products() {
  return (
    <AdminProductsProvider>
      <div className="lg:py-6 space-y-6">
        <ProductFilters />

        <PersistSuspense fallback={<ProductTableRowsSkeleton />}>
          <ProductTable />
        </PersistSuspense>

        <ProductForm />
      </div>
    </AdminProductsProvider>
  );
}
