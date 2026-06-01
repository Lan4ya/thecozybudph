import { useMemo, useRef, useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { OrderAPI } from "@/api";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Receipt, ArrowRight, ShoppingBag } from "lucide-react";
import { OrderCard, statusConfig } from "./components/OrderCard";
import { FlowerSpinner } from "@/components/RouteLoaderSpinner";
import PersistSuspense from "@/components/PersistSuspense";
import { ErrorBoundary } from "react-error-boundary";

export type OrderStatusUI = keyof typeof statusConfig | "all";

const ORDER_STATUS_TABS = [
  { status: "all", label: "All" },
  { status: "toPay", label: "To Pay" },
  { status: "toShip", label: "To Ship" },
  { status: "toReceive", label: "To Receive" },
  { status: "fulfilled", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
] as const;

const LIMIT = 10;

const MyPurchases = () => {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-header tracking-tight text-foreground md:text-4xl">
            My Purchases
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage and track your shopping history
          </p>
        </div>
      </div>

      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="rounded-[2.5rem] border-2 border-dashed border-destructive/20 bg-destructive/5 p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Receipt className="text-destructive h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Failed to load orders</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">
              {error?.message || "Something went wrong."}
            </p>
            <Button
              onClick={resetErrorBoundary}
              variant="default"
              size="lg"
              className="rounded-full px-10 font-bold"
            >
              Try Again
            </Button>
          </div>
        )}
      >
        <PersistSuspense
          fallback={
            <div className="flex-center h-108">
              <FlowerSpinner />
            </div>
          }
        >
          <MyPurchasesContent />
        </PersistSuspense>
      </ErrorBoundary>
    </div>
  );
};

const MyPurchasesContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const status = searchParams.get("status") as OrderStatusUI;
    if (ORDER_STATUS_TABS.some((tab) => tab.status === status)) {
      return status;
    }
    return "all";
  }, [searchParams]);

  const setActiveTab = (status: OrderStatusUI) => {
    setSearchParams(
      (prev) => {
        if (status === "all") {
          prev.delete("status");
        } else {
          prev.set("status", status);
        }
        return prev;
      },
      { replace: true },
    );
  };

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["orders", activeTab],
      queryFn: ({ pageParam = 0 }) =>
        OrderAPI.queryOrders({
          status: activeTab === "all" ? undefined : activeTab,
          limit: LIMIT,
          offset: pageParam as number,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length < LIMIT) return undefined;
        return allPages.length * LIMIT;
      },
    });

  const orders = useMemo(() => data?.pages?.flat() ?? [], [data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (hasNextPage && entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const currentStatus =
    activeTab === "all" ? undefined : statusConfig[activeTab];

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 -mx-4 px-4 bg-background/80 backdrop-blur-md border-b md:relative md:top-auto md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-none">
        <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
          <div
            className="flex min-w-max gap-2 rounded-xl p-2 md:py-0 md:px-0.5 bg-primary/10 md:bg-transparent md:gap-3"
            role="tablist"
            aria-label="Order status tabs"
          >
            {ORDER_STATUS_TABS.map(({ status, label }, idx) => (
              <button
                key={`status-${idx}`}
                type="button"
                role="tab"
                aria-selected={activeTab === status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === status
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/20 md:hover:bg-transparent md:hover:underline md:underline-offset-8 md:decoration-2",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-primary/2 py-24 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <ShoppingBag className="text-primary/40 h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-primary">No orders yet</h3>
          {currentStatus?.label ? (
            <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">
              You don't have any "{currentStatus.label.toLowerCase()}" order
              yet.
            </p>
          ) : null}
          <Button asChild className="rounded-full px-6!">
            <Link to="/shop">
              Explore Products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.item.id} order={order} />
            ))}
          </div>

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <FlowerSpinner />
            </div>
          )}

          <div
            ref={sentinelRef}
            className="h-10 w-full invisible pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
};

export default MyPurchases;
