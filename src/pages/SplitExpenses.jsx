import { useMemo, useState } from "react";
import { Database, Pencil, Receipt, Trash2, UserPlus, Users, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatDate } from "../utils/format";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import SplitExpenseForm from "../components/split/SplitExpenseForm";

function getSettlements(people, balances) {
  const creditors = people
    .map((person) => ({ ...person, amount: Number(balances[person.id] || 0) }))
    .filter((person) => person.amount > 0.01)
    .sort((a, b) => b.amount - a.amount);
  const debtors = people
    .map((person) => ({ ...person, amount: Math.abs(Number(balances[person.id] || 0)) }))
    .filter((person) => person.amount > 0.01)
    .sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtors[debtorIndex] && creditors[creditorIndex]) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= 0.01) debtorIndex += 1;
    if (creditor.amount <= 0.01) creditorIndex += 1;
  }

  return settlements;
}

function getShareAmount(expense, personId) {
  if (expense.splitMethod === "percentage") {
    return Number(expense.amount) * (Number(expense.shares?.[personId] || 0) / 100);
  }
  if (expense.splitMethod === "custom") {
    return Number(expense.shares?.[personId] || 0);
  }
  return Number(expense.amount) / Math.max(expense.participantIds.length, 1);
}

export default function SplitExpenses() {
  const {
    splitPeople,
    splitExpenses,
    splitStats,
    splitSetupRequired,
    categories,
    isStartupMode,
    addSplitPerson,
    deleteSplitPerson,
    addSplitExpense,
    updateSplitExpense,
    deleteSplitExpense,
  } = useApp();
  const [personName, setPersonName] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [savingPerson, setSavingPerson] = useState(false);

  const peopleById = useMemo(() => Object.fromEntries(splitPeople.map((person) => [person.id, person])), [splitPeople]);
  const settlements = useMemo(() => getSettlements(splitPeople, splitStats.balances), [splitPeople, splitStats.balances]);

  if (!isStartupMode) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <Users size={22} className="text-gold" /> Startup Splits
          </h2>
          <p className="mt-1 text-sm text-muted">Split expense tracking is available for startup accounts.</p>
        </div>

        <section className="glass rounded-2xl p-6 text-sm text-muted">
          This account is currently set up for personal expense tracking, so startup co-founder split tools are hidden.
        </section>
      </div>
    );
  }

  const handleAddPerson = async (event) => {
    event.preventDefault();
    const name = personName.trim();
    if (!name) return;
    if (splitPeople.some((person) => person.name.toLowerCase() === name.toLowerCase())) return;

    setSavingPerson(true);
    try {
      const person = await addSplitPerson({ name });
      setPersonName("");
      setEditingExpense((prev) => (prev ? { ...prev, participantIds: [...prev.participantIds, person.id] } : prev));
    } finally {
      setSavingPerson(false);
    }
  };

  const resetExpenseForm = () => {
    setEditingExpense(null);
  };

  const editSplitExpense = (item) => {
    setEditingExpense(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitExpense = async (payload) => {
    if (editingExpense) {
      await updateSplitExpense(editingExpense.id, payload);
    } else {
      await addSplitExpense(payload);
    }
    resetExpenseForm();
  };

  const handleDeleteExpense = async (id) => {
    await deleteSplitExpense(id);
    if (editingExpense?.id === id) resetExpenseForm();
  };

  if (splitSetupRequired) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <Users size={22} className="text-gold" /> Split Expenses
          </h2>
          <p className="mt-1 text-sm text-muted">Split group expenses and see who owes whom.</p>
        </div>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Split tables need setup</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Run the updated <code className="rounded bg-white/10 px-1 text-ink">supabase/schema.sql</code> in Supabase SQL Editor,
                then refresh this page.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div>
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <Users size={22} className="text-gold" /> Split Expenses
        </h2>
        <p className="mt-1 text-sm text-muted">Track shared spending, payer details, and simple settlement balances.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink">People</h3>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted">{splitPeople.length} total</span>
          </div>
          <form onSubmit={handleAddPerson} className="flex gap-2">
            <Input
              className="h-full"
              placeholder="e.g. Rushi"
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
            />
            <Button type="submit" icon={UserPlus} loading={savingPerson}>
              Add
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            {splitPeople.length ? (
              splitPeople.map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                  <span className="text-sm font-medium text-ink">{person.name}</span>
                  <button
                    type="button"
                    onClick={() => deleteSplitPerson(person.id)}
                    className="rounded-lg p-1.5 text-muted transition hover:bg-coral-soft hover:text-coral"
                    aria-label={`Remove ${person.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <EmptyState icon={Users} title="No people yet" description="Add friends, roommates, or family members first." />
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-ink">
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h3>
              <p className="mt-1 text-xs text-muted">
                {editingExpense ? "Update payer, amount, date, or who shared it." : "Choose who paid and how the cost is split."}
              </p>
            </div>
            {editingExpense && (
              <Button type="button" variant="ghost" size="sm" icon={X} onClick={resetExpenseForm}>
                Cancel
              </Button>
            )}
          </div>
          <SplitExpenseForm
            key={editingExpense?.id || "new"}
            people={splitPeople}
            categories={categories}
            initial={editingExpense}
            submitLabel={editingExpense ? "Save Expense" : "Add Expense"}
            onSubmit={handleSubmitExpense}
          />
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-sm font-semibold text-ink">Balances</h3>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted">
              Total split {formatCurrency(splitStats.totalSplit)}
            </span>
          </div>

          {splitPeople.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {splitPeople.map((person) => {
                const balance = Number(splitStats.balances[person.id] || 0);
                return (
                  <div key={person.id} className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm font-medium text-ink">{person.name}</p>
                    <p className={`mt-1 font-mono-num text-lg font-bold ${balance >= 0 ? "text-emerald" : "text-coral"}`}>
                      {formatCurrency(balance)}
                    </p>
                    <p className="text-xs text-muted">{balance >= 0 ? "gets back" : "owes"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Users} title="No balances yet" description="Add people and shared expenses to calculate balances." />
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Settle Up</h3>
          {settlements.length ? (
            <div className="flex flex-col gap-3">
              {settlements.map((settlement) => (
                <div key={`${settlement.from}-${settlement.to}-${settlement.amount}`} className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{settlement.from}</span> pays <span className="font-semibold">{settlement.to}</span>
                  </p>
                  <p className="mt-1 font-mono-num text-sm font-bold text-gold">{formatCurrency(settlement.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white/5 p-4 text-sm text-muted">Everyone is settled up.</p>
          )}
        </section>
      </div>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-ink">Recent Split Expenses</h3>
          <Receipt size={17} className="text-gold" />
        </div>

        {splitExpenses.length ? (
          <div className="divide-y divide-border/50">
            {splitExpenses.map((item) => {
              const paidBy = peopleById[item.paidBy]?.name || "Unknown";
              const participants = item.participantIds.map((id) => peopleById[id]?.name || "Unknown").join(", ");
              const splitLabel =
                item.splitMethod === "percentage"
                  ? "percentage split"
                  : item.splitMethod === "custom"
                    ? "custom split"
                    : `${formatCurrency(getShareAmount(item, item.participantIds[0]))} each`;
              return (
                <div key={item.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-ink">{item.description}</p>
                    <p className="mt-1 text-xs text-muted">
                      Paid by {paidBy} on {formatDate(item.date)} • split with {participants}
                    </p>
                    <p className="mt-1 text-xs text-muted">Share: {splitLabel}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="font-mono-num text-sm font-bold text-ink">{formatCurrency(item.amount)}</span>
                    <button
                      type="button"
                      onClick={() => editSplitExpense(item)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-gold"
                      aria-label={`Edit ${item.description}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(item.id)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-coral-soft hover:text-coral"
                      aria-label={`Delete ${item.description}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState icon={Receipt} title="No split expenses yet" description="Add a shared expense to see it here." />
          </div>
        )}
      </section>
    </div>
  );
}
