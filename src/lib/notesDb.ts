import { get, set } from "idb-keyval";
import { api } from "./api";
import {
  IS_TAURI,
  isCloudMode,
  getDatabase,
  ensureEditorSchema,
  DEFAULT_COLLECTION_ID,
  DEFAULT_COLLECTION_NAME,
  EMPTY_DOC,
  type EditorTabRecord,
  type CollectionRecord,
  type EditorMetadata,
} from "./editorDb";
import type { JSONContent } from "@tiptap/core";

const BROWSER_STORAGE_KEY = "fylepad_editor_tabs";
const BROWSER_COLLECTIONS_KEY = "fylepad_collections";

// ─── API response types ──────────────────────────────────────────────────────
type ApiNote = {
  id: string;
  userId: string;
  title: string;
  collectionId: string;
  content: string;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type ApiCollection = {
  id: string;
  userId: string;
  name: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return parsed as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function apiNoteToRecord(note: ApiNote, collectionName: string): EditorTabRecord {
  return {
    id: note.id,
    title: note.title || "Untitled",
    collectionId: note.collectionId,
    collectionName,
    content:
      note.content !== undefined ? parseJSON<JSONContent>(note.content, EMPTY_DOC) : EMPTY_DOC,
    metadata: note.metadata !== undefined ? parseJSON<EditorMetadata>(note.metadata, null) : null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    deletedAt: note.deletedAt,
  };
}

// ─── idb-keyval helpers ──────────────────────────────────────────────────────
async function getAllLocalNotes(): Promise<EditorTabRecord[]> {
  return (await get<EditorTabRecord[]>(BROWSER_STORAGE_KEY)) || [];
}

async function saveAllLocalNotes(notes: EditorTabRecord[]): Promise<void> {
  await set(BROWSER_STORAGE_KEY, JSON.parse(JSON.stringify(notes)));
}

// ─── Public: Load notes ──────────────────────────────────────────────────────
export async function loadAllNotes(): Promise<EditorTabRecord[]> {
  if (IS_TAURI) {
    const db = await getDatabase();
    await ensureEditorSchema();
    const rows = await db.select<
      {
        id: string;
        title: string;
        collection_id: string;
        collection_name: string | null;
        created_at: string | null;
        deleted_at: string | null;
      }[]
    >(
      `SELECT e.id, e.title, e.collection_id, c.name AS collection_name,
              e.created_at, e.deleted_at
       FROM editor_tabs e
       LEFT JOIN collections c ON c.id = e.collection_id
       WHERE e.deleted_at IS NULL
       ORDER BY e.updated_at DESC`,
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title || "Untitled",
      collectionId: r.collection_id || DEFAULT_COLLECTION_ID,
      collectionName: r.collection_name || DEFAULT_COLLECTION_NAME,
      content: EMPTY_DOC,
      metadata: null,
      createdAt: r.created_at || undefined,
      deletedAt: null,
    }));
  }

  if (isCloudMode()) {
    const [notes, collections] = await Promise.all([
      api.get<ApiNote[]>("/api/notes"),
      api.get<ApiCollection[]>("/api/collections"),
    ]);
    const colMap = new Map<string, string>();
    for (const c of collections) colMap.set(c.id, c.name);
    return notes.map((n) => apiNoteToRecord(n, colMap.get(n.collectionId) || "default"));
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  return all.filter((n) => !n.deletedAt);
}

export async function loadTrashedNotes(): Promise<EditorTabRecord[]> {
  if (IS_TAURI) {
    const db = await getDatabase();
    await ensureEditorSchema();
    const rows = await db.select<
      {
        id: string;
        title: string;
        collection_id: string;
        collection_name: string | null;
        created_at: string | null;
        deleted_at: string | null;
      }[]
    >(
      `SELECT e.id, e.title, e.collection_id, c.name AS collection_name,
              e.created_at, e.deleted_at
       FROM editor_tabs e
       LEFT JOIN collections c ON c.id = e.collection_id
       WHERE e.deleted_at IS NOT NULL
       ORDER BY e.deleted_at DESC`,
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title || "Untitled",
      collectionId: r.collection_id || DEFAULT_COLLECTION_ID,
      collectionName: r.collection_name || DEFAULT_COLLECTION_NAME,
      content: EMPTY_DOC,
      metadata: null,
      createdAt: r.created_at || undefined,
      deletedAt: r.deleted_at,
    }));
  }

  if (isCloudMode()) {
    const [notes, collections] = await Promise.all([
      api.get<ApiNote[]>("/api/notes/trash"),
      api.get<ApiCollection[]>("/api/collections"),
    ]);
    const colMap = new Map<string, string>();
    for (const c of collections) colMap.set(c.id, c.name);
    return notes.map((n) => apiNoteToRecord(n, colMap.get(n.collectionId) || "default"));
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  return all.filter((n) => !!n.deletedAt);
}

export async function loadNotesByIds(ids: string[]): Promise<EditorTabRecord[]> {
  if (ids.length === 0) return [];

  if (IS_TAURI) {
    const db = await getDatabase();
    await ensureEditorSchema();
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    const rows = await db.select<
      {
        id: string;
        title: string;
        collection_id: string;
        collection_name: string | null;
        content: string;
        metadata: string | null;
        created_at: string | null;
      }[]
    >(
      `SELECT e.id, e.title, e.collection_id, c.name AS collection_name,
              e.content, e.metadata, e.created_at
       FROM editor_tabs e
       LEFT JOIN collections c ON c.id = e.collection_id
       WHERE e.id IN (${placeholders}) AND e.deleted_at IS NULL`,
      ids,
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title || "Untitled",
      collectionId: r.collection_id || DEFAULT_COLLECTION_ID,
      collectionName: r.collection_name || DEFAULT_COLLECTION_NAME,
      content: parseJSON<JSONContent>(r.content, EMPTY_DOC),
      metadata: parseJSON<EditorMetadata>(r.metadata, null),
      createdAt: r.created_at || undefined,
    }));
  }

  if (isCloudMode()) {
    const results = await Promise.allSettled(ids.map((id) => api.get<ApiNote>(`/api/notes/${id}`)));
    const collections = await api.get<ApiCollection[]>("/api/collections");
    const colMap = new Map<string, string>();
    for (const c of collections) colMap.set(c.id, c.name);

    const notes: EditorTabRecord[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        const n = result.value;
        if (!n.deletedAt) {
          notes.push(apiNoteToRecord(n, colMap.get(n.collectionId) || "default"));
        }
      }
    }
    return notes;
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  const idSet = new Set(ids);
  return all.filter((n) => idSet.has(n.id) && !n.deletedAt);
}

// ─── Public: Note mutations ──────────────────────────────────────────────────
export async function createNote(
  title: string = "Untitled",
  collectionId?: string,
): Promise<EditorTabRecord> {
  const id = globalThis.crypto.randomUUID();
  const now = new Date().toISOString();

  if (IS_TAURI) {
    const db = await getDatabase();
    await ensureEditorSchema();
    const colId = collectionId || DEFAULT_COLLECTION_ID;
    await db.execute(
      `INSERT INTO editor_tabs (id, title, collection_id, content, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, title, colId, JSON.stringify(EMPTY_DOC), null, now],
    );
    return {
      id,
      title,
      collectionId: colId,
      collectionName: DEFAULT_COLLECTION_NAME,
      content: EMPTY_DOC,
      metadata: null,
      createdAt: now,
    };
  }

  if (isCloudMode()) {
    const result = await api.post<ApiNote>("/api/notes", {
      id,
      title,
      collectionId: collectionId || undefined,
    });
    const collections = await api.get<ApiCollection[]>("/api/collections");
    const colMap = new Map<string, string>();
    for (const c of collections) colMap.set(c.id, c.name);
    return apiNoteToRecord(result, colMap.get(result.collectionId) || "default");
  }

  // idb-keyval
  const note: EditorTabRecord = {
    id,
    title,
    collectionId: DEFAULT_COLLECTION_ID,
    collectionName: DEFAULT_COLLECTION_NAME,
    content: EMPTY_DOC,
    metadata: null,
    createdAt: now,
  };
  const all = await getAllLocalNotes();
  all.push(note);
  await saveAllLocalNotes(all);
  return note;
}

export async function softDeleteNote(noteId: string): Promise<void> {
  const now = new Date().toISOString();

  if (IS_TAURI) {
    const db = await getDatabase();
    await db.execute("UPDATE editor_tabs SET deleted_at = $1 WHERE id = $2", [now, noteId]);
    return;
  }

  if (isCloudMode()) {
    await api.delete(`/api/notes/${noteId}`, undefined, { mode: "soft" });
    return;
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  const note = all.find((n) => n.id === noteId);
  if (note) {
    note.deletedAt = now;
    await saveAllLocalNotes(all);
  }
}

export async function hardDeleteNotes(noteIds: string[]): Promise<void> {
  if (IS_TAURI) {
    const db = await getDatabase();
    const placeholders = noteIds.map((_, i) => `$${i + 1}`).join(",");
    await db.execute(`DELETE FROM editor_tabs WHERE id IN (${placeholders})`, noteIds);
    return;
  }

  if (isCloudMode()) {
    await api.delete("/api/notes", { ids: noteIds }, { mode: "hard" });
    return;
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  const idSet = new Set(noteIds);
  await saveAllLocalNotes(all.filter((n) => !idSet.has(n.id)));
}

export async function restoreNotes(noteIds: string[]): Promise<void> {
  if (IS_TAURI) {
    const db = await getDatabase();
    const placeholders = noteIds.map((_, i) => `$${i + 1}`).join(",");
    await db.execute(
      `UPDATE editor_tabs SET deleted_at = NULL WHERE id IN (${placeholders})`,
      noteIds,
    );
    return;
  }

  if (isCloudMode()) {
    await api.post("/api/notes/restore", { ids: noteIds });
    return;
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  const idSet = new Set(noteIds);
  for (const note of all) {
    if (idSet.has(note.id)) {
      note.deletedAt = null;
    }
  }
  await saveAllLocalNotes(all);
}

export async function moveNote(noteId: string, collectionId: string): Promise<void> {
  if (IS_TAURI) {
    const db = await getDatabase();
    await db.execute("UPDATE editor_tabs SET collection_id = $1 WHERE id = $2", [
      collectionId,
      noteId,
    ]);
    return;
  }

  if (isCloudMode()) {
    await api.patch(`/api/notes/${noteId}`, { collectionId });
    return;
  }

  // idb-keyval — update collectionId on the record
  const all = await getAllLocalNotes();
  const note = all.find((n) => n.id === noteId);
  if (note) {
    note.collectionId = collectionId;
    await saveAllLocalNotes(all);
  }
}

export async function renameNote(noteId: string, title: string): Promise<void> {
  if (IS_TAURI) {
    const db = await getDatabase();
    await db.execute("UPDATE editor_tabs SET title = $1 WHERE id = $2", [title, noteId]);
    return;
  }

  if (isCloudMode()) {
    await api.patch(`/api/notes/${noteId}`, { title });
    return;
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  const note = all.find((n) => n.id === noteId);
  if (note) {
    note.title = title;
    await saveAllLocalNotes(all);
  }
}

// ─── Public: Collections ─────────────────────────────────────────────────────
export function hasCollections(): boolean {
  return true;
}

export async function loadCollections(): Promise<CollectionRecord[]> {
  if (IS_TAURI) {
    const db = await getDatabase();
    await ensureEditorSchema();
    const rows = await db.select<{ id: string; name: string }[]>(
      "SELECT id, name FROM collections ORDER BY rowid ASC",
    );
    return rows.map((r) => ({ id: r.id, name: r.name, isSystem: r.id === DEFAULT_COLLECTION_ID }));
  }

  if (isCloudMode()) {
    const cols = await api.get<ApiCollection[]>("/api/collections");
    return cols.map((c) => ({ id: c.id, name: c.name, isSystem: c.isSystem }));
  }

  // idb-keyval — basic collection support
  const cols = (await get<CollectionRecord[]>(BROWSER_COLLECTIONS_KEY)) || [];
  if (!cols.some((c) => c.id === DEFAULT_COLLECTION_ID)) {
    cols.unshift({ id: DEFAULT_COLLECTION_ID, name: DEFAULT_COLLECTION_NAME, isSystem: true });
  }
  return cols;
}

export async function createCollection(name: string): Promise<CollectionRecord> {
  const id = globalThis.crypto.randomUUID();

  if (IS_TAURI) {
    const db = await getDatabase();
    await db.execute("INSERT INTO collections (id, name) VALUES ($1, $2)", [id, name]);
    return { id, name, isSystem: false };
  }

  if (isCloudMode()) {
    const result = await api.post<ApiCollection>("/api/collections", { name });
    return { id: result.id, name: result.name, isSystem: result.isSystem };
  }

  // idb-keyval
  const col: CollectionRecord = { id, name, isSystem: false };
  const cols = (await get<CollectionRecord[]>(BROWSER_COLLECTIONS_KEY)) || [];
  cols.push(col);
  await set(BROWSER_COLLECTIONS_KEY, JSON.parse(JSON.stringify(cols)));
  return col;
}

export async function renameCollection(colId: string, name: string): Promise<void> {
  if (IS_TAURI) {
    const db = await getDatabase();
    await db.execute("UPDATE collections SET name = $1 WHERE id = $2", [name, colId]);
    return;
  }

  if (isCloudMode()) {
    await api.patch(`/api/collections/${colId}`, { name });
    return;
  }

  // idb-keyval
  const cols = (await get<CollectionRecord[]>(BROWSER_COLLECTIONS_KEY)) || [];
  const col = cols.find((c) => c.id === colId);
  if (col) {
    col.name = name;
    await set(BROWSER_COLLECTIONS_KEY, JSON.parse(JSON.stringify(cols)));
  }
}

export const RECOVERED_COLLECTION_ID = "recovered";
export const RECOVERED_COLLECTION_NAME = "Recovered";

export async function deleteCollection(
  colId: string,
  mode: "move" | "delete" = "move",
): Promise<void> {
  if (IS_TAURI) {
    const db = await getDatabase();

    // Ensure a "recovered" collection exists
    await db.execute("INSERT OR IGNORE INTO collections (id, name) VALUES ($1, $2)", [
      RECOVERED_COLLECTION_ID,
      RECOVERED_COLLECTION_NAME,
    ]);

    if (mode === "move") {
      // Move non-deleted notes to default
      await db.execute(
        "UPDATE editor_tabs SET collection_id = $1 WHERE collection_id = $2 AND deleted_at IS NULL",
        [DEFAULT_COLLECTION_ID, colId],
      );
      // Move trashed notes to recovered
      await db.execute(
        "UPDATE editor_tabs SET collection_id = $1 WHERE collection_id = $2 AND deleted_at IS NOT NULL",
        [RECOVERED_COLLECTION_ID, colId],
      );
    } else {
      const now = new Date().toISOString();
      // Soft-delete all non-deleted notes
      await db.execute(
        "UPDATE editor_tabs SET deleted_at = $1 WHERE collection_id = $2 AND deleted_at IS NULL",
        [now, colId],
      );
      // Move ALL notes (all now trashed) to recovered
      await db.execute("UPDATE editor_tabs SET collection_id = $1 WHERE collection_id = $2", [
        RECOVERED_COLLECTION_ID,
        colId,
      ]);
    }
    await db.execute("DELETE FROM collections WHERE id = $1", [colId]);
    return;
  }

  if (isCloudMode()) {
    await api.delete(`/api/collections/${colId}`, undefined, { mode });
    return;
  }

  // idb-keyval
  const all = await getAllLocalNotes();
  if (mode === "move") {
    for (const n of all) {
      if (n.collectionId === colId) {
        if (n.deletedAt) {
          // Trashed notes → recovered
          n.collectionId = RECOVERED_COLLECTION_ID;
          n.collectionName = RECOVERED_COLLECTION_NAME;
        } else {
          // Non-deleted → default
          n.collectionId = DEFAULT_COLLECTION_ID;
          n.collectionName = DEFAULT_COLLECTION_NAME;
        }
      }
    }
  } else {
    const now = new Date().toISOString();
    for (const n of all) {
      if (n.collectionId === colId) {
        if (!n.deletedAt) {
          n.deletedAt = now;
        }
        // All notes (now trashed) → recovered
        n.collectionId = RECOVERED_COLLECTION_ID;
        n.collectionName = RECOVERED_COLLECTION_NAME;
      }
    }
  }
  await saveAllLocalNotes(all);

  const cols = (await get<CollectionRecord[]>(BROWSER_COLLECTIONS_KEY)) || [];
  await set(
    BROWSER_COLLECTIONS_KEY,
    JSON.parse(JSON.stringify(cols.filter((c) => c.id !== colId))),
  );
}
