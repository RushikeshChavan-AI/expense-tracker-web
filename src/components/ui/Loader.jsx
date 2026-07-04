import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading...", size = 20, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-8 text-muted ${className}`}>
      <Loader2 size={size} className="animate-spin text-gold" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
