import { useMemo, useRef, useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { OrderAPI } from "@/api";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Receipt, ArrowRight, ShoppingBag } from "lucide-react";
import { OrderCard, statusConfig } from "./components/OrderCard";
import {
  FlowerSpinner,
  RouteLoaderFlowerSpinner,
} from "@/components/RouteLoaderSpinner";
import PersistSuspense from "@/components/PersistSuspense";
import { ErrorBoundary } from "react-error-boundary";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";

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
        <PersistSuspense fallback={<RouteLoaderFlowerSpinner />}>
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
      <div className="sticky top-0 z-10 -mx-4 px-4 bg-background/80 backdrop-blur-md md:relative md:top-auto md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-none">
        <Swiper
          slidesPerView="auto"
          spaceBetween={12}
          className="w-full pb-4 pt-2 md:pb-0"
          role="tablist"
          aria-label="Order status tabs"
        >
          {ORDER_STATUS_TABS.map(({ status, label }, idx) => (
            <SwiperSlide
              key={`status-${idx}`}
              className="w-auto! px-1 py-1.5 md:py-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  activeTab === status
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/20 md:hover:bg-transparent md:hover:underline md:underline-offset-8 md:decoration-2 bg-primary/10 md:bg-transparent",
                )}
              >
                {label}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-primary/2 py-24 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <ShoppingBag className="text-primary/40 h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-primary">
            No orders yet
          </h3>
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
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Mobile View: Single Column */}
            <div className="flex flex-col space-y-6 w-full md:hidden">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Desktop View: Left Column (Even indices) */}
            <div className="hidden md:flex flex-1 flex-col space-y-6 w-full">
              {orders
                .filter((_, idx) => idx % 2 === 0)
                .map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {/* Desktop View: Right Column (Odd indices) */}
            <div className="hidden md:flex flex-1 flex-col space-y-6 w-full">
              {orders
                .filter((_, idx) => idx % 2 !== 0)
                .map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
            </div>
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
