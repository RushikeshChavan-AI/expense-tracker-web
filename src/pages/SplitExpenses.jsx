import { useMemo, useState } from "react";
import { Database, Pencil, Receipt, Trash2, UserPlus, Users, WalletCards, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatDate } from "../utils/format";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import SplitExpenseForm from "../components/split/SplitExpenseForm";
import SettlementForm from "../components/split/SettlementForm";
import { formatSettlementMethod, formatSettlementStatus } from "../utils/settlements";

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
    splitSettlements,
    splitStats,
    splitSetupRequired,
    categories,
    isStartupMode,
    addSplitPerson,
    deleteSplitPerson,
    addSplitExpense,
    updateSplitExpense,
    deleteSplitExpense,
    addSplitSettlement,
    deleteSplitSettlement,
  } = useApp();
  const [personName, setPersonName] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [settlementInitial, setSettlementInitial] = useState(null);
  const [pendingDeleteSettlement, setPendingDeleteSettlement] = useState(null);
  const [savingPerson, setSavingPerson] = useState(false);

  const peopleById = useMemo(() => Object.fromEntries(splitPeople.map((person) => [person.id, person])), [splitPeople]);
  const settlements = splitStats.settlementSuggestions || [];

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

  const openSettlementForm = (settlement = null) => {
    setSettlementInitial(settlement || {});
  };

  const handleSubmitSettlement = async (payload) => {
    await addSplitSettlement(payload);
    setSettlementInitial(null);
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-ink">Settle Up</h3>
              <p className="mt-1 text-xs text-muted">Record repayments without counting them as company expenses.</p>
            </div>
            <Button type="button" size="sm" variant="secondary" icon={WalletCards} onClick={() => openSettlementForm()}>
              Record
            </Button>
          </div>
          {settlements.length ? (
            <div className="flex flex-col gap-3">
              {settlements.map((settlement) => (
                <div key={`${settlement.fromPersonId}-${settlement.toPersonId}-${settlement.amount}`} className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{settlement.from}</span> pays <span className="font-semibold">{settlement.to}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="font-mono-num text-sm font-bold text-gold">{formatCurrency(settlement.amount)}</p>
                    <button
                      type="button"
                      onClick={() => openSettlementForm(settlement)}
                      className="text-xs font-medium text-gold hover:text-ink"
                    >
                      Record payment
                    </button>
                  </div>
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
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">Settlement History</h3>
            <p className="mt-1 text-xs text-muted">
              Settled and partial payments reduce balances. Pending records keep the balance open.
            </p>
          </div>
          <WalletCards size={17} className="text-gold" />
        </div>

        {splitSettlements.length ? (
          <div className="divide-y divide-border/50">
            {splitSettlements.map((settlement) => {
              const from = peopleById[settlement.fromPersonId]?.name || "Unknown";
              const to = peopleById[settlement.toPersonId]?.name || "Unknown";
              const statusTone =
                settlement.status === "settled"
                  ? "bg-emerald-soft text-emerald"
                  : settlement.status === "partial"
                    ? "bg-gold-soft text-gold"
                    : "bg-white/5 text-muted";
              return (
                <div key={settlement.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{from}</span> paid <span className="font-semibold">{to}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatSettlementMethod(settlement.method)} · {formatDate(settlement.date)}
                      {settlement.note ? ` · ${settlement.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone}`}>
                      {formatSettlementStatus(settlement.status)}
                    </span>
                    <span className="font-mono-num text-sm font-bold text-ink">{formatCurrency(settlement.amount)}</span>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteSettlement(settlement)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-coral-soft hover:text-coral"
                      aria-label={`Delete settlement from ${from} to ${to}`}
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
            <EmptyState icon={WalletCards} title="No settlements recorded" description="Record repayments between founders here." />
          </div>
        )}
      </section>

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

      <Modal open={settlementInitial !== null} onClose={() => setSettlementInitial(null)} title="Record Payment" size="md">
        <SettlementForm
          people={splitPeople}
          initial={settlementInitial}
          onSubmit={handleSubmitSettlement}
          onCancel={() => setSettlementInitial(null)}
        />
      </Modal>

      <ConfirmDialog
        open={!!pendingDeleteSettlement}
        title="Delete settlement?"
        description={
          pendingDeleteSettlement
            ? `Delete this ${formatCurrency(pendingDeleteSettlement.amount)} settlement record? This will also restore that amount to the open balance if it was settled or partial.`
            : ""
        }
        onCancel={() => setPendingDeleteSettlement(null)}
        onConfirm={async () => {
          try {
            await deleteSplitSettlement(pendingDeleteSettlement.id);
            setPendingDeleteSettlement(null);
          } catch {
            // AppContext already shows the error toast.
          }
        }}
      />
    </div>
  );
}
