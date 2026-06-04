import { useState } from "react";
import { CategoryChart } from "./components/CategoryChart";
import { CustomerAcquisitionChart } from "./components/CustomerAcquisitionChart";
import { KeyMetricsCards } from "./components/KeyMetricsCards";
import { OrdersTrendChart } from "./components/OrdersTrendChart";
import { ProductPerformance } from "./components/ProductPerformance";
import { RecentTransactions } from "./components/RecentTransactions";
import { RevenueChart } from "./components/RevenueChart";
import { TopProductsChart } from "./components/TopProductsChart";
import { useAnalytics } from "./hooks/useAnalytics";
import { Toggle } from "@/lib/ui/__shadcn__/toggle";
import { Database, LayoutPanelLeft } from "lucide-react";
import { FlowerSpinner } from "@/components/RouteLoaderSpinner";

const Analytics = () => {
  const [isLive, setIsLive] = useState(false);
  const { data, isLoading } = useAnalytics();

  if (isLoading && isLive) {
    return (
      <div className="flex-center h-96">
        <FlowerSpinner />
      </div>
    );
  }

  const liveData = data;
  const activeData = isLive ? liveData : undefined;

  return (
    <div className="space-y-6 pt-6 pb-20 relative">
      <header className="hidden lg:flex items-center justify-between">
        <h1 className="text-header font-semibold">Analytics</h1>
        <div className="text-sm text-muted-foreground">
          Showing {isLive ? "Live" : "Mockup"} Data
        </div>
      </header>

      <KeyMetricsCards data={activeData?.keyMetrics} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={activeData?.revenueTrend} />
        <OrdersTrendChart data={activeData?.dailyOrders} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopProductsChart data={activeData?.topProducts} />
        <CategoryChart data={activeData?.categorySales} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CustomerAcquisitionChart data={activeData?.customerAcquisition} />
        <RecentTransactions data={activeData?.recentTransactions} />
      </div>

      <ProductPerformance data={activeData?.productPerformance} />

      {/* Floating Toggle Bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background/80 backdrop-blur-md border rounded-full p-1.5 shadow-2xl flex items-center gap-1">
          <Toggle
            pressed={!isLive}
            onPressedChange={() => setIsLive(false)}
            variant="outline"
            size="sm"
            className="rounded-full gap-2 px-4"
          >
            <LayoutPanelLeft size={16} />
            Mockup
          </Toggle>

          <Toggle
            pressed={isLive}
            onPressedChange={() => setIsLive(true)}
            variant="outline"
            size="sm"
            className="rounded-full gap-2 px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Database size={16} />
            Live Data
          </Toggle>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
