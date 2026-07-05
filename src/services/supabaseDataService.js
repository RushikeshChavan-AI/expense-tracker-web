import { getDefaultCategories } from "../utils/constants";
import { uid } from "../utils/format";
import { supabase } from "../lib/supabase";

const mapTransaction = (row) => ({
  id: row.id,
  type: row.type,
  amount: Number(row.amount),
  category: row.category,
  description: row.description || "",
  date: row.date,
  createdAt: new Date(row.created_at).getTime(),
});

const mapCategory = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  color: row.color,
  icon: row.icon,
  custom: row.custom,
});

const mapProfile = (row) => ({
  userId: row.user_id,
  email: row.email,
  accountType: row.account_type,
  displayName: row.display_name || "",
});

const accountTypeForEmail = (email) => (email || "").toLowerCase() === "tracking@viewlyt.com" ? "startup" : "personal";

const mapSplitPerson = (row) => ({
  id: row.id,
  name: row.name,
  createdAt: new Date(row.created_at).getTime(),
});

const mapSplitExpense = (row) => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount),
  category: row.category || "",
  paidBy: row.paid_by,
  participantIds: row.participant_ids || [],
  splitMethod: row.split_method || "equal",
  shares: row.shares || {},
  date: row.date,
  createdAt: new Date(row.created_at).getTime(),
});

const mapSplitSettlement = (row) => ({
  id: row.id,
  fromPersonId: row.from_person_id,
  toPersonId: row.to_person_id,
  amount: Number(row.amount),
  method: row.method,
  status: row.status,
  date: row.date,
  note: row.note || "",
  createdAt: new Date(row.created_at).getTime(),
});

const transactionPayload = (userId, data) => ({
  user_id: userId,
  type: data.type,
  amount: Number(data.amount),
  category: data.category,
  description: data.description || "",
  date: data.date,
});

const categoryPayload = (userId, data) => ({
  user_id: userId,
  id: data.id || uid(),
  name: data.name,
  type: data.type,
  color: data.color,
  icon: data.icon,
  custom: Boolean(data.custom),
});

const splitPersonPayload = (userId, data) => ({
  user_id: userId,
  id: data.id || uid(),
  name: data.name.trim(),
});

const splitExpensePayload = (userId, data) => ({
  user_id: userId,
  description: data.description.trim(),
  amount: Number(data.amount),
  category: data.category || "",
  paid_by: data.paidBy,
  participant_ids: data.participantIds,
  split_method: data.splitMethod || "equal",
  shares: data.shares || {},
  date: data.date,
});

const splitSettlementPayload = (userId, data) => ({
  user_id: userId,
  from_person_id: data.fromPersonId,
  to_person_id: data.toPersonId,
  amount: Number(data.amount),
  method: data.method,
  status: data.status,
  date: data.date,
  note: data.note || "",
});

const isMissingTableError = (error) => error?.code === "PGRST205" || error?.message?.includes("schema cache");

async function insertDefaultCategories(userId, categories) {
  const payload = categories.map((category) => categoryPayload(userId, category));
  const { data, error } = await supabase.from("categories").insert(payload).select("*");
  if (error) throw error;
  return data.map(mapCategory);
}

async function seedDefaultCategories(userId, accountType = "personal") {
  return insertDefaultCategories(userId, getDefaultCategories(accountType));
}

async function ensureDefaultCategories(userId, accountType, categoryRows) {
  const existingCategories = categoryRows.map(mapCategory);
  const existingIds = new Set(existingCategories.map((category) => category.id));
  const missingDefaults = getDefaultCategories(accountType).filter((category) => !existingIds.has(category.id));

  if (!categoryRows.length) return seedDefaultCategories(userId, accountType);
  if (!missingDefaults.length) return existingCategories;

  const inserted = await insertDefaultCategories(userId, missingDefaults);
  return [...existingCategories, ...inserted].sort((a, b) => {
    if (a.custom !== b.custom) return Number(a.custom) - Number(b.custom);
    return a.name.localeCompare(b.name);
  });
}

async function getOrCreateProfile(user) {
  const fallback = {
    userId: user.id,
    email: user.email || "",
    accountType: accountTypeForEmail(user.email),
    displayName: "",
  };

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    if (isMissingTableError(existingError)) return fallback;
    throw existingError;
  }
  if (existing) {
    const profile = mapProfile(existing);
    const expectedAccountType = accountTypeForEmail(user.email);

    if (expectedAccountType === "startup" && profile.accountType !== "startup") {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          email: user.email || profile.email,
          account_type: "startup",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (!error && data) return mapProfile(data);
      return { ...profile, accountType: "startup" };
    }

    return profile;
  }

  const email = user.email || "";
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      email,
      account_type: fallback.accountType,
    })
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error)) return fallback;
    throw error;
  }
  return mapProfile(data);
}

export async function fetchUserData(user) {
  const userId = user.id;
  const [
    profileResult,
    { data: categoryRows, error: categoriesError },
    { data: transactionRows, error: transactionsError },
    splitPeopleResult,
    splitExpensesResult,
    splitSettlementsResult,
  ] = await Promise.all([
      getOrCreateProfile(user),
      supabase.from("categories").select("*").order("custom", { ascending: true }).order("name"),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("split_people").select("*").order("created_at", { ascending: true }),
      supabase.from("split_expenses").select("*").order("created_at", { ascending: false }),
      supabase.from("split_settlements").select("*").order("created_at", { ascending: false }),
    ]);

  if (categoriesError) throw categoriesError;
  if (transactionsError) throw transactionsError;
  const splitSetupRequired =
    isMissingTableError(splitPeopleResult.error) ||
    isMissingTableError(splitExpensesResult.error) ||
    isMissingTableError(splitSettlementsResult.error);
  if (splitPeopleResult.error && !isMissingTableError(splitPeopleResult.error)) throw splitPeopleResult.error;
  if (splitExpensesResult.error && !isMissingTableError(splitExpensesResult.error)) throw splitExpensesResult.error;
  if (splitSettlementsResult.error && !isMissingTableError(splitSettlementsResult.error)) throw splitSettlementsResult.error;

  const categories = await ensureDefaultCategories(userId, profileResult.accountType, categoryRows);

  return {
    profile: profileResult,
    categories,
    transactions: transactionRows.map(mapTransaction),
    splitPeople: splitPeopleResult.data?.map(mapSplitPerson) || [],
    splitExpenses: splitExpensesResult.data?.map(mapSplitExpense) || [],
    splitSettlements: splitSettlementsResult.data?.map(mapSplitSettlement) || [],
    splitSetupRequired,
  };
}

export async function createTransaction(userId, data) {
  const { data: row, error } = await supabase
    .from("transactions")
    .insert(transactionPayload(userId, data))
    .select("*")
    .single();
  if (error) throw error;
  return mapTransaction(row);
}

export async function saveTransaction(id, data) {
  const { data: row, error } = await supabase
    .from("transactions")
    .update({
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      description: data.description || "",
      date: data.date,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapTransaction(row);
}

export async function removeTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function importTransactionRows(userId, records) {
  const payload = records.map((record) => transactionPayload(userId, record));
  const { data, error } = await supabase.from("transactions").insert(payload).select("*");
  if (error) throw error;
  return data.map(mapTransaction);
}

export async function createCategory(userId, data) {
  const { data: row, error } = await supabase
    .from("categories")
    .insert(categoryPayload(userId, { ...data, custom: true }))
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(row);
}

export async function saveCategory(id, data) {
  const { data: row, error } = await supabase
    .from("categories")
    .update({
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(row);
}

export async function removeCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function createSplitPerson(userId, data) {
  const { data: row, error } = await supabase.from("split_people").insert(splitPersonPayload(userId, data)).select("*").single();
  if (error) throw error;
  return mapSplitPerson(row);
}

export async function removeSplitPerson(id) {
  const { error } = await supabase.from("split_people").delete().eq("id", id);
  if (error) throw error;
}

export async function createSplitExpense(userId, data) {
  const { data: row, error } = await supabase
    .from("split_expenses")
    .insert(splitExpensePayload(userId, data))
    .select("*")
    .single();
  if (error) throw error;
  return mapSplitExpense(row);
}

export async function saveSplitExpense(id, data) {
  const { data: row, error } = await supabase
    .from("split_expenses")
    .update({
      description: data.description.trim(),
      amount: Number(data.amount),
      category: data.category || "",
      paid_by: data.paidBy,
      participant_ids: data.participantIds,
      split_method: data.splitMethod || "equal",
      shares: data.shares || {},
      date: data.date,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapSplitExpense(row);
}

export async function removeSplitExpense(id) {
  const { error } = await supabase.from("split_expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function createSplitSettlement(userId, data) {
  const { data: row, error } = await supabase
    .from("split_settlements")
    .insert(splitSettlementPayload(userId, data))
    .select("*")
    .single();
  if (error) throw error;
  return mapSplitSettlement(row);
}

export async function removeSplitSettlement(id) {
  const { error } = await supabase.from("split_settlements").delete().eq("id", id);
  if (error) throw error;
}

export async function resetUserData(userId, accountType = "personal") {
  const [
    { error: splitExpensesError },
    { error: splitSettlementsError },
    { error: splitPeopleError },
    { error: transactionsError },
    { error: categoriesError },
  ] = await Promise.all([
    supabase.from("split_expenses").delete().eq("user_id", userId),
    supabase.from("split_settlements").delete().eq("user_id", userId),
    supabase.from("split_people").delete().eq("user_id", userId),
    supabase.from("transactions").delete().eq("user_id", userId),
    supabase.from("categories").delete().eq("user_id", userId),
  ]);

  if (splitExpensesError && !isMissingTableError(splitExpensesError)) throw splitExpensesError;
  if (splitSettlementsError && !isMissingTableError(splitSettlementsError)) throw splitSettlementsError;
  if (splitPeopleError && !isMissingTableError(splitPeopleError)) throw splitPeopleError;
  if (transactionsError) throw transactionsError;
  if (categoriesError) throw categoriesError;

  return seedDefaultCategories(userId, accountType);
}
