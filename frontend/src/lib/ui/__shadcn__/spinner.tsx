import { Flower, Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

function PageSpinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Flower
      role="status"
      aria-label="Loading"
      className={cn(
        "size-12! lg:size-15! text-primary animate-spin",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner, PageSpinner };
