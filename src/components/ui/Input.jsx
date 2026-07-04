export default function Input({ label, error, hint, icon: Icon, className = "", id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border border-border bg-white/5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition focus:border-gold/40 focus:bg-white/[0.07] focus:outline-none ${Icon ? "pl-9 pr-3" : "px-3"} ${error ? "border-coral/50" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-coral">{error}</span>}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
