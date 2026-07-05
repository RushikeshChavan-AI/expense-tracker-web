import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Tags,
  Sparkles,
  Users,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/expenses", label: "Expenses", icon: TrendingDown },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/split-expenses", label: "Split Expenses", icon: Users },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { isStartupMode } = useApp();
  const items = NAV_ITEMS.filter((item) => {
    if (isStartupMode) return item.to !== "/expenses";
    return item.to !== "/split-expenses";
  }).map((item) => (
    isStartupMode && item.to === "/split-expenses" ? { ...item, label: "Startup Expenses" } : item
  ));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`glass-strong fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/70 p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-bg shadow-glow">
              <Wallet size={18} />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none text-ink">Expense</p>
              <p className="font-display text-sm font-bold leading-none text-gold">Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:text-ink lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-gold-soft text-gold" : "text-muted hover:bg-white/5 hover:text-ink"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-xl bg-white/5 p-3.5 text-xs text-muted">
          <p className="mb-1 font-medium text-ink">💡 Tip</p>
          Try the AI Assistant — just type "Spent ₹200 on food today" and let it do the rest.
        </div>
      </aside>
    </>
  );
}
