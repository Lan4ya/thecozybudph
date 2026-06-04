import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

export const PaymentStatusSkeleton = () => {
  return (
    <div className="h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center text-center px-6 gap-6">
        {/* icon */}
        <Skeleton className="size-17 rounded-full" />

        {/* title */}
        <Skeleton className="h-7 w-44" />

        {/* subtitle */}
        <Skeleton className="h-4 w-64 max-w-xs" />

        {/* optional note – kept minimal to avoid layout shift */}
        <Skeleton className="h-4 w-48 max-w-xs" />

        {/* buttons */}
        <div className="flex flex-col gap-3 w-full mt-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};
