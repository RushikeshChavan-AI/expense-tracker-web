import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatMonthLabel } from "../utils/format";
import { CHART_COLORS } from "../utils/constants";

export function useAnalytics() {
  const { transactions, splitExpenses, categories, isStartupMode } = useApp();

  return useMemo(() => {
    // Category pie (expenses only)
    const categoryTotals = {};
    const expenseRows = isStartupMode ? splitExpenses : transactions.filter((t) => t.type === "expense");
    expenseRows.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const categoryPieData = Object.entries(categoryTotals)
      .map(([id, value], i) => {
        const cat = categories.find((c) => c.id === id);
        return { name: cat?.name || id, value, color: cat?.color || CHART_COLORS[i % CHART_COLORS.length] };
      })
      .sort((a, b) => b.value - a.value);

    // Monthly income vs expense (last 6 months)
    const monthKey = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    };

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: formatMonthLabel(d) });
    }

    const monthlyMap = Object.fromEntries(
      months.map((m) => [m.key, { month: m.label, income: 0, expense: 0 }])
    );

    if (isStartupMode) {
      transactions
        .filter((t) => t.type === "income")
        .forEach((t) => {
          const key = monthKey(t.date);
          if (monthlyMap[key]) {
            monthlyMap[key].income += Number(t.amount);
          }
        });

      splitExpenses.forEach((expense) => {
        const key = monthKey(expense.date);
        if (monthlyMap[key]) {
          monthlyMap[key].expense += Number(expense.amount);
        }
      });
    } else {
      transactions.forEach((t) => {
        const key = monthKey(t.date);
        if (monthlyMap[key]) {
          monthlyMap[key][t.type === "income" ? "income" : "expense"] += Number(t.amount);
        }
      });
    }

    const monthlyBarData = months.map((m) => monthlyMap[m.key]);

    // Running balance trend across the same window
    let running = 0;
    const trendStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const priorTransactions = transactions.filter((t) => new Date(t.date) < trendStartDate);
    running = priorTransactions.reduce((sum, t) => {
      if (isStartupMode && t.type !== "income") return sum;
      return sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount));
    }, 0);

    if (isStartupMode) {
      running -= splitExpenses
        .filter((expense) => new Date(expense.date) < trendStartDate)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
    }

    const trendLineData = months.map((m) => {
      const entry = monthlyMap[m.key];
      running += entry.income - entry.expense;
      return { month: m.label, balance: running };
    });

    return { categoryPieData, monthlyBarData, trendLineData };
  }, [transactions, splitExpenses, categories, isStartupMode]);
}
