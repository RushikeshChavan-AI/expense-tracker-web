import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "../../utils/format";
import EmptyState from "../ui/EmptyState";
import { PieChart as PieIcon } from "lucide-react";

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState icon={PieIcon} title="No expense data" description="Add expenses to see the category breakdown." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
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
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: "#8B93A7", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
