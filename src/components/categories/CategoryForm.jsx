import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { ICON_OPTIONS, getCategoryIcon } from "../../utils/categoryIcon";

const COLOR_SWATCHES = ["#34D399", "#FB7185", "#F5C451", "#818CF8", "#38BDF8", "#C084FC", "#4ADE80", "#FB923C", "#2DD4BF", "#94A3B8"];

const emptyForm = { name: "", type: "expense", color: COLOR_SWATCHES[0], icon: ICON_OPTIONS[0] };

export default function CategoryForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter a category name");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Category name"
        placeholder="e.g. Subscriptions"
        value={form.name}
        error={error}
        onChange={(e) => {
          setForm((f) => ({ ...f, name: e.target.value }));
          setError("");
        }}
      />

      <Select
        label="Applies to"
        value={form.type}
        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        options={[
          { value: "expense", label: "Expense" },
          { value: "income", label: "Income" },
          { value: "both", label: "Both" },
        ]}
      />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => setForm((f) => ({ ...f, color }))}
              aria-label={`Select color ${color}`}
              className={`h-7 w-7 rounded-full transition ${form.color === color ? "ring-2 ring-offset-2 ring-offset-bg-soft ring-white/60" : ""}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((iconName) => {
            const Icon = getCategoryIcon(iconName);
            return (
              <button
                type="button"
                key={iconName}
                onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                aria-label={`Select icon ${iconName}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  form.icon === iconName ? "border-gold/50 bg-gold-soft text-gold" : "border-border text-muted hover:text-ink"
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={submitting}>
          {initial ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
