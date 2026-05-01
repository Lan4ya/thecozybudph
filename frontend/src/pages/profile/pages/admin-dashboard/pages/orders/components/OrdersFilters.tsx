import { Input } from "@/lib/ui/__shadcn__/input";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Search, X } from "lucide-react";
import type { AdminQueryOrdersInput, OrderStatus } from "@TheCozyBud/schemas";

type StatusOption = {
  value: OrderStatus;
  label: string;
};

type SortOption = {
  value: string;
  label: string;
  sortBy: NonNullable<AdminQueryOrdersInput["sortBy"]>;
  sortDir: NonNullable<AdminQueryOrdersInput["sortDir"]>;
};

type OrdersFiltersProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchReset: () => void;
  status: OrderStatus | undefined;
  onStatusChange: (value: OrderStatus | undefined) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  statusOptions: StatusOption[];
  sortOptions: SortOption[];
  isFetching: boolean;
};

export function OrdersFilters({
  searchInput,
  onSearchInputChange,
  onSearchReset,
  status,
  onStatusChange,
  sortValue,
  onSortChange,
  statusOptions,
  sortOptions,
  isFetching,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by recipient"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="pl-9 pr-20"
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {searchInput ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onSearchReset}
                disabled={isFetching}
                className="size-7"
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <select
            value={status ?? ""}
            onChange={(e) =>
              onStatusChange(
                (e.target.value || undefined) as OrderStatus | undefined,
              )
            }
            className="h-9 min-w-[7rem] cursor-pointer appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▼
          </span>
        </div>
      </div>

      <div className="relative">
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-9 min-w-[9rem] cursor-pointer appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          ▼
        </span>
      </div>
    </div>
  );
}
