import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Database, ExternalLink } from "lucide-react";
import { DEFAULT_CATEGORIES } from "../utils/constants";
import { isSameMonth } from "../utils/format";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import {
  createCategory,
  createSplitExpense,
  createSplitPerson,
  createTransaction,
  fetchUserData,
  importTransactionRows,
  removeCategory,
  removeSplitExpense,
  removeSplitPerson,
  removeTransaction,
  resetUserData,
  saveCategory,
  saveSplitExpense,
  saveTransaction,
} from "../services/supabaseDataService";

const AppContext = createContext(null);

function getSplitShareAmounts(expense) {
  const amount = Number(expense.amount) || 0;
  const participantIds = expense.participantIds || [];
  if (!participantIds.length) return {};

  if (expense.splitMethod === "percentage") {
    return Object.fromEntries(
      participantIds.map((participantId) => [
        participantId,
        amount * (Number(expense.shares?.[participantId] || 0) / 100),
      ])
    );
  }

  if (expense.splitMethod === "custom") {
    return Object.fromEntries(
      participantIds.map((participantId) => [participantId, Number(expense.shares?.[participantId] || 0)])
    );
  }

  const equalShare = amount / participantIds.length;
  return Object.fromEntries(participantIds.map((participantId) => [participantId, equalShare]));
}

export function AppProvider({ children }) {
  const toast = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [splitPeople, setSplitPeople] = useState([]);
  const [splitExpenses, setSplitExpenses] = useState([]);
  const [splitSetupRequired, setSplitSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadUserData() {
      if (!user) return;
      setLoading(true);
      setSetupError(null);
      try {
        const data = await fetchUserData(user);
        if (!active) return;
        setProfile(data.profile);
        setTransactions(data.transactions);
        setCategories(data.categories);
        setSplitPeople(data.splitPeople);
        setSplitExpenses(data.splitExpenses);
        setSplitSetupRequired(data.splitSetupRequired);
      } catch (err) {
        if (!active) return;
        if (err.code === "PGRST205" || err.message?.includes("schema cache")) {
          setSetupError(err);
          return;
        }
        toast.error(err.message || "Failed to load your Supabase data");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUserData();

    return () => {
      active = false;
    };
  }, [toast, user]);

  const addTransaction = async (data) => {
    try {
      const record = await createTransaction(user.id, data);
      setTransactions((prev) => [record, ...prev]);
      toast.success(`${data.type === "income" ? "Income" : "Expense"} added successfully`);
      return record;
    } catch (err) {
      toast.error(err.message || "Failed to add transaction");
      throw err;
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const record = await saveTransaction(id, data);
      setTransactions((prev) => prev.map((t) => (t.id === id ? record : t)));
      toast.success("Transaction updated");
    } catch (err) {
      toast.error(err.message || "Failed to update transaction");
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await removeTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.info("Transaction deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete transaction");
      throw err;
    }
  };

  const importTransactions = async (records) => {
    try {
      const imported = await importTransactionRows(user.id, records);
      setTransactions((prev) => [...imported, ...prev]);
      toast.success(`Imported ${imported.length} transactions`);
    } catch (err) {
      toast.error(err.message || "Failed to import transactions");
      throw err;
    }
  };

  const addCategory = async (data) => {
    try {
      const category = await createCategory(user.id, data);
      setCategories((prev) => [...prev, category]);
      toast.success(`Category "${data.name}" created`);
      return category;
    } catch (err) {
      toast.error(err.message || "Failed to create category");
      throw err;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const category = await saveCategory(id, data);
      setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
      toast.success("Category updated");
    } catch (err) {
      toast.error(err.message || "Failed to update category");
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await removeCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.info("Category deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
      throw err;
    }
  };

  const clearAllData = async () => {
    try {
      const seededCategories = await resetUserData(user.id);
      setTransactions([]);
      setCategories(seededCategories);
      setSplitPeople([]);
      setSplitExpenses([]);
      toast.warning("All data has been cleared");
    } catch (err) {
      toast.error(err.message || "Failed to clear data");
      throw err;
    }
  };

  const addSplitPerson = async (data) => {
    try {
      const person = await createSplitPerson(user.id, data);
      setSplitPeople((prev) => [...prev, person]);
      toast.success(`${person.name} added to splits`);
      return person;
    } catch (err) {
      toast.error(err.message || "Failed to add split person");
      throw err;
    }
  };

  const deleteSplitPerson = async (id) => {
    const isUsed = splitExpenses.some((expense) => expense.paidBy === id || expense.participantIds.includes(id));
    if (isUsed) {
      toast.warning("Delete that person's split expenses before removing them");
      return;
    }

    try {
      await removeSplitPerson(id);
      setSplitPeople((prev) => prev.filter((person) => person.id !== id));
      toast.info("Split person removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove split person");
      throw err;
    }
  };

  const addSplitExpense = async (data) => {
    try {
      const expense = await createSplitExpense(user.id, data);
      setSplitExpenses((prev) => [expense, ...prev]);
      toast.success("Split expense added");
      return expense;
    } catch (err) {
      toast.error(err.message || "Failed to add split expense");
      throw err;
    }
  };

  const updateSplitExpense = async (id, data) => {
    try {
      const expense = await saveSplitExpense(id, data);
      setSplitExpenses((prev) => prev.map((item) => (item.id === id ? expense : item)));
      toast.success("Split expense updated");
      return expense;
    } catch (err) {
      toast.error(err.message || "Failed to update split expense");
      throw err;
    }
  };

  const deleteSplitExpense = async (id) => {
    try {
      await removeSplitExpense(id);
      setSplitExpenses((prev) => prev.filter((expense) => expense.id !== id));
      toast.info("Split expense deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete split expense");
      throw err;
    }
  };

  const splitStats = useMemo(() => {
    const balances = Object.fromEntries(splitPeople.map((person) => [person.id, 0]));

    splitExpenses.forEach((expense) => {
      const shares = getSplitShareAmounts(expense);
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + Number(expense.amount);
      Object.entries(shares).forEach(([participantId, share]) => {
        balances[participantId] = (balances[participantId] || 0) - Number(share);
      });
    });

    return {
      totalSplit: splitExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      balances,
    };
  }, [splitExpenses, splitPeople]);

  const isStartupAccount = profile?.accountType === "startup";

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = isStartupAccount
      ? splitExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
      : transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;

    const monthly = transactions.filter((t) => isSameMonth(t.date));
    const monthlyIncome = monthly
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyExpense = isStartupAccount
      ? splitExpenses.filter((expense) => isSameMonth(expense.date)).reduce((sum, expense) => sum + Number(expense.amount), 0)
      : monthly.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory = {};
    const categoryRows = isStartupAccount ? splitExpenses : transactions.filter((t) => t.type === "expense");
    categoryRows.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });
    const topCategoryId = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      totalIncome,
      totalExpense,
      balance,
      monthlyIncome,
      monthlyExpense,
      byCategory,
      topCategoryId,
    };
  }, [isStartupAccount, splitExpenses, transactions]);

  const getCategory = (id) => categories.find((c) => c.id === id);

  const value = {
    profile,
    isStartupMode: isStartupAccount,
    transactions,
    categories,
    splitPeople,
    splitExpenses,
    splitStats,
    splitSetupRequired,
    stats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    addCategory,
    updateCategory,
    deleteCategory,
    clearAllData,
    addSplitPerson,
    deleteSplitPerson,
    addSplitExpense,
    updateSplitExpense,
    deleteSplitExpense,
    getCategory,
    loading,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader label="Loading your workspace..." />
      </div>
    );
  }

  if (setupError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-ink">
        <section className="glass w-full max-w-2xl rounded-2xl p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
              <Database size={20} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Supabase database is not initialized</h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                The app reached Supabase, but the required <code className="rounded bg-white/10 px-1 text-ink">categories</code>{" "}
                and <code className="rounded bg-white/10 px-1 text-ink">transactions</code> tables were not found.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4 text-sm text-muted">
            <p className="font-medium text-ink">Run one of these setup paths once:</p>
            <p className="mt-3">
              SQL Editor: paste and run <code className="rounded bg-white/10 px-1 text-ink">supabase/schema.sql</code>
            </p>
            <p className="mt-2">
              Local script: set <code className="rounded bg-white/10 px-1 text-ink">SUPABASE_DB_URL</code> in{" "}
              <code className="rounded bg-white/10 px-1 text-ink">.env</code>, then run{" "}
              <code className="rounded bg-white/10 px-1 text-ink">npm run supabase:init</code>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" icon={ExternalLink} onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
              Open Supabase
            </Button>
            <Button onClick={() => window.location.reload()}>Retry connection</Button>
          </div>
        </section>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
