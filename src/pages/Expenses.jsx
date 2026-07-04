import TransactionListPage from "../components/transactions/TransactionListPage";

export default function Expenses() {
  return (
    <TransactionListPage
      title="Expenses"
      subtitle="See where your money is going and stay in control of your spending."
      fixedType="expense"
      addLabel="Add Expense"
    />
  );
}
