import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

const HomeProductGridSkeleton = () => {
  return (
    <div className="custom-container mt-3 max-w-[1600px] mx-auto">
      <Skeleton
        id="recommendations-heading"
        className="mx-auto mb-14 w-45 h-5 lg:h-7 lg:w-90 lg:mb-12"
      />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8 2xl:gap-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border/30 rounded-lg">
            <Skeleton className="aspect-square rounded-b-none" />

            <div className="py-4 gap-2 flex-center flex-col">
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-3 w-2/4" />
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto py-8 flex justify-center">
        <Skeleton className="w-24 h-9 border rounded-md" />
      </div>
    </div>
  );
};

export default HomeProductGridSkeleton;
