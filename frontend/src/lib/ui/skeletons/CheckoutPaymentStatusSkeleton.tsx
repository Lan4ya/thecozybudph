import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

export const CheckoutPaymentStatusSkeleton = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-border/50">
        <CardContent className="flex flex-col items-center text-center py-10 px-6 gap-6">
          {/* icon */}
          <div className="rounded-full p-4">
            <Skeleton className="size-10 rounded-full" />
          </div>

          {/* title */}
          <Skeleton className="h-7 w-44" />

          {/* subtitle */}
          <Skeleton className="h-4 w-64 max-w-xs" />

          {/* buttons */}
          <div className="flex flex-col gap-3 w-full mt-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
