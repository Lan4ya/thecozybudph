import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Store, TableProperties } from "lucide-react";
import { ProductAPI } from "@/services/api/products";
import { useFilters } from "./hooks/useFilters";
import { useEffect } from "react";
import type { ProductDataWithJoins } from "@TheCozyBud/schema";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import Collections from "./components/filters/Collection";
import ProductCard from "@/components/products/ProductCard";
import PersistSuspense from "@/components/PersistSuspense";
import ShopProductGridSkeleton from "./skeletons/ProductGridSkeleton";
import { ArrowUpDown, Grid3x3, LayoutGrid } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import DisplayAllFilters from "./components/DisplayAllFilters";
import { useIsExtraLargeScreen, useIsLargeScreen } from "@/hooks/useMediaQuery";

const Shop = () => {
  return <ShopInner />;
};

const ShopInner = () => {
  const { filters, hasFilters } = useFilters();
  const isXLScreen = useIsExtraLargeScreen();

  const perPage = 12;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    error,
    isFetchingNextPage,
    isFetching,
  } = useSuspenseInfiniteQuery<ProductDataWithJoins[]>({
    queryKey: ["products"],
    queryFn: ({ pageParam }) =>
      ProductAPI.getAll({
        page: pageParam as number,
        perPage,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      return lastPage.length < perPage ? undefined : allPages.length;
    },
  });
  if (error && !isFetching) throw error;
  const products = data.pages.flat() ?? [];

  useEffect(() => {
    console.log("currennt filters: ", filters);
    console.log("has filters: ", hasFilters);
  });

  return (
    <div className="max-w-[1600px] mx-auto">
      <header className="custom-container mt-2 mb-4 md:mb-10 md:mt-4">
        <h1 className="flex gap-2 items-center font-medium text-lg md:text-2xl border-b pb-2">
          <Store /> Shop
        </h1>
      </header>

      <main className="custom-container mt-2 mb-35   flex flex-col gap-10 lg:gap-15">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="xl:flex gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4  place-items-center gap-x-4 md:gap-x-6  gap-y-4">
              <Search />
              <PriceRange />
              <Categories />
              <Collections />
            </div>

            {isXLScreen && (
              <div className="2xl:ml-60 flex items-center gap-3 mt-8">
                <Button variant="outline" size="lg" className="">
                  <ArrowUpDown className="text-muted-foreground" /> Popularity
                </Button>

                <div className="h-6 w-px bg-muted-foreground" />

                <Button variant="outline" size="icon" className="">
                  <Grid3x3 className="size-5! text-muted-foreground" />
                </Button>

                <Button variant="outline" size="icon" className="">
                  <LayoutGrid className="size-5! text-muted-foreground" />
                </Button>

                <Button variant="outline" size="icon" className="">
                  <TableProperties className="rotate-180 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex-between items-center">
            <DisplayAllFilters />

            {!isXLScreen && (
              <div className="flex items-center gap-3">
                <Button variant="minimal" size="lg" className="px-0!">
                  <ArrowUpDown className="text-muted-foreground" /> Popularity
                </Button>

                <div className="h-5 w-px bg-muted-foreground" />

                <Button variant="minimal" size="auto">
                  <Grid3x3 className="size-5! text-muted-foreground -mr-1" />
                </Button>

                <Button variant="minimal" size="auto">
                  <LayoutGrid className="size-5! text-muted-foreground" />
                </Button>
                {/* <Button variant="minimal" size="auto"> */}
                {/*   <TableProperties className="rotate-180 text-muted-foreground" /> */}
                {/* </Button> */}
              </div>
            )}
          </div>
        </div>

        <PersistSuspense fallback={<ShopProductGridSkeleton />}>
          <ProductGrid products={products} />
        </PersistSuspense>
      </main>
    </div>
  );
};

const ProductGrid = ({ products }: { products: ProductDataWithJoins[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 xl:gap-8 2xl:gap-10 ">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          productId={p.id}
          name={p.name}
          imageUrl={p.imageUrls[0]}
          price={p.price}
        />
      ))}
    </div>
  );
};

export default Shop;
