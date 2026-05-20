import Database from "@tauri-apps/plugin-sql";
import type { JSONContent } from "@tiptap/core";
import { get, set } from "idb-keyval";

export const IS_TAURI = "__TAURI_INTERNALS__" in window;
const BROWSER_STORAGE_KEY = "fylepad_editor_tabs";

export const EDITOR_DB_URL = "sqlite:fylepad-zen.db";
export const DEFAULT_COLLECTION_ID = "default";
export const DEFAULT_COLLECTION_NAME = "Default folder";

export type EditorMetadata = Record<string, unknown> | null;

export type EditorTabRecord = {
  id: string;
  title: string;
  collectionId: string;
  collectionName: string;
  content: JSONContent;
  metadata: EditorMetadata;
};

type EditorTabRow = {
  id: string;
  title: string;
  collection_id: string;
  collection_name: string | null;
  content: string;
  metadata: string | null;
};

export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

let databasePromise: Promise<Database> | null = null;

const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = Database.load(EDITOR_DB_URL);
  }

  return databasePromise;
};

export const ensureEditorSchema = async () => {
  if (!IS_TAURI) {
    // We don't need a schema for IndexedDB
    return;
  }
  const database = await getDatabase();
  await database.execute(
    "CREATE TABLE IF NOT EXISTS collections (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE)",
  );
  await database.execute(
    `CREATE TABLE IF NOT EXISTS editor_tabs (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      collection_id TEXT NOT NULL DEFAULT 'default',
      content TEXT NOT NULL,
      metadata TEXT,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT
    )`,
  );
  await database.execute(
    "CREATE INDEX IF NOT EXISTS idx_editor_tabs_collection_id ON editor_tabs(collection_id)",
  );
  await database.execute("INSERT OR IGNORE INTO collections (id, name) VALUES ($1, $2)", [
    DEFAULT_COLLECTION_ID,
    DEFAULT_COLLECTION_NAME,
  ]);
};

const createEmptyContent = (): JSONContent => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
});

const normalizeContent = (value: string | null | undefined): JSONContent => {
  if (!value) {
    return createEmptyContent();
  }

  try {
    const parsed = JSON.parse(value) as JSONContent;

    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return createEmptyContent();
  }

  return createEmptyContent();
};

const normalizeMetadata = (value: string | null | undefined): EditorMetadata => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as EditorMetadata;

    if (parsed === null || typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

const normalizeTab = (row: EditorTabRow): EditorTabRecord => ({
  id: row.id,
  title: row.title.trim() || "Untitled",
  collectionId: row.collection_id.trim() || DEFAULT_COLLECTION_ID,
  collectionName: row.collection_name?.trim() || DEFAULT_COLLECTION_NAME,
  content: normalizeContent(row.content),
  metadata: normalizeMetadata(row.metadata),
});

export const createEmptyTabRecord = (id: string): EditorTabRecord => ({
  id,
  title: "Untitled",
  collectionId: DEFAULT_COLLECTION_ID,
  collectionName: DEFAULT_COLLECTION_NAME,
  content: createEmptyContent(),
  metadata: null,
});

export const loadEditorTabs = async (): Promise<EditorTabRecord[]> => {
  if (!IS_TAURI) {
    const tabs = await get<EditorTabRecord[]>(BROWSER_STORAGE_KEY);
    if (!tabs) return [];

    return tabs.map((tab) => ({
      id: tab.id,
      title: tab.title || "Untitled",
      collectionId: tab.collectionId || DEFAULT_COLLECTION_ID,
      collectionName: tab.collectionName || DEFAULT_COLLECTION_NAME,
      content: normalizeContent(JSON.stringify(tab.content)),
      metadata: normalizeMetadata(JSON.stringify(tab.metadata)),
    }));
  }

  const database = await getDatabase();
  await ensureEditorSchema();
  const rows = await database.select<EditorTabRow[]>(
    `SELECT
       editor_tabs.id,
       editor_tabs.title,
       editor_tabs.collection_id,
       collections.name AS collection_name,
       editor_tabs.content,
       editor_tabs.metadata
     FROM editor_tabs
     LEFT JOIN collections ON collections.id = editor_tabs.collection_id
     ORDER BY editor_tabs.rowid ASC`,
  );

  return rows.map(normalizeTab);
};

export const saveEditorTab = async (tab: EditorTabRecord) => {
  if (!IS_TAURI) {
    const tabs = (await get<EditorTabRecord[]>(BROWSER_STORAGE_KEY)) || [];
    const index = tabs.findIndex((t) => t.id === tab.id);
    if (index >= 0) {
      tabs[index] = tab;
    } else {
      tabs.push(tab);
    }
    // Fix clone issue by stripping Vue proxies before saving to IndexedDB
    await set(BROWSER_STORAGE_KEY, JSON.parse(JSON.stringify(tabs)));
    return;
  }

  const database = await getDatabase();
  await ensureEditorSchema();

  await database.execute("INSERT OR IGNORE INTO collections (id, name) VALUES ($1, $2)", [
    tab.collectionId,
    tab.collectionName || tab.collectionId,
  ]);

  await database.execute(
    `INSERT INTO editor_tabs (id, title, collection_id, content, metadata)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       collection_id = excluded.collection_id,
       content = excluded.content,
       metadata = excluded.metadata`,
    [
      tab.id,
      tab.title,
      tab.collectionId,
      JSON.stringify(tab.content),
      tab.metadata === null ? null : JSON.stringify(tab.metadata),
    ],
  );
};

export const deleteEditorTab = async (tabId: string) => {
  if (!IS_TAURI) {
    const tabs = (await get<EditorTabRecord[]>(BROWSER_STORAGE_KEY)) || [];
    const filtered = tabs.filter((t) => t.id !== tabId);
    await set(BROWSER_STORAGE_KEY, JSON.parse(JSON.stringify(filtered)));
    return;
  }

  const database = await getDatabase();
  await ensureEditorSchema();
  await database.execute("DELETE FROM editor_tabs WHERE id = $1", [tabId]);
};
