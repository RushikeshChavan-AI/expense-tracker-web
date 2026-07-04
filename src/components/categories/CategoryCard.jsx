import { Pencil, Trash2, Lock } from "lucide-react";
import { getCategoryIcon } from "../../utils/categoryIcon";
import { formatCurrency } from "../../utils/format";

export default function CategoryCard({ category, total = 0, onEdit, onDelete }) {
  const Icon = getCategoryIcon(category.icon);

  return (
    <div className="glass group relative flex flex-col gap-3 rounded-2xl p-5 transition hover:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${category.color}22`, color: category.color }}
        >
          <Icon size={18} />
        </div>
        {category.custom ? (
          <div className="hidden gap-1 group-hover:flex">
            <button
              onClick={() => onEdit(category)}
              aria-label="Edit category"
              className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-gold"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(category)}
              aria-label="Delete category"
              className="rounded-lg p-1.5 text-muted transition hover:bg-coral-soft hover:text-coral"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <Lock size={13} className="text-muted/50" />
        )}
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-ink">{category.name}</p>
        <p className="text-xs capitalize text-muted">{category.type}</p>
      </div>
      <p className="font-mono-num text-lg font-bold text-ink">{formatCurrency(total)}</p>
    </div>
  );
}
