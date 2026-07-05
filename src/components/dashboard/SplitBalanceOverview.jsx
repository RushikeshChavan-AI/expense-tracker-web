import { Link } from "react-router-dom";
import { ArrowRightLeft, Receipt, Users, WalletCards } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/format";
import EmptyState from "../ui/EmptyState";

function SplitBalanceOrb({ totalSplit, outstanding }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const openRatio = totalSplit > 0 ? Math.min(outstanding / totalSplit, 1) : 0;
  const openLength = circumference * openRatio;
  const settledLength = circumference - openLength;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-48 w-48">
        <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl" />
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
            strokeDasharray={`${settledLength} ${circumference - settledLength}`}
            className="transition-all duration-700 ease-out"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#F5C451"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${openLength} ${circumference - openLength}`}
            strokeDashoffset={-settledLength}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
          <span className="text-[10px] font-medium uppercase text-muted">Outstanding</span>
          <span className="font-mono-num font-display text-2xl font-bold text-ink">{formatCurrency(outstanding)}</span>
          <span className="text-xs text-muted">of {formatCurrency(totalSplit)}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-5 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald" /> Settled
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-gold" /> Open
        </span>
      </div>
    </div>
  );
}

export default function SplitBalanceOverview() {
  const { splitPeople, splitExpenses, splitSettlements, splitStats, splitSetupRequired } = useApp();
  const peopleById = Object.fromEntries(splitPeople.map((person) => [person.id, person]));
  const settlements = (splitStats.settlementSuggestions || []).slice(0, 3);
  const recent = splitExpenses.slice(0, 3);
  const recentSettlements = splitSettlements.slice(0, 3);
  const activeBalances = splitPeople
    .map((person) => ({ ...person, balance: Number(splitStats.balances[person.id] || 0) }))
    .filter((person) => Math.abs(person.balance) > 0.01)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .slice(0, 4);
  const outstanding = activeBalances.reduce((sum, person) => (person.balance > 0 ? sum + person.balance : sum), 0);

  if (splitSetupRequired) {
    return (
      <div className="flex h-full flex-col justify-center rounded-xl border border-dashed border-border p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
            <Users size={18} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink">Split balance setup needed</p>
            <p className="mt-1 text-xs leading-5 text-muted">Run the updated Supabase schema to unlock split expense summaries.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!splitPeople.length && !splitExpenses.length) {
    return (
      <EmptyState
        icon={Users}
        title="No split activity yet"
        description="Add people and shared expenses to see split balances on your dashboard."
        action={
          <Link to="/split-expenses" className="text-xs font-medium text-gold hover:underline">
            Open Split Expenses
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="flex items-center justify-center rounded-xl bg-white/[0.03] p-4">
          <SplitBalanceOrb totalSplit={splitStats.totalSplit} outstanding={outstanding} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <Receipt size={14} className="text-gold" /> Total shared
            </p>
            <p className="mt-2 font-mono-num text-xl font-bold text-ink">{formatCurrency(splitStats.totalSplit)}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <ArrowRightLeft size={14} className="text-gold" /> Outstanding
            </p>
            <p className="mt-2 font-mono-num text-xl font-bold text-ink">{formatCurrency(outstanding)}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <Users size={14} className="text-gold" /> People
            </p>
            <p className="mt-2 font-mono-num text-xl font-bold text-ink">{splitPeople.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 sm:col-span-3">
            <p className="flex items-center gap-2 text-xs text-muted">
              <WalletCards size={14} className="text-gold" /> Recorded payments
            </p>
            <p className="mt-2 font-mono-num text-xl font-bold text-ink">{formatCurrency(splitStats.settledTotal || 0)}</p>
            {splitStats.pendingSettlementTotal > 0 && (
              <p className="mt-1 text-xs text-muted">{formatCurrency(splitStats.pendingSettlementTotal)} pending</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase text-muted">Balance Overview</h4>
          {activeBalances.length ? (
            <div className="flex flex-col gap-2">
              {activeBalances.map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{person.name}</p>
                    <p className="text-xs text-muted">{person.balance >= 0 ? "gets back" : "owes"}</p>
                  </div>
                  <p className={`font-mono-num text-sm font-bold ${person.balance >= 0 ? "text-emerald" : "text-coral"}`}>
                    {formatCurrency(person.balance)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white/5 p-4 text-sm text-muted">Everyone is settled up.</p>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase text-muted">Next Settlements</h4>
          {settlements.length ? (
            <div className="flex flex-col gap-2">
              {settlements.map((settlement) => (
                <div key={`${settlement.from}-${settlement.to}-${settlement.amount}`} className="rounded-xl bg-white/5 px-3 py-2.5">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{settlement.from}</span> pays{" "}
                    <span className="font-semibold">{settlement.to}</span>
                  </p>
                  <p className="mt-1 font-mono-num text-sm font-bold text-gold">{formatCurrency(settlement.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white/5 p-4 text-sm text-muted">No settlement needed.</p>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase text-muted">Recent Shared Expenses</h4>
          <div className="divide-y divide-border/50 rounded-xl bg-white/5">
            {recent.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{expense.description}</p>
                  <p className="text-xs text-muted">
                    {peopleById[expense.paidBy]?.name || "Unknown"} paid · {formatDate(expense.date)}
                  </p>
                </div>
                <p className="shrink-0 font-mono-num text-sm font-bold text-ink">{formatCurrency(expense.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentSettlements.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase text-muted">Recent Payments</h4>
          <div className="divide-y divide-border/50 rounded-xl bg-white/5">
            {recentSettlements.map((settlement) => (
              <div key={settlement.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {peopleById[settlement.fromPersonId]?.name || "Unknown"} paid{" "}
                    {peopleById[settlement.toPersonId]?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted">
                    {settlement.status} · {formatDate(settlement.date)}
                  </p>
                </div>
                <p className="shrink-0 font-mono-num text-sm font-bold text-ink">{formatCurrency(settlement.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-right">
        <Link to="/split-expenses" className="text-xs font-medium text-gold hover:underline">
          View split details →
        </Link>
      </div>
    </div>
  );
}
