import { useState } from "react";
import { Calendar, FileText, IndianRupee, Pencil, Plus, Tags, X } from "lucide-react";
import { formatCurrency, todayISO } from "../../utils/format";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const emptyExpense = {
  description: "",
  amount: "",
  category: "",
  paidBy: "",
  participantIds: [],
  splitMethod: "equal",
  shares: {},
  date: todayISO(),
};

export default function SplitExpenseForm({
  people,
  categories = [],
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  showCancel = false,
}) {
  const [expense, setExpense] = useState(() => ({
    ...emptyExpense,
    paidBy: initial?.paidBy || people[0]?.id || "",
    participantIds: initial?.participantIds || people.map((person) => person.id),
    ...initial,
    amount: initial?.amount ? String(initial.amount) : initial?.amount || "",
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initial?.id);
  const splitAmount = Number(expense.amount) || 0;
  const selectedPeople = people.filter((person) => expense.participantIds.includes(person.id));
  const expenseCategories = categories.filter((category) => category.type === "expense" || category.type === "both");

  const equalShare = selectedPeople.length ? splitAmount / selectedPeople.length : 0;
  const allocationTotal = selectedPeople.reduce((sum, person) => sum + Number(expense.shares?.[person.id] || 0), 0);

  const toggleParticipant = (personId) => {
    setExpense((prev) => {
      const selected = prev.participantIds.includes(personId);
      return {
        ...prev,
        participantIds: selected
          ? prev.participantIds.filter((id) => id !== personId)
          : [...prev.participantIds, personId],
      };
    });
  };

  const setShare = (personId, value) => {
    setExpense((prev) => ({
      ...prev,
      shares: {
        ...prev.shares,
        [personId]: value,
      },
    }));
  };

  const validate = () => {
    const next = {};
    if (!expense.description.trim()) next.description = "Add a short description";
    if (!expense.amount || Number(expense.amount) <= 0) next.amount = "Enter an amount greater than 0";
    if (!expense.category) next.category = "Choose a category";
    if (!expense.paidBy) next.paidBy = "Choose who paid";
    if (!expense.participantIds.length) next.participantIds = "Choose at least one person responsible for this expense";
    if (expense.splitMethod === "percentage" && Math.abs(allocationTotal - 100) > 0.01) {
      next.allocations = "Percentages must add up to 100";
    }
    if (expense.splitMethod === "custom" && Math.abs(allocationTotal - splitAmount) > 0.01) {
      next.allocations = `Custom shares must add up to ${formatCurrency(splitAmount)}`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const shares =
        expense.splitMethod === "equal"
          ? {}
          : Object.fromEntries(selectedPeople.map((person) => [person.id, Number(expense.shares?.[person.id] || 0)]));

      await onSubmit({
        ...expense,
        amount: Number(expense.amount),
        shares,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input
        label="Description"
        icon={FileText}
        placeholder="e.g. Domain renewal"
        value={expense.description}
        error={errors.description}
        onChange={(event) => setExpense((prev) => ({ ...prev, description: event.target.value }))}
      />
      <Input
        label="Amount"
        icon={IndianRupee}
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={expense.amount}
        error={errors.amount}
        onChange={(event) => setExpense((prev) => ({ ...prev, amount: event.target.value }))}
      />
      <Select
        label="Category"
        value={expense.category}
        error={errors.category}
        onChange={(event) => setExpense((prev) => ({ ...prev, category: event.target.value }))}
        options={[
          { value: "", label: "Select category" },
          ...expenseCategories.map((category) => ({ value: category.id, label: category.name })),
        ]}
      />
      <Select
        label="Paid by"
        value={expense.paidBy}
        error={errors.paidBy}
        onChange={(event) => setExpense((prev) => ({ ...prev, paidBy: event.target.value }))}
        options={[
          { value: "", label: "Select payer" },
          ...people.map((person) => ({ value: person.id, label: person.name })),
        ]}
      />
      <Select
        label="Split method"
        value={expense.splitMethod}
        onChange={(event) => setExpense((prev) => ({ ...prev, splitMethod: event.target.value }))}
        options={[
          { value: "equal", label: "Equal split" },
          { value: "percentage", label: "By percentage" },
          { value: "custom", label: "Custom amounts" },
        ]}
      />
      <Input
        label="Date"
        icon={Calendar}
        type="date"
        value={expense.date}
        max={todayISO()}
        onChange={(event) => setExpense((prev) => ({ ...prev, date: event.target.value }))}
      />

      <div className="md:col-span-2">
        <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-xs font-medium text-muted">Responsible people</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExpense((prev) => ({ ...prev, participantIds: people.map((person) => person.id) }))}
              className="text-xs font-medium text-gold hover:text-ink"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setExpense((prev) => ({ ...prev, participantIds: [] }))}
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {people.map((person) => (
            <button
              type="button"
              key={person.id}
              onClick={() => toggleParticipant(person.id)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                expense.participantIds.includes(person.id)
                  ? "border-gold/50 bg-gold-soft text-gold"
                  : "border-border text-muted hover:bg-white/5 hover:text-ink"
              }`}
            >
              {person.name}
            </button>
          ))}
        </div>
        {errors.participantIds && <p className="mt-1.5 text-xs text-coral">{errors.participantIds}</p>}
      </div>

      {selectedPeople.length > 0 && (
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-xs font-medium text-muted">Allocation</label>
            {expense.splitMethod !== "equal" && (
              <span className={`text-xs ${errors.allocations ? "text-coral" : "text-muted"}`}>
                Total {expense.splitMethod === "percentage" ? `${allocationTotal.toFixed(2)}%` : formatCurrency(allocationTotal)}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            {selectedPeople.map((person) => (
              <div key={person.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{person.name}</p>
                  <p className="text-xs text-muted">
                    {expense.splitMethod === "equal"
                      ? `${formatCurrency(equalShare)} share`
                      : expense.splitMethod === "percentage"
                        ? `${formatCurrency(splitAmount * (Number(expense.shares?.[person.id] || 0) / 100))} share`
                        : "Custom share"}
                  </p>
                </div>

                {expense.splitMethod === "equal" ? (
                  <span className="font-mono-num text-sm font-bold text-ink">{formatCurrency(equalShare)}</span>
                ) : (
                  <div className="relative w-28">
                    {expense.splitMethod === "percentage" ? (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
                    ) : (
                      <Tags size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    )}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expense.shares?.[person.id] || ""}
                      onChange={(event) => setShare(person.id, event.target.value)}
                      className={`w-full rounded-lg border border-border bg-white/5 py-2 text-right text-sm text-ink focus:border-gold/40 focus:outline-none ${
                        expense.splitMethod === "percentage" ? "pl-3 pr-7" : "pl-8 pr-3"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors.allocations && <p className="mt-1.5 text-xs text-coral">{errors.allocations}</p>}
        </div>
      )}

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
        {showCancel && (
          <Button type="button" variant="secondary" fullWidth icon={X} onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" fullWidth={showCancel} icon={isEditing ? Pencil : Plus} loading={saving} disabled={people.length === 0}>
          {submitLabel || (isEditing ? "Save Expense" : "Add Expense")}
        </Button>
      </div>
    </form>
  );
}
