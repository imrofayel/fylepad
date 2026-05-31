import Database from "@tauri-apps/plugin-sql";
import type { JSONContent } from "@tiptap/core";
import { get, set } from "idb-keyval";
import { cloudLoadTabs, cloudSaveTab, cloudCreateTab, cloudDeleteTab } from "./cloudDb";

export const IS_TAURI = "__TAURI_INTERNALS__" in window;
const BROWSER_STORAGE_KEY = "fylepad_editor_tabs";

export const EDITOR_DB_URL = "sqlite:fylepad.db";
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type CollectionRecord = {
  id: string;
  name: string;
  isSystem: boolean;
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

// ─── Cloud mode bridge ───────────────────────────────────────────────────────
// Set by useAuth when the user logs in/out (browser only)
import { ref as vueRef } from "vue";
const _cloudMode = vueRef(false);

export function setCloudMode(enabled: boolean) {
  _cloudMode.value = enabled;
}

export function isCloudMode(): boolean {
  return !IS_TAURI && _cloudMode.value;
}

// ─── Tauri SQLite helpers ────────────────────────────────────────────────────
let databasePromise: Promise<Database> | null = null;

export const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = Database.load(EDITOR_DB_URL);
  }

  return databasePromise;
};

export const ensureEditorSchema = async () => {
  if (!IS_TAURI) {
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
      created_at TEXT,
      deleted_at TEXT,
      updated_at TEXT,
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

// ─── Main API ────────────────────────────────────────────────────────────────

export const loadEditorTabs = async (): Promise<EditorTabRecord[]> => {
  // Cloud mode (browser + authenticated)
  if (isCloudMode()) {
    return cloudLoadTabs();
  }

  // Local browser mode (idb-keyval)
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

  // Tauri mode (SQLite)
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
  // Cloud mode
  if (isCloudMode()) {
    const result = await cloudSaveTab(tab);
    tab.updatedAt = result.updatedAt;
    return;
  }

  // Local browser mode
  if (!IS_TAURI) {
    tab.updatedAt = new Date().toISOString();
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

  // Tauri mode
  const database = await getDatabase();
  await ensureEditorSchema();

  await database.execute("INSERT OR IGNORE INTO collections (id, name) VALUES ($1, $2)", [
    tab.collectionId,
    tab.collectionName || tab.collectionId,
  ]);

  await database.execute(
    `INSERT INTO editor_tabs (id, title, collection_id, content, metadata, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       collection_id = excluded.collection_id,
       content = excluded.content,
       metadata = excluded.metadata,
       updated_at = excluded.updated_at`,
    [
      tab.id,
      tab.title,
      tab.collectionId,
      JSON.stringify(tab.content),
      tab.metadata === null ? null : JSON.stringify(tab.metadata),
      new Date().toISOString(),
    ],
  );
};

export const createEditorTab = async (tab: EditorTabRecord) => {
  // Cloud mode — use the dedicated create endpoint
  if (isCloudMode()) {
    return cloudCreateTab(tab);
  }

  // For local/tauri, save is upsert so reuse it
  await saveEditorTab(tab);
  return tab;
};

export const deleteEditorTab = async (tabId: string) => {
  // Cloud mode
  if (isCloudMode()) {
    await cloudDeleteTab(tabId);
    return;
  }

  // Local browser mode
  if (!IS_TAURI) {
    const tabs = (await get<EditorTabRecord[]>(BROWSER_STORAGE_KEY)) || [];
    const filtered = tabs.filter((t) => t.id !== tabId);
    await set(BROWSER_STORAGE_KEY, JSON.parse(JSON.stringify(filtered)));
    return;
  }

  // Tauri mode
  const database = await getDatabase();
  await ensureEditorSchema();
  await database.execute("DELETE FROM editor_tabs WHERE id = $1", [tabId]);
};
