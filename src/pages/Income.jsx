import TransactionListPage from "../components/transactions/TransactionListPage";

export default function Income() {
  return (
    <TransactionListPage
      title="Income"
      subtitle="Track every rupee coming in — salary, freelance work, and more."
      fixedType="income"
      addLabel="Add Income"
    />
  );
}
