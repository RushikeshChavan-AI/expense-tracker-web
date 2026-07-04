import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { useApp } from "../context/AppContext";
import CategoryCard from "../components/categories/CategoryCard";
import CategoryForm from "../components/categories/CategoryForm";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

export default function Categories() {
  const { categories, stats, addCategory, updateCategory, deleteCategory } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const totalFor = (id) => stats.byCategory[id] || 0;

  const handleSubmit = async (data) => {
    if (editing) {
      await updateCategory(editing.id, data);
    } else {
      await addCategory(data);
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Categories</h2>
          <p className="mt-1 text-sm text-muted">Organize transactions and add your own custom categories.</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories yet" description="Create your first category to start organizing transactions." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              total={totalFor(c.id)}
              onEdit={(cat) => {
                setEditing(cat);
                setFormOpen(true);
              }}
              onDelete={(cat) => setPendingDelete(cat)}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete category?"
        description={`"${pendingDelete?.name}" will be removed. Existing transactions in this category will keep their reference but won't show a live category name.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          try {
            await deleteCategory(pendingDelete.id);
            setPendingDelete(null);
          } catch {
            // AppContext already shows the error toast.
          }
        }}
      />
    </div>
  );
}
