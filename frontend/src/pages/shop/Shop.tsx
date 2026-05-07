import GridStyleButtons from "./components/GridStyleButtons";
import { useProductsFilterAndSortState } from "@/pages/shop/hooks/useProductsFilterAndSortState";
import { useEffect, useState } from "react";
import { SortDropdownMenu } from "./components/SortDropDown";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import Collections from "./components/filters/Collection";
import PersistSuspense from "@/components/PersistSuspense";
import { ShopProductGridSkeleton } from "../../lib/ui/skeletons/ShopProductGridItemsSkeleton";
import FilterTags from "./components/FilterTags";
import { useIsXlScreenMin } from "@/hooks/useMediaQuery";
import ProductGrid, { type ProductCardProps } from "./components/ProductGrid";
import { ErrorBoundary } from "react-error-boundary";
import isDev from "@/lib/utils/isDev";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";

const Shop = () => {
  const { productQuery, hasProductQueryFilters } =
    useProductsFilterAndSortState();
  const isXLScreen = useIsXlScreenMin();
  const navigate = useNavigate();

  const [cardType, setCardType] =
    useState<ProductCardProps["cardType"]>("default");

  useEffect(() => {
    isDev && console.log("product query: ", productQuery);
    isDev && console.log("has query filters: ", hasProductQueryFilters);
  }, [productQuery, hasProductQueryFilters]);

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen w-full">
      <header className="custom-container mb-8 md:mb-14 md:mt-4">
        <h1 className="flex justify-center items-center lg:justify-start font-ivy-ora-display text-primary gap-2 font-bold text-2xl lg:text-3xl border-b border-accent/50 pb-4 pt-6 lg:pt-8">
          Shop <Sparkles />
        </h1>
      </header>

      <main className="custom-container mt-2 mb-35 flex flex-col gap-18">
        <div className="flex flex-col gap-6">
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
                <GridStyleButtons
                  onCardTypeChange={(cardType) => setCardType(cardType)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center xl:block">
            <FilterTags />

            {!isXLScreen && (
              <div className="flex items-center gap-3">
                <SortDropdownMenu />
                <div className="h-7 w-px bg-muted-foreground" />
                <GridStyleButtons
                  onCardTypeChange={(cardType) => setCardType(cardType)}
                />
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
            <ProductGrid cardType={cardType} />
          </ErrorBoundary>
        </PersistSuspense>
      </main>
    </div>
  );
};

export default Shop;
