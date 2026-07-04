import { todayISO } from "../utils/format";

// Generates a small set of realistic sample transactions so the dashboard
// and charts have something meaningful to show on a first visit.
export function generateSampleTransactions() {
  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  return [
    { id: "s1", type: "income", amount: 45000, category: "salary", description: "Monthly salary", date: daysAgo(2), createdAt: Date.now() - 1 },
    { id: "s2", type: "expense", amount: 12000, category: "bills", description: "Rent", date: daysAgo(2), createdAt: Date.now() - 2 },
    { id: "s3", type: "expense", amount: 850, category: "food", description: "Groceries", date: daysAgo(4), createdAt: Date.now() - 3 },
    { id: "s4", type: "expense", amount: 320, category: "transport", description: "Petrol", date: daysAgo(5), createdAt: Date.now() - 4 },
    { id: "s5", type: "income", amount: 8000, category: "freelance", description: "Logo design project", date: daysAgo(6), createdAt: Date.now() - 5 },
    { id: "s6", type: "expense", amount: 1499, category: "entertainment", description: "Streaming subscriptions", date: daysAgo(8), createdAt: Date.now() - 6 },
    { id: "s7", type: "expense", amount: 2200, category: "shopping", description: "New shoes", date: daysAgo(10), createdAt: Date.now() - 7 },
    { id: "s8", type: "expense", amount: 600, category: "health", description: "Pharmacy", date: daysAgo(12), createdAt: Date.now() - 8 },
    { id: "s9", type: "expense", amount: 1800, category: "education", description: "Online course", date: daysAgo(15), createdAt: Date.now() - 9 },
    { id: "s10", type: "expense", amount: 500, category: "food", description: "Dinner out", date: daysAgo(1), createdAt: Date.now() - 10 },
    { id: "s11", type: "expense", amount: 150, category: "transport", description: "Auto fare", date: todayISO(), createdAt: Date.now() - 11 },
  ];
}
