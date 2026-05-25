import { api, ApiError } from "./api";
import { isOffline, enqueue } from "./offlineQueue";
import type { EditorTabRecord, EditorMetadata } from "./editorDb";
import { EMPTY_DOC, DEFAULT_COLLECTION_ID } from "./editorDb";
import type { JSONContent } from "@tiptap/core";

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

function apiNoteToTab(note: ApiNote, collectionName: string): EditorTabRecord {
  return {
    id: note.id,
    title: note.title || "Untitled",
    collectionId: note.collectionId,
    collectionName,
    content: parseJSON<JSONContent>(note.content, EMPTY_DOC),
    metadata: parseJSON<EditorMetadata>(note.metadata, null),
    updatedAt: note.updatedAt,
  };
}

export async function cloudLoadTabs(): Promise<EditorTabRecord[]> {
  const [notes, collections] = await Promise.all([
    api.get<ApiNote[]>("/api/notes"),
    api.get<ApiCollection[]>("/api/collections"),
  ]);

  const collectionMap = new Map<string, string>();
  for (const col of collections) {
    collectionMap.set(col.id, col.name);
  }

  return notes.map((note) => apiNoteToTab(note, collectionMap.get(note.collectionId) || "default"));
}

export async function cloudLoadCollections(): Promise<ApiCollection[]> {
  return api.get<ApiCollection[]>("/api/collections");
}

export async function cloudSaveTab(tab: EditorTabRecord): Promise<{ updatedAt: string }> {
  const execute = async () => {
    const result = await api.patch<ApiNote>(`/api/notes/${tab.id}`, {
      title: tab.title,
      content: JSON.stringify(tab.content),
      collectionId: tab.collectionId,
      metadata: tab.metadata === null ? null : JSON.stringify(tab.metadata),
      updatedAt: tab.updatedAt || undefined,
    });
    tab.updatedAt = result.updatedAt;
  };

  if (isOffline.value) {
    enqueue(`save:${tab.id}`, execute);
    return { updatedAt: tab.updatedAt || new Date().toISOString() };
  }

  await execute();
  return { updatedAt: tab.updatedAt || new Date().toISOString() };
}

export async function cloudCreateTab(tab: EditorTabRecord): Promise<EditorTabRecord> {
  const execute = async () => {
    // Don't send the local "default" collectionId — let the server resolve
    // its own default collection. Only send if it's a real server collection ID.
    const collectionId =
      tab.collectionId && tab.collectionId !== DEFAULT_COLLECTION_ID ? tab.collectionId : undefined;

    const result = await api.post<ApiNote>("/api/notes", {
      id: tab.id,
      title: tab.title,
      content: JSON.stringify(tab.content),
      collectionId,
      metadata: tab.metadata === null ? null : JSON.stringify(tab.metadata),
    });
    tab.updatedAt = result.updatedAt;
    tab.collectionId = result.collectionId;
  };

  if (isOffline.value) {
    enqueue(`create:${tab.id}`, execute);
    return tab;
  }

  await execute();
  return tab;
}

export async function cloudDeleteTab(tabId: string): Promise<void> {
  const execute = async () => {
    await api.delete(`/api/notes/${tabId}`, undefined, { mode: "soft" });
  };

  if (isOffline.value) {
    enqueue(`delete:${tabId}`, execute);
    return;
  }

  await execute();
}

export async function cloudReloadNote(noteId: string): Promise<EditorTabRecord | null> {
  try {
    const [note, collections] = await Promise.all([
      api.get<ApiNote>(`/api/notes/${noteId}`),
      api.get<ApiCollection[]>("/api/collections"),
    ]);

    const collectionMap = new Map<string, string>();
    for (const col of collections) {
      collectionMap.set(col.id, col.name);
    }

    return apiNoteToTab(note, collectionMap.get(note.collectionId) || "default");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export { ApiError };
