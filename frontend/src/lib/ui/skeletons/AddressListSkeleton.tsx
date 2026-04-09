import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";

const AddressItemSkeleton = () => {
  return (
    <li className="bg-card rounded-xl py-6 px-7 shadow-sm border border-border/30">
      <div className="flex gap-5">
        {/* radio wrapper */}
        <div>
          <Skeleton className="h-4 w-4 rounded-full mt-[2px]" />
        </div>

        <div className="flex-1 flex justify-between mb-7">
          {/* text block */}
          <div className="space-y-1 text-sm w-full max-w-[70%]">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[50%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>

          {/* edit button */}
          <div className="flex items-start">
            <Skeleton className="h-6 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </li>
  );
};

const AddressListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <ul className="flex flex-col gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <AddressItemSkeleton key={i} />
      ))}
    </ul>
  );
};

export default AddressListSkeleton;
