import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

const ShopProductGridSkeleton = () => {
  return (
    <div className="custom-container max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 xl:gap-8 2xl:gap-10 ">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border border-border/30 rounded-lg">
            <Skeleton className="aspect-square rounded-b-none" />

            <div className="py-4 gap-2 flex-center flex-col">
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-3 w-2/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopProductGridSkeleton;
