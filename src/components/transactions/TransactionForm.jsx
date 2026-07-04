import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useApp } from "../../context/AppContext";
import { todayISO } from "../../utils/format";
import { IndianRupee, FileText, Calendar } from "lucide-react";

const emptyForm = { type: "expense", amount: "", category: "", description: "", date: todayISO() };

export default function TransactionForm({ initial, lockedType, onSubmit, onCancel }) {
  const { categories } = useApp();
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(lockedType ? { type: lockedType } : {}),
    ...initial,
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const relevantCategories = categories.filter(
    (c) => c.type === form.type || c.type === "both"
  );

  const validate = () => {
    const next = {};
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Enter a valid amount greater than 0";
    if (!form.category) next.category = "Please select a category";
    if (!form.date) next.date = "Please select a date";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!lockedType && (
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          {["expense", "income"].map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setForm((f) => ({ ...f, type, category: "" }))}
              className={`rounded-lg py-2 text-sm font-medium capitalize transition ${
                form.type === type
                  ? type === "income"
                    ? "bg-emerald-soft text-emerald"
                    : "bg-coral-soft text-coral"
                  : "text-muted hover:text-ink"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      <Input
        label="Amount"
        icon={IndianRupee}
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={form.amount}
        error={errors.amount}
        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
      />

      <Select
        label="Category"
        value={form.category}
        error={errors.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        options={[
          { value: "", label: "Select a category" },
          ...relevantCategories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />

      <Input
        label="Description"
        icon={FileText}
        placeholder="e.g. Groceries at the market"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />

      <Input
        label="Date"
        icon={Calendar}
        type="date"
        value={form.date}
        error={errors.date}
        max={todayISO()}
        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
      />

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={submitting}>
          {initial ? "Save changes" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
