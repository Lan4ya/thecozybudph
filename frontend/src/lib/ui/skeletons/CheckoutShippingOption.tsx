import { Skeleton } from "../__shadcn__/skeleton";

export const CheckoutShippingOptionSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between p-3 rounded-lg border border-border/40"
        >
          {/* LEFT SIDE */}
          <div className="flex items-start gap-3">
            {/* radio */}
            <Skeleton className="h-4 w-4 mt-1 rounded-full" />

            <div className="space-y-2">
              {/* service name */}
              <Skeleton className="h-4 w-32" />

              {/* estimated */}
              <Skeleton className="h-3 w-40" />

              {/* guarantee */}
              {/* <Skeleton className="h-3 w-52" /> */}
            </div>
          </div>

          <div className="text-right">
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};
