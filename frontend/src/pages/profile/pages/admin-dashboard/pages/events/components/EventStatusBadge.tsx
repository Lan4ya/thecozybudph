import { cn } from "@/lib/utils/cn";

export const getStatusInfo = (status: string) => {
  switch (status) {
    case "new":
      return {
        label: "New",
        className: "bg-blue-100 text-blue-800 border border-blue-200",
      };
    case "contacted":
      return {
        label: "Contacted",
        className: "bg-amber-100 text-amber-800 border border-amber-200",
      };
    case "quoted":
      return {
        label: "Quoted",
        className: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      };
    case "closed":
      return {
        label: "Closed",
        className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-600 border border-slate-200",
      };
  }
};

type Props = {
  status: string;
  className?: string;
};

export function EventStatusBadge({ status, className }: Props) {
  const info = getStatusInfo(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap border",
        info.className,
        className,
      )}
    >
      {info.label}
    </span>
  );
}
