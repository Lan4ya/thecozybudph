import PersistSuspense from "@/components/PersistSuspense";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/form/ProductForm";
import ProductTableRowsSkeleton from "../../../../../../lib/ui/skeletons/AdminProductTableItemSkeleton";
import AdminProductsProvider from "./providers/AdminProductsProvider";
import ProductTopBar from "./components/ProductTopBar";

export default function Products() {
  return (
    <AdminProductsProvider>
      <div className="space-y-6">
        <ProductTopBar />

        <PersistSuspense fallback={<ProductTableRowsSkeleton />}>
          <ProductTable />
        </PersistSuspense>

        <ProductForm />
      </div>
    </AdminProductsProvider>
  );
}
