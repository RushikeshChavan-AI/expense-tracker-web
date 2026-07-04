import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, ReceiptText } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/format";
import { getCategoryIcon } from "../../utils/categoryIcon";
import EmptyState from "../ui/EmptyState";

export default function RecentTransactions() {
  const { transactions, getCategory } = useApp();
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt)
    .slice(0, 6);

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No transactions yet"
        description="Add your first income or expense to see it here."
      />
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {recent.map((t) => {
        const category = getCategory(t.category);
        const Icon = getCategoryIcon(category?.icon);
        return (
          <div key={t.id} className="flex items-center gap-3 py-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${category?.color || "#94A3B8"}22`, color: category?.color || "#94A3B8" }}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{t.description || category?.name}</p>
              <p className="text-xs text-muted">
                {category?.name} · {formatDate(t.date)}
              </p>
            </div>
            <div className={`flex items-center gap-1 font-mono-num text-sm font-semibold ${t.type === "income" ? "text-emerald" : "text-coral"}`}>
              {t.type === "income" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatCurrency(t.amount)}
            </div>
          </div>
        );
      })}
      <div className="pt-3 text-center">
        <Link to="/transactions" className="text-xs font-medium text-gold hover:underline">
          View all transactions →
        </Link>
      </div>
    </div>
  );
}
