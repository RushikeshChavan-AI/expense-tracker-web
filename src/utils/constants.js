export const STORAGE_KEYS = {
  TRANSACTIONS: "aiet_transactions",
  CATEGORIES: "aiet_categories",
  SETTINGS: "aiet_settings",
};

// Default categories. `type` is "income", "expense", or "both".
export const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food", type: "expense", color: "#FB7185", icon: "UtensilsCrossed", custom: false },
  { id: "transport", name: "Transport", type: "expense", color: "#818CF8", icon: "Car", custom: false },
  { id: "shopping", name: "Shopping", type: "expense", color: "#F5C451", icon: "ShoppingBag", custom: false },
  { id: "bills", name: "Bills", type: "expense", color: "#38BDF8", icon: "Receipt", custom: false },
  { id: "entertainment", name: "Entertainment", type: "expense", color: "#C084FC", icon: "Clapperboard", custom: false },
  { id: "health", name: "Health", type: "expense", color: "#4ADE80", icon: "HeartPulse", custom: false },
  { id: "education", name: "Education", type: "expense", color: "#FB923C", icon: "GraduationCap", custom: false },
  { id: "salary", name: "Salary", type: "income", color: "#34D399", icon: "Wallet", custom: false },
  { id: "freelance", name: "Freelance", type: "income", color: "#2DD4BF", icon: "Laptop", custom: false },
  { id: "other", name: "Other", type: "both", color: "#94A3B8", icon: "MoreHorizontal", custom: false },
];

export const CURRENCY = "₹";

export const CHART_COLORS = [
  "#34D399",
  "#FB7185",
  "#F5C451",
  "#818CF8",
  "#38BDF8",
  "#C084FC",
  "#4ADE80",
  "#FB923C",
  "#2DD4BF",
  "#94A3B8",
];
