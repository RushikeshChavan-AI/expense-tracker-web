const HEADERS = ["type", "amount", "category", "description", "date"];

export function exportTransactionsToCSV(transactions, categories) {
  const rows = transactions.map((t) => {
    const categoryName = categories.find((c) => c.id === t.category)?.name || t.category;
    return [t.type, t.amount, categoryName, csvEscape(t.description || ""), t.date];
  });

  const csv = [HEADERS.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parses CSV text into transaction-shaped objects.
 * Expects headers: type, amount, category, description, date
 * Category values may be either category ids or display names.
 */
export function parseTransactionsCSV(text, categories) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("The CSV file appears to be empty or missing data rows.");
  }

  const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const requiredCols = ["type", "amount", "category", "date"];
  const missing = requiredCols.filter((c) => !header.includes(c));
  if (missing.length) {
    throw new Error(`CSV is missing required column(s): ${missing.join(", ")}`);
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const records = [];
  const errors = [];

  lines.slice(1).forEach((line, i) => {
    const cols = parseCSVLine(line);
    const type = (cols[idx.type] || "").trim().toLowerCase();
    const amount = Number(cols[idx.amount]);
    const rawCategory = (cols[idx.category] || "").trim();
    const description = idx.description !== undefined ? (cols[idx.description] || "").trim() : "";
    const date = (cols[idx.date] || "").trim();

    if (type !== "income" && type !== "expense") {
      errors.push(`Row ${i + 2}: invalid type "${type}"`);
      return;
    }
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 2}: invalid amount`);
      return;
    }
    if (!date || Number.isNaN(new Date(date).getTime())) {
      errors.push(`Row ${i + 2}: invalid date`);
      return;
    }

    const matchedCategory =
      categories.find((c) => c.id === rawCategory)?.id ||
      categories.find((c) => c.name.toLowerCase() === rawCategory.toLowerCase())?.id ||
      "other";

    records.push({ type, amount, category: matchedCategory, description, date });
  });

  return { records, errors };
}
