import { cn } from "@/lib/utils/cn";
import { Flower } from "lucide-react";

export const RouteLoaderSpinner = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background z-10000 flex items-center justify-center">
      <Flower
        role="status"
        aria-label="Loading"
        className={cn(
          "size-12! lg:size-15! text-primary animate-spin",
          className,
        )}
        {...props}
      />
    </div>
  );
};
