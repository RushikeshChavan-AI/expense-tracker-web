import { useState } from "react";
import { Calendar, FileText, IndianRupee, WalletCards } from "lucide-react";
import { todayISO } from "../../utils/format";
import { SETTLEMENT_METHOD_OPTIONS, SETTLEMENT_STATUS_OPTIONS } from "../../utils/settlements";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

export default function SettlementForm({ people, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    fromPersonId: initial?.fromPersonId || "",
    toPersonId: initial?.toPersonId || "",
    amount: initial?.amount ? String(initial.amount) : "",
    method: "upi",
    status: "settled",
    date: todayISO(),
    note: "",
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const peopleOptions = [
    { value: "", label: "Select person" },
    ...people.map((person) => ({ value: person.id, label: person.name })),
  ];

  const validate = () => {
    const next = {};
    if (!form.fromPersonId) next.fromPersonId = "Choose who paid";
    if (!form.toPersonId) next.toPersonId = "Choose who received";
    if (form.fromPersonId && form.fromPersonId === form.toPersonId) next.toPersonId = "Choose a different person";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Enter an amount greater than 0";
    if (!form.date) next.date = "Choose a date";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Select
        label="Paid by"
        value={form.fromPersonId}
        error={errors.fromPersonId}
        onChange={(event) => setForm((prev) => ({ ...prev, fromPersonId: event.target.value }))}
        options={peopleOptions}
      />
      <Select
        label="Paid to"
        value={form.toPersonId}
        error={errors.toPersonId}
        onChange={(event) => setForm((prev) => ({ ...prev, toPersonId: event.target.value }))}
        options={peopleOptions}
      />
      <Input
        label="Amount"
        icon={IndianRupee}
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={form.amount}
        error={errors.amount}
        onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
      />
      <Select
        label="Method"
        value={form.method}
        onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
        options={SETTLEMENT_METHOD_OPTIONS}
      />
      <Select
        label="Status"
        value={form.status}
        onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
        options={SETTLEMENT_STATUS_OPTIONS}
      />
      <Input
        label="Date"
        icon={Calendar}
        type="date"
        value={form.date}
        error={errors.date}
        max={todayISO()}
        onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
      />
      <div className="md:col-span-2">
        <Input
          label="Note"
          icon={FileText}
          placeholder="e.g. UPI reference or partial settlement note"
          value={form.note}
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" fullWidth icon={WalletCards} loading={saving}>
          Record Payment
        </Button>
      </div>
    </form>
  );
}
