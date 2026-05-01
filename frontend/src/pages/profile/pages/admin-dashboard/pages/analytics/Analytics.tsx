import { CategoryChart } from "./components/CategoryChart";
import { CustomerAcquisitionChart } from "./components/CustomerAcquisitionChart";
import { KeyMetricsCards } from "./components/KeyMetricsCards";
import { OrdersTrendChart } from "./components/OrdersTrendChart";
import { ProductPerformance } from "./components/ProductPerformance";
import { RecentTransactions } from "./components/RecentTransactions";
import { RevenueChart } from "./components/RevenueChart";
import { TopProductsChart } from "./components/TopProductsChart";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <div className="text-sm text-muted-foreground">
          {/* {total} order{total !== 1 ? "s" : ""} */}
        </div>
      </header>

      <KeyMetricsCards />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart />
        <OrdersTrendChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopProductsChart />
        <CategoryChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CustomerAcquisitionChart />
        <RecentTransactions />
      </div>

      <ProductPerformance />
    </div>
  );
};

export default Analytics;
