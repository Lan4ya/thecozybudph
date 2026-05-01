import { keyMetrics } from "../data/mock-analytics";
import { TrendingUp, TrendingDown } from "lucide-react";

export const KeyMetricsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {keyMetrics.map((metric, index) => (
        <div key={index} className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="text-2xl">{metric.icon}</div>
            {metric.positive ? (
              <TrendingUp size={20} className="text-green-500" />
            ) : (
              <TrendingDown size={20} className="text-red-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
          <p className="text-2xl font-bold mb-2">{metric.value}</p>
          <p
            className={`text-xs font-medium ${
              metric.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {metric.change} from last month
          </p>
        </div>
      ))}
    </div>
  );
};
