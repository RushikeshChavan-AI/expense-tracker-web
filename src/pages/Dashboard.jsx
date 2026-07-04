import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Award } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatCurrency } from "../utils/format";
import StatCard from "../components/dashboard/StatCard";
import BalanceOrb from "../components/dashboard/BalanceOrb";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import QuickActions from "../components/dashboard/QuickActions";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import Modal from "../components/ui/Modal";
import TransactionForm from "../components/transactions/TransactionForm";
import { getCategoryIcon } from "../utils/categoryIcon";

export default function Dashboard() {
  const { stats, getCategory, addTransaction } = useApp();
  const { categoryPieData, monthlyBarData } = useAnalytics();
  const [modalType, setModalType] = useState(null);

  const topCategory = stats.topCategoryId ? getCategory(stats.topCategoryId) : null;
  const TopIcon = getCategoryIcon(topCategory?.icon);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Welcome back 👋</h2>
        <p className="mt-1 text-sm text-muted">Here's a snapshot of your finances this month.</p>
      </div>

      <QuickActions onAddIncome={() => setModalType("income")} onAddExpense={() => setModalType("expense")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Balance" value={formatCurrency(stats.balance)} icon={Wallet} tone="gold" />
        <StatCard label="Total Income" value={formatCurrency(stats.totalIncome)} icon={TrendingUp} tone="emerald" />
        <StatCard label="Total Expenses" value={formatCurrency(stats.totalExpense)} icon={TrendingDown} tone="coral" />
        <StatCard
          label="Top Spending Category"
          value={topCategory?.name || "—"}
          icon={TopIcon || Award}
          tone="neutral"
          trend={topCategory ? formatCurrency(stats.byCategory[topCategory.id]) + " spent" : "No expenses yet"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 xl:col-span-1">
          <h3 className="mb-2 self-start font-display text-sm font-semibold text-ink">Balance Overview</h3>
          <BalanceOrb income={stats.monthlyIncome} expense={stats.monthlyExpense} balance={stats.balance} />
        </div>

        <div className="glass rounded-2xl p-6 xl:col-span-2">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">Income vs Expenses (6 months)</h3>
          <MonthlyBarChart data={monthlyBarData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass rounded-2xl p-6 xl:col-span-1">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">Spending by Category</h3>
          <CategoryPieChart data={categoryPieData} />
        </div>

        <div className="glass rounded-2xl p-6 xl:col-span-2">
          <h3 className="mb-1 font-display text-sm font-semibold text-ink">Recent Transactions</h3>
          <RecentTransactions />
        </div>
      </div>

      <Modal open={!!modalType} onClose={() => setModalType(null)} title={modalType === "income" ? "Add Income" : "Add Expense"}>
        <TransactionForm
          lockedType={modalType}
          onSubmit={(data) => {
            addTransaction(data);
            setModalType(null);
          }}
          onCancel={() => setModalType(null)}
        />
      </Modal>
    </div>
  );
}
