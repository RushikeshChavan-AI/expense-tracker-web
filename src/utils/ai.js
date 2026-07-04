function classifyExpense(text) {
  text = text.toLowerCase();

  // FOOD
  if (
    text.includes("food") ||
    text.includes("biriyani") ||
    text.includes("hotel") ||
    text.includes("restaurant")
  ) {
    return "Food 🍔";
  }

  // TRAVEL
  if (
    text.includes("bus") ||
    text.includes("train") ||
    text.includes("uber") ||
    text.includes("travel")
  ) {
    return "Travel 🚗";
  }

  // SHOPPING
  if (
    text.includes("amazon") ||
    text.includes("shop") ||
    text.includes("mall") ||
    text.includes("dress")
  ) {
    return "Shopping 🛍️";
  }

  // DEFAULT
  return "Other 📦";
}
