import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { topProductsData as mockData } from "../data/mock-analytics";

interface TopProductsChartProps {
  data?: { name: string; sales: number; revenue: number }[];
}

export const TopProductsChart = ({ data }: TopProductsChartProps) => {
  const chartData = data || mockData;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Top Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            cursor={{ fill: "var(--accent)", fillOpacity: 0.15 }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
            formatter={(value) => value}
          />
          <Legend />
          <Bar dataKey="sales" fill="#ec4899" name="Sales (units)" />
          <Bar dataKey="revenue" fill="#f43f5e" name="Revenue (₱)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
