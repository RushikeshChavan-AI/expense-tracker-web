export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-muted">
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="font-display text-sm font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-xs text-xs text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
