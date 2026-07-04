import { ChevronDown } from "lucide-react";

export default function Select({ label, error, options = [], className = "", id, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-xl border border-border bg-white/5 py-2.5 pl-3 pr-9 text-sm text-ink transition focus:border-gold/40 focus:bg-white/[0.07] focus:outline-none ${error ? "border-coral/50" : ""} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-soft text-ink">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </div>
      {error && <span className="text-xs text-coral">{error}</span>}
    </div>
  );
}
