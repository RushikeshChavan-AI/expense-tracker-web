export default function StatCard({ label, value, icon: Icon, tone = "neutral", trend }) {
  const tones = {
    neutral: "text-ink bg-white/5",
    emerald: "text-emerald bg-emerald-soft",
    coral: "text-coral bg-coral-soft",
    gold: "text-gold bg-gold-soft",
  };

  return (
    <div className="glass animate-fade-in rounded-2xl p-5 transition hover:bg-white/[0.06]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="font-mono-num font-display text-2xl font-bold text-ink">{value}</p>
      {trend && <p className="mt-1.5 text-xs text-muted">{trend}</p>}
    </div>
  );
}
