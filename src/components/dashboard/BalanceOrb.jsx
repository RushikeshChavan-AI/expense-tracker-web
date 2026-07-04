import { formatCurrency } from "../../utils/format";

// The dashboard's signature visual: a radial gauge where two arcs (income
// and expense) race around a glowing core showing the net balance.
export default function BalanceOrb({ income, expense, balance }) {
  const total = income + expense || 1;
  const incomeRatio = income / total;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const incomeLength = circumference * incomeRatio;
  const expenseLength = circumference * (1 - incomeRatio);

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative h-52 w-52">
        <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl animate-pulse-glow" />
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#34D399"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${incomeLength} ${circumference - incomeLength}`}
            className="transition-all duration-700 ease-out"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#FB7185"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${expenseLength} ${circumference - expenseLength}`}
            strokeDashoffset={-incomeLength}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted">Balance</span>
          <span
            className={`font-mono-num font-display text-2xl font-bold ${balance >= 0 ? "text-ink" : "text-coral"}`}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald" /> Income
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-coral" /> Expense
        </span>
      </div>
    </div>
  );
}
