import { cn } from "@/lib/utils/cn";

type MetaBadgeProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

export const MetaBadge = ({ label, value, className }: MetaBadgeProps) => {
  if (value == null || value === "") return null;

  return (
    <span
      className={cn(
        "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full",
        className,
      )}
    >
      <span className="font-medium">{label}:</span> <span>{value}</span>
    </span>
  );
};
