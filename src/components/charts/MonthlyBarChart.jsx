import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatCurrency } from "../../utils/format";
import EmptyState from "../ui/EmptyState";
import { BarChart3 } from "lucide-react";

export default function MonthlyBarChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState icon={BarChart3} title="No data yet" description="Your monthly income and expenses will appear here." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" stroke="#8B93A7" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8B93A7" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "rgba(15,26,46,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#E7EAF2",
            fontSize: 12,
          }}
          formatter={(value) => formatCurrency(value)}
        />
        <Legend formatter={(value) => <span style={{ color: "#8B93A7", fontSize: 12 }}>{value}</span>} />
        <Bar dataKey="income" name="Income" fill="#34D399" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#FB7185" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
