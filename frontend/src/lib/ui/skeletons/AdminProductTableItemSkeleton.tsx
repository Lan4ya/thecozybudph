import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

const ProductTableRowsSkeleton = () => {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border grid grid-cols-[auto_auto_7fr_1fr] items-center gap-4 px-3 py-4 rounded-lg"
        >
          {/* Toggle */}
          <div className="flex items-center">
            <Skeleton className="size-5 border-2 rounded" />
          </div>

          {/* Image */}
          <Skeleton className="size-20" />

          {/* Details */}
          <div className="flex flex-col gap-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-15 h-2" />
            <Skeleton className="w-15 h-2" />
          </div>

          <Skeleton className="w-9 h-8" />
        </div>
      ))}
    </div>
  );
};

export default ProductTableRowsSkeleton;
