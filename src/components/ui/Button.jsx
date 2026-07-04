import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-gold text-bg hover:brightness-110 shadow-[0_4px_20px_rgba(245,196,81,0.25)]",
  secondary:
    "glass text-ink hover:bg-white/10",
  danger:
    "bg-coral/15 text-coral border border-coral/30 hover:bg-coral/25",
  ghost: "text-muted hover:text-ink hover:bg-white/5",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
