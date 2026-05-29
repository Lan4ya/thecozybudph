import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

export const ShopProductGridItemsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="border border-border/30 shadow-sm rounded-lg">
          <Skeleton className="aspect-square rounded-b-none" />

          <div className="py-4 gap-2 flex-center flex-col">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/4" />
          </div>
        </div>
      ))}
    </>
  );
};
