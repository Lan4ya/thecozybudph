import { Button } from "@/lib/ui/__shadcn__/button";

type OrdersPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  offset: number;
  currentCount: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export function OrdersPagination({
  page,
  totalPages,
  total,
  offset,
  currentCount,
  isFetching,
  onPageChange,
}: OrdersPaginationProps) {
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + currentCount, total);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {start}-{end} of {total} orders
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || isFetching}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1 || isFetching}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
