import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import TransactionListPage from "../components/transactions/TransactionListPage";

export default function Expenses() {
  const { isStartupMode } = useApp();

  if (isStartupMode) {
    return <Navigate to="/split-expenses" replace />;
  }

  return (
    <TransactionListPage
      title="Expenses"
      subtitle="See where your money is going and stay in control of your spending."
      fixedType="expense"
      addLabel="Add Expense"
    />
  );
}
