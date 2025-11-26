import PersistSuspense from "@/components/PersistSuspense";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import HomeProductGridSkeleton from "@/lib/ui/skeletons/HomeProductGridSkeleton";

const Home = () => {
  return (
    <main className="overflow-x-hidden flex-1 flex flex-col gap-15">
      <Hero />

      <PersistSuspense fallback={<HomeProductGridSkeleton />}>
        <ProductGrid />
      </PersistSuspense>
    </main>
  );
};

export default Home;
