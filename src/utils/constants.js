export const STORAGE_KEYS = {
  TRANSACTIONS: "aiet_transactions",
  CATEGORIES: "aiet_categories",
  SETTINGS: "aiet_settings",
};

// Default categories. `type` is "income", "expense", or "both".
export const PERSONAL_DEFAULT_CATEGORIES = [
  { id: "groceries", name: "Groceries", type: "expense", color: "#4ADE80", icon: "ShoppingCart", custom: false },
  { id: "food", name: "Food & Dining", type: "expense", color: "#FB7185", icon: "UtensilsCrossed", custom: false },
  { id: "transport", name: "Transport", type: "expense", color: "#818CF8", icon: "Car", custom: false },
  { id: "rent", name: "Rent & Housing", type: "expense", color: "#38BDF8", icon: "Home", custom: false },
  { id: "utilities", name: "Utilities", type: "expense", color: "#F5C451", icon: "Zap", custom: false },
  { id: "shopping", name: "Shopping", type: "expense", color: "#F97316", icon: "ShoppingBag", custom: false },
  { id: "entertainment", name: "Entertainment", type: "expense", color: "#C084FC", icon: "Clapperboard", custom: false },
  { id: "health", name: "Health", type: "expense", color: "#34D399", icon: "HeartPulse", custom: false },
  { id: "education", name: "Education", type: "expense", color: "#FB923C", icon: "GraduationCap", custom: false },
  { id: "travel", name: "Travel", type: "expense", color: "#2DD4BF", icon: "Plane", custom: false },
  { id: "salary", name: "Salary", type: "income", color: "#34D399", icon: "Wallet", custom: false },
  { id: "freelance", name: "Freelance", type: "income", color: "#2DD4BF", icon: "Laptop", custom: false },
  { id: "investments", name: "Investments", type: "income", color: "#F5C451", icon: "PiggyBank", custom: false },
  { id: "gifts", name: "Gifts", type: "both", color: "#F472B6", icon: "Gift", custom: false },
  { id: "other", name: "Other", type: "both", color: "#94A3B8", icon: "MoreHorizontal", custom: false },
];

export const STARTUP_DEFAULT_CATEGORIES = [
  { id: "client-revenue", name: "Client Revenue", type: "income", color: "#34D399", icon: "Handshake", custom: false },
  { id: "product-revenue", name: "Product Revenue", type: "income", color: "#2DD4BF", icon: "ChartNoAxesCombined", custom: false },
  { id: "founder-capital", name: "Founder Capital", type: "income", color: "#F5C451", icon: "BadgeIndianRupee", custom: false },
  { id: "investment", name: "Investment", type: "income", color: "#818CF8", icon: "Landmark", custom: false },
  { id: "software", name: "Software & SaaS", type: "expense", color: "#818CF8", icon: "Monitor", custom: false },
  { id: "cloud-hosting", name: "Cloud & Hosting", type: "expense", color: "#38BDF8", icon: "Cloud", custom: false },
  { id: "domain-hosting", name: "Domains & Email", type: "expense", color: "#2DD4BF", icon: "Globe", custom: false },
  { id: "marketing", name: "Marketing", type: "expense", color: "#FB7185", icon: "Megaphone", custom: false },
  { id: "legal", name: "Legal", type: "expense", color: "#F5C451", icon: "Scale", custom: false },
  { id: "accounting", name: "Accounting", type: "expense", color: "#34D399", icon: "Calculator", custom: false },
  { id: "contractors", name: "Contractors", type: "expense", color: "#C084FC", icon: "UserRoundCheck", custom: false },
  { id: "payroll", name: "Payroll", type: "expense", color: "#F97316", icon: "Users", custom: false },
  { id: "equipment", name: "Equipment", type: "expense", color: "#94A3B8", icon: "Laptop", custom: false },
  { id: "office", name: "Office & Admin", type: "expense", color: "#4ADE80", icon: "Building2", custom: false },
  { id: "travel", name: "Business Travel", type: "expense", color: "#2DD4BF", icon: "Plane", custom: false },
  { id: "banking", name: "Banking Fees", type: "expense", color: "#F472B6", icon: "CreditCard", custom: false },
  { id: "taxes", name: "Taxes", type: "expense", color: "#FB923C", icon: "FileSpreadsheet", custom: false },
  { id: "other", name: "Other", type: "both", color: "#94A3B8", icon: "MoreHorizontal", custom: false },
];

export const DEFAULT_CATEGORIES = PERSONAL_DEFAULT_CATEGORIES;

export function getDefaultCategories(accountType = "personal") {
  return accountType === "startup" ? STARTUP_DEFAULT_CATEGORIES : PERSONAL_DEFAULT_CATEGORIES;
}

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
