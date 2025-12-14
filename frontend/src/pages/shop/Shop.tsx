import GridStyleButtons from "./components/GridStyleButtons";
import { ShoppingBag } from "lucide-react";
import { useProductQuery } from "./hooks/useFilters";
import { useEffect } from "react";
import { SortDropdownMenu } from "./components/SortDropDown";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import Collections from "./components/filters/Collection";
import PersistSuspense from "@/components/PersistSuspense";
import { ShopProductGridSkeleton } from "../../lib/ui/skeletons/ShopProductGridItemsSkeleton";
import Tags from "./components/FilterTags";
import { useIsExtraLargeScreen } from "@/hooks/useMediaQuery";
import ShopProductGrid from "./components/ShopProductGrid";
import { ErrorBoundary } from "react-error-boundary";

const Shop = () => {
  const { productQuery, hasProductQueryFilters } = useProductQuery();
  const isXLScreen = useIsExtraLargeScreen();

  useEffect(() => {
    console.log("product query: ", productQuery);
    console.log("has query filters: ", hasProductQueryFilters);
  });

  return (
    <div className="max-w-[1600px] mx-auto w-full">
      <header className="custom-container mt-2 mb-8 md:mb-14 md:mt-4">
        <h1 className="flex gap-2 items-center font-medium text-xl lg:text-3xl border-b pb-2">
          <ShoppingBag className="lg:size-7" /> Shop
        </h1>
      </header>

      <main className="custom-container mt-2 mb-35   flex flex-col gap-10 lg:gap-15">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="xl:flex xl:gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4  gap-x-4 md:gap-x-6  gap-y-4">
              <Search />

              <PriceRange />

              <ErrorBoundary fallback={null}>
                <Categories />
              </ErrorBoundary>

              <ErrorBoundary fallback={null}>
                <Collections />
              </ErrorBoundary>
            </div>

            {isXLScreen && (
              <div className="2xl:ml-60 flex items-center gap-3 mt-8">
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

        <ErrorBoundary fallback={null}>
          <PersistSuspense
            fallback={
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6  xl:gap-8 2xl:gap-10 ">
                <ShopProductGridSkeleton />
              </div>
            }
          >
            <ShopProductGrid />
          </PersistSuspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Shop;
