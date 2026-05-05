import { cn } from "@/lib/utils/cn";

export const FieldError = ({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) =>
  message ? (
    <p className={cn("mt-1 text-xs text-red-500", className)}>{message}</p>
  ) : null;
