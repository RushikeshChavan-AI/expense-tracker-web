import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Archive,
  BookOpenText,
  Database,
  Edit3,
  FileText,
  Folder,
  FolderPlus,
  Pin,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  archiveKnowledgeSpace,
  createKnowledgeDocument,
  createKnowledgeSpace,
  fetchKnowledgeHubData,
  isMissingKnowledgeSchema,
  removeKnowledgeDocument,
  saveKnowledgeDocument,
  saveKnowledgeSpace,
} from "../services/knowledgeService";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";

const SPACE_COLORS = [
  { value: "gold", label: "Gold", badge: "bg-gold-soft text-gold" },
  { value: "emerald", label: "Emerald", badge: "bg-emerald-soft text-emerald" },
  { value: "violet", label: "Violet", badge: "bg-violet-soft text-violet" },
  { value: "coral", label: "Coral", badge: "bg-coral-soft text-coral" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const emptyDocumentForm = {
  title: "Untitled document",
  spaceId: "",
  status: "draft",
  tags: "",
  attachmentNames: "",
  content: "",
  pinned: false,
};

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const colorFor = (space) => SPACE_COLORS.find((color) => color.value === space?.color) || SPACE_COLORS[0];

const parseList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const documentToForm = (document) => ({
  title: document.title || "Untitled document",
  spaceId: document.spaceId || "",
  status: document.status || "draft",
  tags: (document.tags || []).join(", "),
  attachmentNames: (document.attachmentNames || []).join(", "),
  content: document.content || "",
  pinned: !!document.pinned,
});

const formToDocumentPayload = (form) => ({
  title: form.title,
  spaceId: form.spaceId,
  status: form.status,
  tags: parseList(form.tags),
  attachmentNames: parseList(form.attachmentNames),
  content: form.content,
  pinned: form.pinned,
});

const normalizeMarkdown = (content) =>
  content.replace(/^(#{1,6})([^\s#].*)$/gm, "$1 $2");

export default function KnowledgeHub() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ spaces: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState(null);
  const [activeView, setActiveView] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [spaceModal, setSpaceModal] = useState({ open: false, space: null });
  const [spaceForm, setSpaceForm] = useState({ name: "", description: "", color: "gold" });
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [spacesCollapsed, setSpacesCollapsed] = useLocalStorage("knowledge-spaces-collapsed", false);
  const [pagesCollapsed, setPagesCollapsed] = useLocalStorage("knowledge-pages-collapsed", false);

  useEffect(() => {
    let active = true;

    async function loadKnowledgeHub() {
      if (!user) return;
      setLoading(true);
      setSetupError(null);

      try {
        const result = await fetchKnowledgeHubData(user.id);
        if (!active) return;
        setData(result);
        setSelectedDocId(result.documents[0]?.id || null);
      } catch (err) {
        if (!active) return;
        if (isMissingKnowledgeSchema(err)) {
          setSetupError(err);
        } else {
          toast.error(err.message || "Failed to load Knowledge Hub");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadKnowledgeHub();

    return () => {
      active = false;
    };
  }, [toast, user]);

  const spaces = data.spaces;
  const documents = data.documents;
  const activeSpaces = spaces.filter((space) => !space.archivedAt);
  const activeSpace = activeSpaces.find((space) => space.id === activeView);
  const activeSpaceOptions = activeSpaces.map((space) => ({ value: space.id, label: space.name }));

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents
      .filter((doc) => {
        const docSpace = spaces.find((space) => space.id === doc.spaceId);
        if (docSpace?.archivedAt && activeView !== "archived") return false;
        if (activeView === "pinned") return doc.pinned && doc.status !== "archived";
        if (activeView === "archived") return doc.status === "archived" || !!docSpace?.archivedAt;
        if (activeView !== "all") return doc.spaceId === activeView && doc.status !== "archived";
        return doc.status !== "archived";
      })
      .filter((doc) => {
        if (!normalizedQuery) return true;
        const searchable = [
          doc.title,
          doc.content,
          doc.status,
          spaces.find((space) => space.id === doc.spaceId)?.name,
          ...(doc.tags || []),
          ...(doc.attachmentNames || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [activeView, documents, query, spaces]);

  useEffect(() => {
    if (!filteredDocuments.some((doc) => doc.id === selectedDocId)) {
      setSelectedDocId(filteredDocuments[0]?.id || null);
      setEditingDocId(null);
    }
  }, [filteredDocuments, selectedDocId]);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocId);
  const selectedSpace = spaces.find((space) => space.id === selectedDocument?.spaceId);
  const archivedDocumentCount = documents.filter((doc) => {
    const docSpace = spaces.find((space) => space.id === doc.spaceId);
    return doc.status === "archived" || !!docSpace?.archivedAt;
  }).length;

  const viewTitle =
    activeView === "all"
      ? "All Documents"
      : activeView === "pinned"
        ? "Pinned Documents"
        : activeView === "archived"
          ? "Archived Documents"
          : activeSpace?.name || "Documents";

  const layoutClass =
    spacesCollapsed && pagesCollapsed
      ? "xl:grid-cols-[56px_56px_minmax(0,1fr)]"
      : spacesCollapsed
        ? "xl:grid-cols-[56px_280px_minmax(0,1fr)]"
        : pagesCollapsed
          ? "xl:grid-cols-[260px_56px_minmax(0,1fr)]"
          : "xl:grid-cols-[260px_280px_minmax(0,1fr)]";

  const openSpaceModal = (space = null) => {
    setSpaceForm(
      space
        ? { name: space.name, description: space.description || "", color: space.color || "gold" }
        : { name: "", description: "", color: "gold" },
    );
    setSpaceModal({ open: true, space });
  };

  const beginEditingDocument = (document) => {
    setDocumentForm(documentToForm(document));
    setEditingDocId(document.id);
  };

  const handleSaveSpace = async (event) => {
    event.preventDefault();
    const name = spaceForm.name.trim();
    if (!name) return;

    try {
      if (spaceModal.space) {
        const savedSpace = await saveKnowledgeSpace(spaceModal.space.id, {
          name,
          description: spaceForm.description,
          color: spaceForm.color,
        });
        setData((current) => ({
          ...current,
          spaces: current.spaces.map((space) => (space.id === savedSpace.id ? savedSpace : space)),
        }));
        toast.success("Space updated");
      } else {
        const newSpace = await createKnowledgeSpace(user.id, {
          name,
          description: spaceForm.description,
          color: spaceForm.color,
          sortOrder: activeSpaces.length,
        });
        setData((current) => ({ ...current, spaces: [...current.spaces, newSpace] }));
        setActiveView(newSpace.id);
        toast.success("Space created");
      }
      setSpaceModal({ open: false, space: null });
    } catch (err) {
      toast.error(err.message || "Failed to save space");
    }
  };

  const handleArchiveSpace = async (space) => {
    if (!window.confirm(`Archive "${space.name}" and its documents?`)) return;

    try {
      const result = await archiveKnowledgeSpace(space.id);
      const updatedDocumentById = new Map(result.documents.map((doc) => [doc.id, doc]));
      setData((current) => ({
        spaces: current.spaces.map((item) => (item.id === result.space.id ? result.space : item)),
        documents: current.documents.map((doc) => updatedDocumentById.get(doc.id) || doc),
      }));
      setActiveView("all");
      setEditingDocId(null);
      toast.info("Space archived");
    } catch (err) {
      toast.error(err.message || "Failed to archive space");
    }
  };

  const handleCreateDocument = async () => {
    const spaceId = activeSpace?.id || activeSpaces[0]?.id;
    if (!spaceId) {
      toast.warning("Create a space before adding documents");
      return;
    }

    try {
      const newDocument = await createKnowledgeDocument(user.id, {
        title: "Untitled document",
        spaceId,
        content: "",
        status: "draft",
        tags: [],
        attachmentNames: [],
        pinned: false,
      });
      setData((current) => ({ ...current, documents: [newDocument, ...current.documents] }));
      setSelectedDocId(newDocument.id);
      setDocumentForm(documentToForm(newDocument));
      setEditingDocId(newDocument.id);
      toast.success("Document created");
    } catch (err) {
      toast.error(err.message || "Failed to create document");
    }
  };

  const handleSaveInlineDocument = async (event) => {
    event.preventDefault();
    const title = documentForm.title.trim();
    if (!title || !documentForm.spaceId || !editingDocId) return;

    try {
      const savedDocument = await saveKnowledgeDocument(editingDocId, formToDocumentPayload({ ...documentForm, title }));
      setData((current) => ({
        ...current,
        documents: current.documents.map((doc) => (doc.id === savedDocument.id ? savedDocument : doc)),
      }));
      setSelectedDocId(savedDocument.id);
      setEditingDocId(null);
      toast.success("Document saved");
    } catch (err) {
      toast.error(err.message || "Failed to save document");
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!window.confirm(`Delete "${document.title}"?`)) return;

    try {
      await removeKnowledgeDocument(document.id);
      setData((current) => ({
        ...current,
        documents: current.documents.filter((doc) => doc.id !== document.id),
      }));
      setEditingDocId(null);
      toast.info("Document deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const saveQuickDocumentChange = async (document, changes, successMessage) => {
    try {
      const savedDocument = await saveKnowledgeDocument(document.id, {
        ...document,
        ...changes,
      });
      setData((current) => ({
        ...current,
        documents: current.documents.map((doc) => (doc.id === savedDocument.id ? savedDocument : doc)),
      }));
      if (successMessage) toast.success(successMessage);
    } catch (err) {
      toast.error(err.message || "Failed to update document");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading Knowledge Hub..." />
      </div>
    );
  }

  if (setupError) {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Database size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Knowledge Hub database is not initialized</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Run <code className="rounded bg-white/10 px-1.5 py-0.5 text-ink">supabase/knowledge_schema.sql</code>{" "}
                in the Supabase SQL editor, then refresh this page.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-sm text-muted">
            This creates <code className="rounded bg-white/10 px-1 text-ink">knowledge_spaces</code> and{" "}
            <code className="rounded bg-white/10 px-1 text-ink">knowledge_documents</code> with row-level security,
            so each signed-in user only sees their own docs.
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <BookOpenText size={23} className="text-gold" /> Knowledge Hub
          </h2>
        </div>
        <div className="flex gap-2">
          <IconButton icon={FolderPlus} label="New space" onClick={() => openSpaceModal()} />
          <IconButton icon={Plus} label="New document" onClick={handleCreateDocument} disabled={!activeSpaces.length} primary />
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${layoutClass}`}>
        <aside className={`glass rounded-2xl ${spacesCollapsed ? "p-2" : "p-4"}`}>
          <div className={`mb-3 flex items-center ${spacesCollapsed ? "justify-center" : "justify-between"}`}>
            {!spacesCollapsed && <h3 className="font-display text-sm font-semibold text-ink">Spaces</h3>}
            <button
              type="button"
              onClick={() => setSpacesCollapsed((current) => !current)}
              className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-ink"
              aria-label={spacesCollapsed ? "Show spaces" : "Hide spaces"}
              title={spacesCollapsed ? "Show spaces" : "Hide spaces"}
            >
              {spacesCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {spacesCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <IconButton icon={Folder} label="Spaces" onClick={() => setSpacesCollapsed(false)} />
              <IconButton icon={FolderPlus} label="New space" onClick={() => openSpaceModal()} />
            </div>
          ) : (
          <div className="flex flex-col gap-1">
            <SpaceNavButton
              active={activeView === "all"}
              icon={FileText}
              label="All Docs"
              count={documents.filter((doc) => doc.status !== "archived").length}
              onClick={() => setActiveView("all")}
            />
            <SpaceNavButton
              active={activeView === "pinned"}
              icon={Pin}
              label="Pinned"
              count={documents.filter((doc) => doc.pinned && doc.status !== "archived").length}
              onClick={() => setActiveView("pinned")}
            />
            {activeSpaces.map((space) => (
              <SpaceNavButton
                key={space.id}
                active={activeView === space.id}
                color={colorFor(space).badge}
                icon={Folder}
                label={space.name}
                count={documents.filter((doc) => doc.spaceId === space.id && doc.status !== "archived").length}
                onClick={() => setActiveView(space.id)}
              />
            ))}
            <SpaceNavButton
              active={activeView === "archived"}
              icon={Archive}
              label="Archived"
              count={archivedDocumentCount}
              onClick={() => setActiveView("archived")}
            />
            <button
              type="button"
              onClick={() => openSpaceModal()}
              className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-ink"
            >
              <Plus size={15} /> Space
            </button>
          </div>
          )}
        </aside>

        <section className={`glass rounded-2xl ${pagesCollapsed ? "p-2" : "p-4"}`}>
          <div className={`mb-4 flex items-center ${pagesCollapsed ? "justify-center" : "justify-between"}`}>
            {pagesCollapsed ? (
              <button
                type="button"
                onClick={() => setPagesCollapsed(false)}
                className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-ink"
                aria-label="Show documents"
                title="Show documents"
              >
                <PanelLeftOpen size={16} />
              </button>
            ) : (
            <>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink">{viewTitle}</h3>
              <p className="mt-1 text-xs text-muted">
                {filteredDocuments.length} document{filteredDocuments.length === 1 ? "" : "s"}
              </p>
            </div>
              <div className="flex gap-1">
                <IconButton icon={PanelLeftClose} label="Hide documents" onClick={() => setPagesCollapsed(true)} />
                <IconButton icon={Plus} label="New document" onClick={handleCreateDocument} disabled={!activeSpaces.length} />
                {activeSpace && (
                <>
                <button
                  type="button"
                  onClick={() => openSpaceModal(activeSpace)}
                  className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-ink"
                  aria-label="Rename space"
                  title="Rename space"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleArchiveSpace(activeSpace)}
                  className="rounded-lg p-1.5 text-coral transition hover:bg-coral/10"
                  aria-label="Archive space"
                  title="Archive space"
                >
                  <Archive size={15} />
                </button>
                </>
                )}
              </div>
            </>
            )}
          </div>

          {pagesCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <IconButton icon={FileText} label="Documents" onClick={() => setPagesCollapsed(false)} />
              <IconButton icon={Plus} label="New document" onClick={handleCreateDocument} disabled={!activeSpaces.length} />
            </div>
          ) : (
          <>
          <div className="mb-4">
            <Input
              icon={Search}
              placeholder="Search pages..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search documents"
            />
          </div>

          {filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents found"
              description={query ? "Try a different search term." : "Create a document to start writing."}
              action={
                <Button icon={Plus} onClick={handleCreateDocument} disabled={!activeSpaces.length}>
                  New Document
                </Button>
              }
            />
          ) : (
            <div className="flex max-h-[68vh] flex-col gap-1 overflow-y-auto pr-1">
              {filteredDocuments.map((document) => {
                const space = spaces.find((item) => item.id === document.spaceId);
                return (
                  <PageListItem
                    key={document.id}
                    document={document}
                    space={space}
                    active={selectedDocId === document.id}
                    onClick={() => {
                      setSelectedDocId(document.id);
                      setEditingDocId(null);
                    }}
                  />
                );
              })}
            </div>
          )}
          </>
          )}
        </section>

        <section className="glass min-h-[78vh] overflow-hidden rounded-2xl">
          {selectedDocument ? (
            editingDocId === selectedDocument.id ? (
              <form className="mx-auto flex max-w-4xl flex-col gap-5 px-5 py-7 lg:px-10" onSubmit={handleSaveInlineDocument}>
                <div className="flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={documentForm.spaceId}
                      onChange={(event) => setDocumentForm((current) => ({ ...current, spaceId: event.target.value }))}
                      options={activeSpaceOptions}
                      className="min-w-44"
                      aria-label="Document space"
                    />
                    <Select
                      value={documentForm.status}
                      onChange={(event) => setDocumentForm((current) => ({ ...current, status: event.target.value }))}
                      options={STATUS_OPTIONS}
                      className="min-w-36"
                      aria-label="Document status"
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={documentForm.pinned}
                        onChange={(event) => setDocumentForm((current) => ({ ...current, pinned: event.target.checked }))}
                        className="h-4 w-4 accent-gold"
                      />
                      Pinned
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => setEditingDocId(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </div>

                <input
                  value={documentForm.title}
                  onChange={(event) => setDocumentForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Untitled document"
                  className="w-full border-none bg-transparent font-display text-3xl font-bold text-ink placeholder:text-muted/60 focus:outline-none lg:text-4xl"
                  required
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Tags"
                    value={documentForm.tags}
                    onChange={(event) => setDocumentForm((current) => ({ ...current, tags: event.target.value }))}
                    placeholder="policy, pricing, fundraising"
                  />
                  <Input
                    label="Attachment names"
                    value={documentForm.attachmentNames}
                    onChange={(event) => setDocumentForm((current) => ({ ...current, attachmentNames: event.target.value }))}
                    placeholder="pricing.pdf, vendor-contract.xlsx"
                  />
                </div>

                <textarea
                  value={documentForm.content}
                  onChange={(event) => setDocumentForm((current) => ({ ...current, content: event.target.value }))}
                  placeholder="Start writing your document..."
                  rows={22}
                  className="min-h-[56vh] w-full resize-y rounded-xl border border-border bg-white/[0.03] px-5 py-4 text-base leading-8 text-ink placeholder:text-muted/60 transition focus:border-gold/40 focus:bg-white/[0.05] focus:outline-none"
                />
              </form>
            ) : (
              <article className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-7 lg:px-10">
                <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-ink">
                        {selectedSpace?.name || "No space"}
                      </span>
                      <StatusBadge status={selectedDocument.status} />
                      <span className="text-xs text-muted">Updated {formatDate(selectedDocument.updatedAt)}</span>
                    </div>
                    <h1 className="font-display text-3xl font-bold leading-tight text-ink lg:text-4xl">{selectedDocument.title}</h1>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <IconButton
                      icon={Pin}
                      label={selectedDocument.pinned ? "Unpin document" : "Pin document"}
                      onClick={() => saveQuickDocumentChange(selectedDocument, { pinned: !selectedDocument.pinned })}
                      active={selectedDocument.pinned}
                    />
                    <IconButton icon={Edit3} label="Edit page" onClick={() => beginEditingDocument(selectedDocument)} />
                  </div>
                </div>

                {!!selectedDocument.tags?.length && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted">
                        <Tag size={12} /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="min-h-[52vh] rounded-xl bg-white/[0.025] px-5 py-5 text-ink">
                  {selectedDocument.content ? (
                    <MarkdownDocument content={selectedDocument.content} />
                  ) : (
                    <p className="text-sm text-muted">This page is empty. Click edit to start writing.</p>
                  )}
                </div>

                {!!selectedDocument.attachmentNames?.length && (
                  <div className="rounded-xl bg-white/[0.03] p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-medium text-ink">
                      <Upload size={14} className="text-gold" /> Attachments
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.attachmentNames.map((name) => (
                        <span key={name} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 border-t border-border pt-4">
                  {selectedDocument.status === "archived" ? (
                    <IconButton
                      icon={Archive}
                      label="Restore"
                      onClick={() => saveQuickDocumentChange(selectedDocument, { status: "draft" }, "Document restored")}
                    />
                  ) : (
                    <IconButton
                      icon={Archive}
                      label="Archive"
                      onClick={() => saveQuickDocumentChange(selectedDocument, { status: "archived" }, "Document archived")}
                    />
                  )}
                  <IconButton icon={Trash2} label="Delete" onClick={() => handleDeleteDocument(selectedDocument)} danger />
                </div>
              </article>
            )
          ) : (
            <div className="flex min-h-[72vh] items-center justify-center p-5">
              <EmptyState
                icon={BookOpenText}
                title="Create or select a document"
                description="Documents open here as full pages with a title and writing area."
                action={
                  <Button icon={Plus} onClick={handleCreateDocument} disabled={!activeSpaces.length}>
                    New Document
                  </Button>
                }
              />
            </div>
          )}
        </section>
      </div>

      <Modal
        open={spaceModal.open}
        onClose={() => setSpaceModal({ open: false, space: null })}
        title={spaceModal.space ? "Rename Space" : "New Space"}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSaveSpace}>
          <Input
            label="Space name"
            value={spaceForm.name}
            onChange={(event) => setSpaceForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Policies, Strategy, Competitors..."
            required
          />
          <Input
            label="Description"
            value={spaceForm.description}
            onChange={(event) => setSpaceForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="What belongs in this space?"
          />
          <Select
            label="Color"
            value={spaceForm.color}
            onChange={(event) => setSpaceForm((current) => ({ ...current, color: event.target.value }))}
            options={SPACE_COLORS.map(({ value, label }) => ({ value, label }))}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setSpaceModal({ open: false, space: null })}>
              Cancel
            </Button>
            <Button type="submit">{spaceModal.space ? "Save Space" : "Create Space"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SpaceNavButton({ active, color, icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active ? "bg-gold-soft text-gold" : "text-muted hover:bg-white/5 hover:text-ink"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color || "bg-white/5"}`}>
          <Icon size={15} />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px]">{count}</span>
    </button>
  );
}

function PageListItem({ document, space, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
        active ? "bg-gold-soft text-gold" : "text-muted hover:bg-white/5 hover:text-ink"
      }`}
    >
      <FileText size={16} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{document.title}</span>
          {document.pinned && <Pin size={12} className="shrink-0 text-gold" />}
        </span>
        <span className="mt-1 block truncate text-xs text-muted">
          {space?.name || "No space"} - {formatDate(document.updatedAt)}
        </span>
      </span>
    </button>
  );
}

function IconButton({ icon: Icon, label, onClick, disabled = false, primary = false, danger = false, active = false }) {
  const tone = danger
    ? "text-coral hover:bg-coral/10"
    : primary
      ? "bg-gold text-bg hover:brightness-110"
      : active
        ? "bg-gold-soft text-gold"
        : "bg-white/5 text-muted hover:bg-white/10 hover:text-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${tone}`}
      aria-label={label}
      title={label}
    >
      <Icon size={17} />
    </button>
  );
}

function MarkdownDocument({ content }) {
  const normalizedContent = normalizeMarkdown(content);

  return (
    <div className="max-w-none text-base leading-8 text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 mt-2 font-display text-3xl font-bold leading-tight text-ink">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-7 font-display text-2xl font-semibold leading-tight text-ink">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-6 font-display text-xl font-semibold text-ink">{children}</h3>,
          h4: ({ children }) => <h4 className="mb-2 mt-5 font-display text-lg font-semibold text-ink">{children}</h4>,
          p: ({ children }) => <p className="mb-4 text-ink">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          em: ({ children }) => <em className="text-ink">{children}</em>,
          a: ({ href, children }) => (
            <a href={href} className="text-gold underline underline-offset-4" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-gold/50 bg-white/[0.03] py-2 pl-4 text-muted">{children}</blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return <code className="font-mono text-sm text-ink">{children}</code>;
            }
            return <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-gold">{children}</code>;
          },
          pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-xl bg-bg/70 p-4">{children}</pre>,
          table: ({ children }) => (
            <div className="mb-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[520px] border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/10 text-ink">{children}</thead>,
          th: ({ children }) => <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-border px-3 py-2 text-muted">{children}</td>,
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    draft: "bg-violet-soft text-violet",
    published: "bg-emerald-soft text-emerald",
    archived: "bg-white/5 text-muted",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[status] || classes.draft}`}>
      {status}
    </span>
  );
}
