import { cn } from "@/lib/utils/cn";
import { Skeleton } from "../__shadcn__/skeleton";

const CartItemsListSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 cursor-default border rounded-xl relative py-4 px-2"
        >
          {/* Selection Toggle */}
          <div className="flex items-center">
            <Skeleton
              className={cn(
                "flex-center size-5 border-2 rounded cursor-pointer transition-all",
              )}
            ></Skeleton>
          </div>

          {/* Product Details */}
          <div className="flex-1 flex gap-2">
            <Skeleton className="rounded-md size-20" />

            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {/* Item Name */}
                <Skeleton className="w-40 h-5" />
                {/* Edit Btn*/}
                <Skeleton className="w-10 h-4" />
              </div>

              {/* Price */}
              <div className="-mt-1">
                <Skeleton className="w-20 h-5" />
              </div>

              <div className="flex justify-between">
                <Skeleton className="w-30 h-5" />

                {/* Quantity Control */}
                <Skeleton className="w-20 h-5" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItemsListSkeleton;
