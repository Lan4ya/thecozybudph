import GridStyleButtons from "./components/GridStyleButtons";
import { SortDropdownMenu } from "./components/SortDropDown";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import Collections from "./components/filters/Collection";
import PersistSuspense from "@/components/PersistSuspense";
import { ShopProductGridItemsSkeleton } from "../../lib/ui/skeletons/ShopProductGridItemsSkeleton";
import FilterTags from "./components/FilterTags";
import { useIsXlScreenMin } from "@/hooks/useMediaQuery";
import ProductGrid from "./components/ProductGrid";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate, useSearchParams } from "react-router";
import { ShopProductGridDetailedItemsSkeleton } from "@/lib/ui/skeletons/ShopProductGridDetailedItemsSkeleton";
import { cn } from "@/lib/utils/cn";

const Shop = () => {
  // const { productQuery, hasProductQueryFilters } =
  //   useProductsFilterAndSortState();
  const isXLScreen = useIsXlScreenMin();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const cardType =
    searchParams.get("view") === "detailed" ? "detailed" : "default";

  // useEffect(() => {
  //   isDev && console.log("product query: ", productQuery);
  //   isDev && console.log("has query filters: ", hasProductQueryFilters);
  // }, [productQuery, hasProductQueryFilters]);

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen w-full">
      <header className="hidden lg:block custom-container mb-8 md:mb-14 md:mt-4">
        <h1 className="text-header text-center lg:text-start border-b border-accent/50 pb-4 pt-6 lg:pt-8">
          Shop
        </h1>
      </header>

      <main className="custom-container mt-8 lg:mt-2 mb-35 flex flex-col gap-18">
        <div className="flex flex-col gap-6">
          <div className="xl:flex xl:gap-6 items-end">
            {/* Filtering & Sorting */}
            <div className="grid grid-cols-2 md:grid-cols-4  gap-x-4 md:gap-x-6  gap-y-4">
              <div className="flex flex-col gap-2">
                Search
                <Search />
              </div>
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

          <div className="flex justify-between items-center xl:block">
            <FilterTags />

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
            <div
              className={cn(
                "grid",
                cardType === "default"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 xl:gap-8 2xl:gap-10"
                  : "grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(450px,1fr))] gap-6 md:gap-10",
              )}
            >
              {cardType === "default" ? (
                <ShopProductGridItemsSkeleton />
              ) : (
                <ShopProductGridDetailedItemsSkeleton />
              )}
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
            <ProductGrid cardType={cardType} />
          </ErrorBoundary>
        </PersistSuspense>
      </main>
    </div>
  );
};

export default Shop;
