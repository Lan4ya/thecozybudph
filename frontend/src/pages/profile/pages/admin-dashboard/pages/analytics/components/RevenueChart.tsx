import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { revenueData as mockData } from "../data/mock-analytics";

interface RevenueChartProps {
  data?: { date: string; revenue: number; orders: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const chartData = data || mockData;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
            formatter={(value) => `₱${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: "#ec4899", r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue (₱)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
