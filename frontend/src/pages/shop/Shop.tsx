import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import { useFilters } from "./hooks/useFilters";
import { useEffect } from "react";
import type { ProductDataWithJoins } from "@TheCozyBud/schema";
import Search from "./components/filters/Search";
import PriceRange from "./components/filters/PriceRange";
import Categories from "./components/filters/Categories";
import CollectionName from "./components/filters/CollectionName";
import ProductCard from "@/components/products/ProductCard";
import PersistSuspense from "@/components/PersistSuspense";
import ShopProductGridSkeleton from "./skeletons/ProductGridSkeleton";

const Shop = () => {
  return <ShopInner />;
};

const ShopInner = () => {
  const { filters, clearFilters, hasFilters } = useFilters();

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
    <main className="custom-container mt-2 mb-35   flex flex-col gap-15">
      <button onClick={clearFilters}>clear filters</button>
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 place-items-center gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-4">
        <Search />
        <PriceRange />
        <Categories />
        <CollectionName />
      </div>

      <PersistSuspense fallback={<ShopProductGridSkeleton />}>
        <ProductGrid products={products} />
      </PersistSuspense>
    </main>
  );
};

const ProductGrid = ({ products }: { products: ProductDataWithJoins[] }) => {
  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 xl:gap-8 2xl:gap-10 ">
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
