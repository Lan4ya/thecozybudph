import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ordersData as mockData } from "../data/mock-analytics";

interface OrdersTrendChartProps {
  data?: { date: string; orders: number }[];
}

export const OrdersTrendChart = ({ data }: OrdersTrendChartProps) => {
  const chartData = data || mockData;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Daily Orders</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
            formatter={(value) => value}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#ec4899"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Orders"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
