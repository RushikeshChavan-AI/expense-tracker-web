import { Pencil, Trash2, ChevronLeft, ChevronRight, ReceiptText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/format";
import { getCategoryIcon } from "../../utils/categoryIcon";
import EmptyState from "../ui/EmptyState";
import { SkeletonRow } from "../ui/Skeleton";

export default function TransactionTable({ data, page, totalPages, setPage, onEdit, onDelete, loading }) {
  const { getCategory } = useApp();

  if (loading) {
    return (
      <div className="glass rounded-2xl p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No transactions found"
        description="Try adjusting your filters, or add a new transaction to get started."
      />
    );
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => {
              const category = getCategory(t.category);
              const Icon = getCategoryIcon(category?.icon);
              return (
                <tr key={t.id} className="border-b border-border/40 transition last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${category?.color || "#94A3B8"}22`, color: category?.color || "#94A3B8" }}
                      >
                        <Icon size={14} />
                      </div>
                      <span className="font-medium text-ink">{t.description || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{category?.name || t.category}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(t.date)}</td>
                  <td className={`px-4 py-3 text-right font-mono-num font-semibold ${t.type === "income" ? "text-emerald" : "text-coral"}`}>
                    <span className="inline-flex items-center gap-1">
                      {t.type === "income" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        aria-label="Edit transaction"
                        className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-gold"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        aria-label="Delete transaction"
                        className="rounded-lg p-1.5 text-muted transition hover:bg-coral-soft hover:text-coral"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <span className="text-xs text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-ink disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-ink disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
