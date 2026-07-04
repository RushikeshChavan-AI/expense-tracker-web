import { CURRENCY } from "./constants";

export function formatCurrency(amount, { signed = false } = {}) {
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = signed && value !== 0 ? (value > 0 ? "+" : "-") : value < 0 ? "-" : "";
  return `${sign}${CURRENCY}${formatted}`;
}

export function formatDate(dateStr, opts = {}) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function formatMonthLabel(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isSameMonth(dateStr, ref = new Date()) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
