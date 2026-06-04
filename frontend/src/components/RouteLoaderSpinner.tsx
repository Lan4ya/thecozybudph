import { cn } from "@/lib/utils/cn";
import { Flower } from "lucide-react";

export const RouteLoaderFlowerSpinner = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background z-10000 flex items-center justify-center">
      <FlowerSpinner className={className} {...props} />
    </div>
  );
};

export const FlowerSpinner = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => {
  return (
    <Flower
      role="status"
      aria-label="Loading"
      className={cn("size-9! lg:size-11! text-primary animate-spin", className)}
      {...props}
    />
  );
};
