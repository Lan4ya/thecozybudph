import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/__shadcn__/select";

import { Input } from "@/lib/ui/__shadcn__/input";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Search, X } from "lucide-react";
import type { AdminQueryOrdersInput, OrderStatus } from "@cozybud/schemas";

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
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search */}
      <div className="relative w-full sm:w-auto sm:max-w-80">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by recipient"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className="px-9"
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

      {/* Filter Status */}
      <Select
        value={status ?? "all"}
        onValueChange={(value) => {
          onStatusChange(value === "all" ? undefined : (value as OrderStatus));
        }}
      >
        <SelectTrigger className="w-40 grow-1 md:grow-0">
          <SelectValue placeholder="" />
        </SelectTrigger>

        <SelectContent position="popper" sideOffset={4}>
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select value={sortValue} onValueChange={onSortChange}>
        <SelectTrigger className="w-40 grow-1 md:ml-auto md:grow-0">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          <SelectGroup>
            <SelectLabel>Sort by</SelectLabel>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
