import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-shimmer from-zinc-200 via-zinc-100 to-zinc-200 rounded-md",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
