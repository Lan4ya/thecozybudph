import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

const ProductTableItemSkeleton = () => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          key={i}
          className="bg-background border flex-between gap-4 px-3 py-4 rounded-lg hover:shadow-sm transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* {image} */}
            <Skeleton className="size-25" />

            <div className="min-w-0 flex flex-col gap-2 flex-1">
              <Skeleton className="w-15 h-2" />
              <Skeleton className="w-20 h-2" />
              <Skeleton className="w-15 h-2" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </Skeleton>
      ))}
    </>
  );
};

export default ProductTableItemSkeleton;
