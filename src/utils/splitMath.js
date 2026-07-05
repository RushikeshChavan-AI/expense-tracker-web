export function getSplitShareAmounts(expense) {
  const amount = Number(expense.amount) || 0;
  const participantIds = expense.participantIds || [];
  if (!participantIds.length) return {};

  if (expense.splitMethod === "percentage") {
    return Object.fromEntries(
      participantIds.map((participantId) => [
        participantId,
        amount * (Number(expense.shares?.[participantId] || 0) / 100),
      ])
    );
  }

  if (expense.splitMethod === "custom") {
    return Object.fromEntries(
      participantIds.map((participantId) => [participantId, Number(expense.shares?.[participantId] || 0)])
    );
  }

  const equalShare = amount / participantIds.length;
  return Object.fromEntries(participantIds.map((participantId) => [participantId, equalShare]));
}

export function applySettlementToBalances(balances, settlement) {
  if (settlement.status === "pending") return balances;

  const amount = Number(settlement.amount) || 0;
  if (!amount) return balances;

  return {
    ...balances,
    [settlement.fromPersonId]: (balances[settlement.fromPersonId] || 0) + amount,
    [settlement.toPersonId]: (balances[settlement.toPersonId] || 0) - amount,
  };
}

export function getSettlementSuggestions(people, balances) {
  const creditors = people
    .map((person) => ({ ...person, amount: Number(balances[person.id] || 0) }))
    .filter((person) => person.amount > 0.01)
    .sort((a, b) => b.amount - a.amount);
  const debtors = people
    .map((person) => ({ ...person, amount: Math.abs(Number(balances[person.id] || 0)) }))
    .filter((person) => Number(balances[person.id] || 0) < -0.01)
    .sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtors[debtorIndex] && creditors[creditorIndex]) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        fromPersonId: debtor.id,
        from: debtor.name,
        toPersonId: creditor.id,
        to: creditor.name,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= 0.01) debtorIndex += 1;
    if (creditor.amount <= 0.01) creditorIndex += 1;
  }

  return settlements;
}
