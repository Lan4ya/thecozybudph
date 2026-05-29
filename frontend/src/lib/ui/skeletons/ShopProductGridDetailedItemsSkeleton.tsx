import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

export const ShopProductGridDetailedItemsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-card grid grid-cols-[auto_1fr] rounded-lg shadow-sm overflow-hidden border border-border/30"
        >
          {/* Image Skeleton */}
          <div className="h-62 overflow-hidden">
            <Skeleton className="h-full aspect-3/4 rounded-none" />
          </div>

          {/* Details Skeleton */}
          <div className="flex flex-col p-4 min-w-0 space-y-4">
            <div className="space-y-2">
              {/* Title + Category */}
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-xl" />
              </div>

              {/* Price */}
              <Skeleton className="h-6 w-20 rounded-md" />

              {/* Description */}
              <div className="space-y-2 mt-4">
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3 rounded-md" />
              </div>
            </div>

            {/* Metadata row */}
            <div className="mt-auto pt-4">
              <Skeleton className="h-4 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
