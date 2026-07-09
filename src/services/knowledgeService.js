import { supabase } from "../lib/supabase";

export const isMissingKnowledgeSchema = (error) =>
  error?.code === "PGRST205" ||
  error?.code === "42P01" ||
  error?.message?.includes("schema cache") ||
  error?.message?.includes("knowledge_spaces") ||
  error?.message?.includes("knowledge_documents");

const DEFAULT_SPACES = [
  {
    key: "policies",
    name: "Policies",
    description: "Expense, travel, reimbursement, and internal operating rules.",
    color: "gold",
  },
  {
    key: "strategy",
    name: "Strategy",
    description: "Business plans, roadmap notes, pricing ideas, and market direction.",
    color: "violet",
  },
  {
    key: "competitors",
    name: "Competitors",
    description: "Competitor profiles, pricing research, feature comparisons, and notes.",
    color: "emerald",
  },
];

const DEFAULT_DOCUMENTS = [
  {
    spaceKey: "policies",
    title: "Expense Policy",
    content: `# Expense Policy

Use this page to define what can be expensed, spending limits, receipt requirements, and reimbursement timing.

## What can be expensed

- Client meals with a business purpose
- Approved travel costs
- Software subscriptions used for work
- Office supplies and operational tools

## Spending limits

| Expense type | Limit | Notes |
| --- | ---: | --- |
| Client dinner | $100 | Receipt required |
| Software | $50/month | Manager approval above limit |
| Travel | Varies | Add purpose and dates |

## Required details

Every reimbursement request should include **date**, **amount**, **category**, and a short business reason.`,
    status: "published",
    tags: ["policy", "finance"],
    pinned: true,
  },
  {
    spaceKey: "competitors",
    title: "Competitor Research Notes",
    content: `# Competitor Research Notes

Track competitor pricing, product positioning, customer segments, and feature gaps in this document.

## Comparison

| Competitor | Pricing | Strength | Gap |
| --- | --- | --- | --- |
| Example Co | $29/month | Simple onboarding | Limited reporting |

## Notes

- Add screenshots or source links.
- Keep pricing research dated.
- Highlight anything that affects our roadmap.`,
    status: "draft",
    tags: ["competitor", "pricing"],
    pinned: false,
  },
];

const mapSpace = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || "",
  color: row.color || "gold",
  sortOrder: row.sort_order || 0,
  archivedAt: row.archived_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapDocument = (row) => ({
  id: row.id,
  spaceId: row.space_id,
  title: row.title || "Untitled document",
  content: row.content || "",
  status: row.status || "draft",
  tags: row.tags || [],
  attachmentNames: row.attachment_names || [],
  pinned: row.pinned || false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const spacePayload = (userId, data) => ({
  user_id: userId,
  name: data.name.trim(),
  description: data.description?.trim() || "",
  color: data.color || "gold",
  sort_order: data.sortOrder || 0,
});

const documentPayload = (userId, data) => ({
  user_id: userId,
  space_id: data.spaceId || null,
  title: data.title?.trim() || "Untitled document",
  content: data.content || "",
  status: data.status || "draft",
  tags: data.tags || [],
  attachment_names: data.attachmentNames || [],
  pinned: Boolean(data.pinned),
});

export async function fetchKnowledgeHubData(userId) {
  const [{ data: spaceRows, error: spacesError }, { data: documentRows, error: documentsError }] = await Promise.all([
    supabase
      .from("knowledge_spaces")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("knowledge_documents")
      .select("*")
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false }),
  ]);

  if (spacesError) throw spacesError;
  if (documentsError) throw documentsError;

  if (!spaceRows.length) {
    return seedKnowledgeHubDefaults(userId);
  }

  return {
    spaces: spaceRows.map(mapSpace),
    documents: documentRows.map(mapDocument),
  };
}

async function seedKnowledgeHubDefaults(userId) {
  const spacePayloads = DEFAULT_SPACES.map((space, index) => ({
    ...spacePayload(userId, { ...space, sortOrder: index }),
  }));

  const { data: insertedSpaces, error: spacesError } = await supabase
    .from("knowledge_spaces")
    .insert(spacePayloads)
    .select("*");
  if (spacesError) throw spacesError;

  const spacesByName = Object.fromEntries(insertedSpaces.map((space) => [space.name, space]));
  const spaceIdByKey = Object.fromEntries(DEFAULT_SPACES.map((space) => [space.key, spacesByName[space.name]?.id]));

  const documentPayloads = DEFAULT_DOCUMENTS.map((document) =>
    documentPayload(userId, {
      ...document,
      spaceId: spaceIdByKey[document.spaceKey],
      attachmentNames: [],
    }),
  );

  const { data: insertedDocuments, error: documentsError } = await supabase
    .from("knowledge_documents")
    .insert(documentPayloads)
    .select("*");
  if (documentsError) throw documentsError;

  return {
    spaces: insertedSpaces.map(mapSpace),
    documents: insertedDocuments.map(mapDocument),
  };
}

export async function createKnowledgeSpace(userId, data) {
  const { data: row, error } = await supabase
    .from("knowledge_spaces")
    .insert(spacePayload(userId, data))
    .select("*")
    .single();
  if (error) throw error;
  return mapSpace(row);
}

export async function saveKnowledgeSpace(id, data) {
  const { data: row, error } = await supabase
    .from("knowledge_spaces")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || "",
      color: data.color || "gold",
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapSpace(row);
}

export async function archiveKnowledgeSpace(id) {
  const archivedAt = new Date().toISOString();

  const { data: spaceRow, error: spaceError } = await supabase
    .from("knowledge_spaces")
    .update({ archived_at: archivedAt })
    .eq("id", id)
    .select("*")
    .single();
  if (spaceError) throw spaceError;

  const { data: documentRows, error: documentsError } = await supabase
    .from("knowledge_documents")
    .update({ status: "archived" })
    .eq("space_id", id)
    .select("*");
  if (documentsError) throw documentsError;

  return {
    space: mapSpace(spaceRow),
    documents: documentRows.map(mapDocument),
  };
}

export async function createKnowledgeDocument(userId, data) {
  const { data: row, error } = await supabase
    .from("knowledge_documents")
    .insert(documentPayload(userId, data))
    .select("*")
    .single();
  if (error) throw error;
  return mapDocument(row);
}

export async function saveKnowledgeDocument(id, data) {
  const { data: row, error } = await supabase
    .from("knowledge_documents")
    .update({
      space_id: data.spaceId || null,
      title: data.title?.trim() || "Untitled document",
      content: data.content || "",
      status: data.status || "draft",
      tags: data.tags || [],
      attachment_names: data.attachmentNames || [],
      pinned: Boolean(data.pinned),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapDocument(row);
}

export async function removeKnowledgeDocument(id) {
  const { error } = await supabase.from("knowledge_documents").delete().eq("id", id);
  if (error) throw error;
}
