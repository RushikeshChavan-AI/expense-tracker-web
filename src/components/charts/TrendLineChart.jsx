import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency } from "../../utils/format";
import EmptyState from "../ui/EmptyState";
import { TrendingUp } from "lucide-react";

export default function TrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState icon={TrendingUp} title="No trend data" description="Your running balance over time will appear here." />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" stroke="#8B93A7" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8B93A7" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          contentStyle={{
            background: "rgba(15,26,46,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#E7EAF2",
            fontSize: 12,
          }}
          formatter={(value) => formatCurrency(value)}
        />
        <Line type="monotone" dataKey="balance" stroke="#F5C451" strokeWidth={2.5} dot={{ r: 3, fill: "#F5C451" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
