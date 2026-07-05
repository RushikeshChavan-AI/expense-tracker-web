import { useNavigate } from "react-router-dom";
import { PlusCircle, MinusCircle, Sparkles, Download, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { exportTransactionsToCSV } from "../../services/csvService";
import { useToast } from "../../context/ToastContext";

export default function QuickActions({ onAddIncome, onAddExpense, onAddSplitExpense }) {
  const navigate = useNavigate();
  const { transactions, categories, isStartupMode } = useApp();
  const toast = useToast();

  const actions = [
    { label: "Add Income", icon: PlusCircle, tone: "text-emerald", onClick: onAddIncome },
    {
      label: "Add Expense",
      icon: isStartupMode ? Users : MinusCircle,
      tone: isStartupMode ? "text-gold" : "text-coral",
      onClick: isStartupMode ? onAddSplitExpense : onAddExpense,
    },
    { label: "Ask AI", icon: Sparkles, tone: "text-violet", onClick: () => navigate("/ai-assistant") },
    {
      label: "Export CSV",
      icon: Download,
      tone: "text-gold",
      onClick: () => {
        if (!transactions.length) {
          toast.warning("No transactions to export yet");
          return;
        }
        exportTransactionsToCSV(transactions, categories);
        toast.success("Transactions exported to CSV");
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="glass flex flex-col items-center gap-2 rounded-xl p-4 text-xs font-medium text-ink transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
        >
          <a.icon size={20} className={a.tone} />
          {a.label}
        </button>
      ))}
    </div>
  );
}
