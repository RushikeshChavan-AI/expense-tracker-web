import { Search } from "lucide-react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { useApp } from "../../context/AppContext";

export default function TransactionFilters({ filters, setFilters, typeOptions = true }) {
  const { categories } = useApp();

  return (
    <div className="glass grid grid-cols-1 gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        icon={Search}
        placeholder="Search description..."
        value={filters.search}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
      />
      {typeOptions && (
        <Select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          options={[
            { value: "all", label: "All types" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ]}
        />
      )}
      <Select
        value={filters.category}
        onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        options={[
          { value: "all", label: "All categories" },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <Input
        type="month"
        value={filters.month}
        onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
      />
      <Select
        value={filters.sort}
        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
        options={[
          { value: "date-desc", label: "Newest first" },
          { value: "date-asc", label: "Oldest first" },
          { value: "amount-desc", label: "Amount: high to low" },
          { value: "amount-asc", label: "Amount: low to high" },
        ]}
      />
    </div>
  );
}
