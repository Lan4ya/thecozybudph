import { productPerformance as mockData } from "../data/mock-analytics";

interface ProductPerformanceProps {
  data?: {
    name: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: string;
  }[];
}

export const ProductPerformance = ({ data }: ProductPerformanceProps) => {
  const performanceData = data || mockData;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Product
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                Views
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                Clicks
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                Conversions
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((product, index) => {
              const clickRate = (
                (product.clicks / product.views) *
                100
              ).toFixed(1);
              const conversionRate = (
                (product.conversions / product.clicks) *
                100
              ).toFixed(1);

              return (
                <tr
                  key={index}
                  className="border-b hover:bg-accent/15 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium">
                    {product.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {product.views}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {product.clicks}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({clickRate}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {product.conversions}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({conversionRate}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-primary">
                    {product.revenue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
