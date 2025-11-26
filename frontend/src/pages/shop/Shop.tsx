import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import GridStyleButtons from "./components/GridStyleButtons";
import { ShoppingBag } from "lucide-react";
import { ProductAPI } from "@/services/api/products";
import { useFilters } from "./hooks/useFilters";
import { useEffect, useRef } from "react";
import { SortDropdownMenu } from "./components/SortDropDown";
import type { ProductDataWithJoins } from "@TheCozyBud/schema";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import Collections from "./components/filters/Collection";
import ProductCard from "@/components/products/ProductCard";
import PersistSuspense from "@/components/PersistSuspense";
import ShopProductGridSkeleton from "../../lib/ui/skeletons/ShopProductGridItemsSkeleton";
import Tags from "./components/Tags";
import { useIsExtraLargeScreen } from "@/hooks/useMediaQuery";
import ProductGridSkeleton from "@/lib/ui/skeletons/ShopProductGridItemsSkeleton";

// const Shop = () => {
//   return <ShopInner />;
// };

const Shop = () => {
  const { filters, hasFilters } = useFilters();
  const isXLScreen = useIsExtraLargeScreen();

  useEffect(() => {
    console.log("currennt filters: ", filters);
    console.log("has filters: ", hasFilters);
  });

  return (
    <div className="max-w-[1600px] mx-auto">
      <header className="custom-container mt-2 mb-8 md:mb-14 md:mt-4">
        <h1 className="flex gap-2 items-center font-medium text-lg md:text-2xl border-b pb-2">
          <ShoppingBag /> Shop
        </h1>
      </header>

      <main className="custom-container mt-2 mb-35   flex flex-col gap-10 lg:gap-15">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="xl:flex xl:gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4  place-items-center gap-x-4 md:gap-x-6  gap-y-4">
              <Search />
              <PriceRange />
              <Categories />
              <Collections />
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

        <PersistSuspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 xl:gap-8 2xl:gap-10 ">
              <ShopProductGridSkeleton />
            </div>
          }
        >
          <ProductGrid />
        </PersistSuspense>
      </main>
    </div>
  );
};

const ProductGrid = () => {
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

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (hasNextPage && entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "-20px" },
    );
    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

      {isFetchingNextPage && <ProductGridSkeleton />}

      <div
        ref={sentinelRef}
        className="mx-auto border w-5 h-5 invisible pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};
export default Shop;
