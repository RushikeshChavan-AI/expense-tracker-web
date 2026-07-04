import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

export function useFilteredTransactions(transactions, { fixedType } = {}) {
  const [filters, setFilters] = useState({
    search: "",
    type: fixedType || "all",
    category: "all",
    month: "",
    sort: "date-desc",
  });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = transactions.filter((t) => {
      if (fixedType && t.type !== fixedType) return false;
      if (!fixedType && filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.month) {
        const monthStr = t.date.slice(0, 7);
        if (monthStr !== filters.month) return false;
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!t.description?.toLowerCase().includes(term)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "amount-desc":
          return Number(b.amount) - Number(a.amount);
        case "amount-asc":
          return Number(a.amount) - Number(b.amount);
        case "date-desc":
        default:
          return new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt;
      }
    });

    return list;
  }, [transactions, filters, fixedType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    filters,
    setFilters: (updater) => {
      setPage(1);
      setFilters(updater);
    },
    filtered,
    paginated,
    page: currentPage,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
  };
}
