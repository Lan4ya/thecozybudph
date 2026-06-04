import { keyMetrics as mockData } from "../data/mock-analytics";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart3,
} from "lucide-react";
import type { AdminAnalyticsRes } from "@cozybud/schemas";

interface KeyMetricsCardsProps {
  data?: AdminAnalyticsRes["keyMetrics"];
}

export const KeyMetricsCards = ({ data }: KeyMetricsCardsProps) => {
  const metrics = data
    ? [
        {
          label: "Total Revenue",
          value: data.totalRevenue.value,
          change: data.totalRevenue.change,
          positive: data.totalRevenue.positive,
          icon: DollarSign,
        },
        {
          label: "Total Orders",
          value: data.totalOrders.value,
          change: data.totalOrders.change,
          positive: data.totalOrders.positive,
          icon: ShoppingCart,
        },
        {
          label: "Total Customers",
          value: data.totalCustomers.value,
          change: data.totalCustomers.change,
          positive: data.totalCustomers.positive,
          icon: Users,
        },
        {
          label: "Conversion Rate",
          value: data.conversionRate.value,
          change: data.conversionRate.change,
          positive: data.conversionRate.positive,
          icon: BarChart3,
        },
      ]
    : mockData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={index}
            className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <IconComponent size={32} className="text-primary" />
              {metric.positive ? (
                <TrendingUp size={20} className="text-green-500" />
              ) : (
                <TrendingDown size={20} className="text-red-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-2xl font-bold mb-2">{metric.value}</p>
            <p
              className={`text-xs font-medium ${metric.positive ? "text-green-600" : "text-red-600"}`}
            >
              {metric.change} from last month
            </p>
          </div>
        );
      })}
    </div>
  );
};
