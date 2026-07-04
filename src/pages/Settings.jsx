import { useRef, useState } from "react";
import { Database, Download, Upload, Trash2, Settings as SettingsIcon, KeyRound, UserRound } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { exportTransactionsToCSV, parseTransactionsCSV } from "../services/csvService";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function Settings() {
  const { transactions, categories, importTransactions, clearAllData } = useApp();
  const { user, isSupabaseConfigured } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  const handleExport = () => {
    if (!transactions.length) {
      toast.warning("No transactions to export yet");
      return;
    }
    exportTransactionsToCSV(transactions, categories);
    toast.success("Transactions exported to CSV");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const { records, errors } = parseTransactionsCSV(text, categories);
      if (records.length) await importTransactions(records);
      if (errors.length) {
        toast.warning(`Skipped ${errors.length} row(s) with issues. Check console for details.`);
        console.warn("CSV import issues:", errors);
      }
      if (!records.length && !errors.length) {
        toast.info("The file didn't contain any transactions to import.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to import the CSV file.");
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <SettingsIcon size={22} className="text-gold" /> Settings
        </h2>
        <p className="mt-1 text-sm text-muted">Manage your data and configuration.</p>
      </div>

      <section className="glass rounded-2xl p-6">
        <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <UserRound size={15} className="text-gold" /> Account
        </h3>
        <p className="mb-3 text-xs text-muted">Your transactions and categories are scoped to this signed-in user.</p>
        <div className="rounded-xl bg-white/5 p-4 text-xs text-muted">
          Signed in as <span className="font-medium text-ink">{user?.email}</span>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Database size={15} className="text-gold" /> Supabase
        </h3>
        <p className="mb-3 text-xs text-muted">Authentication and account-specific data storage are powered by Supabase.</p>
        <div className="rounded-xl bg-white/5 p-4 text-xs">
          <p className="text-muted">
            Status:{" "}
            <span className={isSupabaseConfigured ? "font-medium text-emerald" : "font-medium text-coral"}>
              {isSupabaseConfigured ? "Configured" : "Missing environment variables"}
            </span>
          </p>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="mb-1 font-display text-sm font-semibold text-ink">Data Export &amp; Import</h3>
        <p className="mb-4 text-xs text-muted">Back up your transactions to CSV, or import from a previous export.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export to CSV
          </Button>
          <Button variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
            Import from CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <KeyRound size={15} className="text-gold" /> AI Assistant Configuration
        </h3>
        <p className="mb-3 text-xs text-muted">
          The AI Assistant uses the OpenAI API via an environment variable — never hardcoded.
        </p>
        <div className="rounded-xl bg-white/5 p-4 text-xs">
          <p className="mb-2 text-muted">
            Status:{" "}
            <span className={hasApiKey ? "font-medium text-emerald" : "font-medium text-coral"}>
              {hasApiKey ? "API key detected" : "No API key configured"}
            </span>
          </p>
          <p className="text-muted">
            To enable it, copy <code className="rounded bg-white/10 px-1.5 py-0.5 text-ink">.env.example</code> to{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-ink">.env</code> and set{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-ink">VITE_OPENAI_API_KEY</code>, then restart the dev server.
          </p>
        </div>
      </section>

      <section className="glass rounded-2xl border border-coral/20 p-6">
        <h3 className="mb-1 font-display text-sm font-semibold text-coral">Danger Zone</h3>
        <p className="mb-4 text-xs text-muted">Permanently clear all transactions and reset categories to defaults.</p>
        <Button variant="danger" icon={Trash2} onClick={() => setConfirmClear(true)}>
          Clear all data
        </Button>
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        description="This will permanently delete every transaction and reset categories to their defaults. This action cannot be undone."
        onCancel={() => setConfirmClear(false)}
        onConfirm={async () => {
          try {
            await clearAllData();
            setConfirmClear(false);
          } catch {
            // AppContext already shows the error toast.
          }
        }}
      />
    </div>
  );
}
