import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { customerData as mockData } from "../data/mock-analytics";

interface CustomerAcquisitionChartProps {
  data?: { month: string; customers: number }[];
}

export const CustomerAcquisitionChart = ({ data }: CustomerAcquisitionChartProps) => {
  const chartData = data || mockData;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Customer Acquisition</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            cursor={{ fill: "var(--accent)", fillOpacity: 0.15 }}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
            formatter={(value) => value}
          />
          <Bar dataKey="customers" fill="#f97316" name="New Customers" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
