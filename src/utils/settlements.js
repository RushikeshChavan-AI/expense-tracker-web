export const SETTLEMENT_METHOD_OPTIONS = [
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export const SETTLEMENT_STATUS_OPTIONS = [
  { value: "settled", label: "Settled" },
  { value: "partial", label: "Partial payment" },
  { value: "pending", label: "Pending" },
];

export function formatSettlementMethod(method) {
  return SETTLEMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label || "Other";
}

export function formatSettlementStatus(status) {
  return SETTLEMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label || "Settled";
}
