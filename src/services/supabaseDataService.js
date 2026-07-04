import { DEFAULT_CATEGORIES } from "../utils/constants";
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

async function seedDefaultCategories(userId) {
  const payload = DEFAULT_CATEGORIES.map((category) => categoryPayload(userId, category));
  const { data, error } = await supabase.from("categories").insert(payload).select("*");
  if (error) throw error;
  return data.map(mapCategory);
}

export async function fetchUserData(userId) {
  const [{ data: categoryRows, error: categoriesError }, { data: transactionRows, error: transactionsError }] =
    await Promise.all([
      supabase.from("categories").select("*").order("custom", { ascending: true }).order("name"),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
    ]);

  if (categoriesError) throw categoriesError;
  if (transactionsError) throw transactionsError;

  const categories = categoryRows.length ? categoryRows.map(mapCategory) : await seedDefaultCategories(userId);

  return {
    categories,
    transactions: transactionRows.map(mapTransaction),
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

export async function resetUserData(userId) {
  const [{ error: transactionsError }, { error: categoriesError }] = await Promise.all([
    supabase.from("transactions").delete().eq("user_id", userId),
    supabase.from("categories").delete().eq("user_id", userId),
  ]);

  if (transactionsError) throw transactionsError;
  if (categoriesError) throw categoriesError;

  return seedDefaultCategories(userId);
}
