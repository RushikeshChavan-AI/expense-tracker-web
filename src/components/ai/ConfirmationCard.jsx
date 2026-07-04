import { Check, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/format";
import { getCategoryIcon } from "../../utils/categoryIcon";
import Button from "../ui/Button";

export default function ConfirmationCard({ draft, onConfirm, onDiscard }) {
  const { getCategory } = useApp();
  const category = getCategory(draft.category);
  const Icon = getCategoryIcon(category?.icon);
  const isIncome = draft.type === "income";

  return (
    <div className="glass-strong animate-scale-in w-full max-w-sm rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Confirm transaction</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isIncome ? "bg-emerald-soft text-emerald" : "bg-coral-soft text-coral"}`}>
          {isIncome ? "Income" : "Expense"}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${category?.color || "#94A3B8"}22`, color: category?.color || "#94A3B8" }}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="font-medium text-ink">{draft.description}</p>
          <p className="text-xs text-muted">
            {category?.name} · {formatDate(draft.date)}
          </p>
        </div>
      </div>

      <div className={`mb-5 flex items-center gap-1 font-mono-num text-2xl font-bold ${isIncome ? "text-emerald" : "text-coral"}`}>
        {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        {formatCurrency(draft.amount)}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" fullWidth icon={X} onClick={onDiscard}>
          Discard
        </Button>
        <Button fullWidth icon={Check} onClick={onConfirm}>
          Confirm & save
        </Button>
      </div>
    </div>
  );
}
