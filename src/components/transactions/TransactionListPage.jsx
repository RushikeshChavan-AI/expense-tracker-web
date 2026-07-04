import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useFilteredTransactions } from "../../hooks/useFilteredTransactions";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import TransactionForm from "./TransactionForm";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";
import Button from "../ui/Button";

export default function TransactionListPage({ title, subtitle, fixedType, addLabel }) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const { filters, setFilters, paginated, filtered, page, setPage, totalPages } = useFilteredTransactions(
    transactions,
    { fixedType }
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleSubmit = async (data) => {
    if (editing) {
      await updateTransaction(editing.id, data);
    } else {
      await addTransaction(data);
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {addLabel}
        </Button>
      </div>

      <TransactionFilters filters={filters} setFilters={setFilters} typeOptions={!fixedType} />

      <p className="text-xs text-muted">
        Showing {paginated.length} of {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
      </p>

      <TransactionTable
        data={paginated}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        onEdit={(t) => {
          setEditing(t);
          setFormOpen(true);
        }}
        onDelete={(t) => setPendingDelete(t)}
      />

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Transaction" : addLabel}
      >
        <TransactionForm
          initial={editing}
          lockedType={fixedType}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete transaction?"
        description={`This will permanently remove "${pendingDelete?.description || "this transaction"}". This action cannot be undone.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          try {
            await deleteTransaction(pendingDelete.id);
            setPendingDelete(null);
          } catch {
            // AppContext already shows the error toast.
          }
        }}
      />
    </div>
  );
}
