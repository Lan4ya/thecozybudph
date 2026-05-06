import GridStyleButtons from "./components/GridStyleButtons";
import { useProductsFilterAndSortState } from "@/pages/shop/hooks/useProductsFilterAndSortState";
import { useEffect } from "react";
import { SortDropdownMenu } from "./components/SortDropDown";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import Collections from "./components/filters/Collection";
import PersistSuspense from "@/components/PersistSuspense";
import { ShopProductGridSkeleton } from "../../lib/ui/skeletons/ShopProductGridItemsSkeleton";
import Tags from "./components/FilterTags";
import { useIsXlScreenMin } from "@/hooks/useMediaQuery";
import ProductGrid from "./components/ProductGrid";
import { ErrorBoundary } from "react-error-boundary";
import isDev from "@/lib/utils/isDev";
import { useNavigate } from "react-router";

const Shop = () => {
  const { productQuery, hasProductQueryFilters } =
    useProductsFilterAndSortState();
  const isXLScreen = useIsXlScreenMin();
  const navigate = useNavigate();

  useEffect(() => {
    isDev && console.log("product query: ", productQuery);
    isDev && console.log("has query filters: ", hasProductQueryFilters);
  }, [productQuery, hasProductQueryFilters]);

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen w-full">
      <header className="custom-container mt-2 mb-8 md:mb-14 md:mt-4">
        <h1 className="flex gap-2 items-center font-medium text-xl lg:text-2xl border-b border-accent/50 pb-3">
          Shop
        </h1>
      </header>

      <main className="custom-container mt-2 mb-35 flex flex-col gap-10 lg:gap-15">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="xl:flex xl:gap-6 items-end">
            <div className="grid grid-cols-2 md:grid-cols-4  gap-x-4 md:gap-x-6  gap-y-4">
              <Search />
              <PriceRange />
              <Categories />
              <Collections />
            </div>

            {isXLScreen && (
              <div className="2xl:ml-60 flex items-center gap-3">
                <SortDropdownMenu />
                <div className="h-7 w-px bg-muted-foreground" />
                <GridStyleButtons />
              </div>
            )}
          </div>

          <div className="flex-between items-center mt-1">
            <Tags />

            {!isXLScreen && (
              <div className="flex items-center gap-3">
                <SortDropdownMenu />
                <div className="h-7 w-px bg-muted-foreground" />
                <GridStyleButtons />
              </div>
            )}
          </div>
        </div>

        <PersistSuspense
          fallback={
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-8 2xl:gap-10 ">
              <ShopProductGridSkeleton />
            </div>
          }
        >
          <ErrorBoundary
            fallbackRender={({ error }) => (
              <div className="col-span-full text-center py-10">
                <p className="text-destructive mb-4">
                  {error.message || "Failed to load products."}
                </p>
              </div>
            )}
            onReset={() => navigate(0)}
          >
            <ProductGrid />
          </ErrorBoundary>
        </PersistSuspense>
      </main>
    </div>
  );
};

export default Shop;
