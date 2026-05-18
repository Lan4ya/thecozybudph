import { useEffect, useMemo, useState } from "react";
import { useAdminOrdersPageState } from "./hooks/useAdminOrdersPageState";
import { useAdminOrdersQuery } from "./hooks/useAdminOrdersQuery";
import type { AdminOrderListItem, OrderStatus } from "@cozybud/schemas";
import { OrdersFilters } from "./components/OrdersFilters";
import { OrdersTable } from "./components/OrdersTable";
import { OrdersPagination } from "./components/OrdersPagination";
import { OrderDetailsDrawer } from "./components/OrderDetailsDrawer";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "toPay", label: "To Pay" },
  { value: "paid", label: "Paid" },
  { value: "toShip", label: "To Ship" },
  { value: "shipped", label: "Shipped" },
  { value: "toReceive", label: "To Receive" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS: {
  value: string;
  label: string;
  sortBy: NonNullable<
    ReturnType<typeof useAdminOrdersPageState>["query"]["sortBy"]
  >;
  sortDir: NonNullable<
    ReturnType<typeof useAdminOrdersPageState>["query"]["sortDir"]
  >;
}[] = [
  {
    value: "newest",
    label: "Newest First",
    sortBy: "createdAt",
    sortDir: "desc",
  },
  {
    value: "oldest",
    label: "Oldest First",
    sortBy: "createdAt",
    sortDir: "asc",
  },
  {
    value: "updated-newest",
    label: "Recently Updated",
    sortBy: "updatedAt",
    sortDir: "desc",
  },
  {
    value: "highest-total",
    label: "Highest Total",
    sortBy: "totalCents",
    sortDir: "desc",
  },
  {
    value: "lowest-total",
    label: "Lowest Total",
    sortBy: "totalCents",
    sortDir: "asc",
  },
];

export default function Orders() {
  const { query, page, setSort, setStatus, setSearch, setPage } =
    useAdminOrdersPageState();
  const { orders, total, offset, isLoading, isFetching, error } =
    useAdminOrdersQuery(query);

  const [searchInput, setSearchInput] = useState(query.search ?? "");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderListItem | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setSearchInput(query.search ?? "");
  }, [query.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const nextSearch = searchInput.trim() || undefined;
      if (query.search !== nextSearch) {
        setSearch(nextSearch);
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [query.search, searchInput, setSearch]);

  const totalPages = Math.max(1, Math.ceil(total / (query.limit ?? 20)));
  const sortValue = useMemo(
    () =>
      SORT_OPTIONS.find(
        (s) => s.sortBy === query.sortBy && s.sortDir === query.sortDir,
      )?.value ?? "newest",
    [query.sortBy, query.sortDir],
  );

  const handleOrderRowClick = (order: AdminOrderListItem) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
      </header>

      <OrdersFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchReset={() => {
          setSearchInput("");
          setSearch(undefined);
        }}
        status={query.status}
        onStatusChange={setStatus}
        sortValue={sortValue}
        onSortChange={(value) => {
          const option = SORT_OPTIONS.find((s) => s.value === value);
          if (option) setSort(option.sortBy, option.sortDir);
        }}
        statusOptions={STATUS_OPTIONS}
        sortOptions={SORT_OPTIONS}
        isFetching={isFetching}
      />

      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        hasError={!!error}
        selectedOrderId={selectedOrder?.id ?? null}
        onRowClick={handleOrderRowClick}
      />

      {!isLoading && !error && orders.length > 0 ? (
        <OrdersPagination
          page={page}
          totalPages={totalPages}
          total={total}
          offset={offset}
          currentCount={orders.length}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      ) : null}

      <OrderDetailsDrawer
        order={selectedOrder}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
