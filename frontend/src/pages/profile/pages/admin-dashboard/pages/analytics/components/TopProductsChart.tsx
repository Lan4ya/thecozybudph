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
import { topProductsData } from "../data/mock-analytics";

export const TopProductsChart = () => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Top Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topProductsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
            formatter={(value) => value}
          />
          <Legend />
          <Bar dataKey="sales" fill="#ec4899" name="Sales (units)" />
          <Bar dataKey="revenue" fill="#f43f5e" name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
