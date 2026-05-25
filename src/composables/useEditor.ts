import type { Editor } from "@tiptap/core";
import { computed, markRaw, ref, shallowReactive } from "vue";
import { useFileSystemAccess, useMagicKeys, useStorage, whenever } from "@vueuse/core";
import {
  createEmptyTabRecord,
  createEditorTab,
  ensureEditorSchema,
  IS_TAURI,
  isCloudMode,
  saveEditorTab,
  type EditorMetadata,
  type EditorTabRecord,
} from "@/lib/editorDb";
import { loadNotesByIds, createNote as dbCreateNote } from "@/lib/notesDb";
import { cloudReloadNote, ApiError } from "@/lib/cloudDb";
import { isOffline, registerOfflineListeners, clearQueue } from "@/lib/offlineQueue";

export type EditorTab = EditorTabRecord;

const tabs = ref<EditorTab[]>([]);
const isReady = ref(false);
let initializationPromise: Promise<void> | null = null;

const activeTabId = IS_TAURI ? useStorage("active-tab-id", "") : ref("");
const openTabIds = IS_TAURI ? useStorage<string[]>("open-tab-ids", []) : ref<string[]>([]);
const editors = shallowReactive(new Map<string, Editor>());
const pendingSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const conflictedTabs = ref(new Set<string>());

const markdownFileType = {
  description: "Markdown",
  accept: {
    "text/markdown": [".md", ".markdown", ".txt"],
  },
};

const markdownDialogFilters = [
  {
    name: "Markdown",
    extensions: ["md", "markdown", "txt"],
  },
];

const browserFileSystemAccess = useFileSystemAccess({
  dataType: "Text",
  types: [markdownFileType],
});
const {
  data: browserFileData,
  fileName: browserFileName,
  open: openBrowserFile,
  save: saveBrowserFile,
} = browserFileSystemAccess;

const getTab = (tabId: string) => tabs.value.find((tab) => tab.id === tabId);

const parseFrontmatter = (content: string) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) return { frontmatter: null, body: content };

  return { frontmatter: match[1], body: match[2] };
};

const extractTitleFromFrontmatter = (fm: string | null) => {
  if (!fm) return null;
  const titleMatch = fm.match(/^title:\s*["']?([^"'\n]+)["']?$/m);
  return titleMatch ? titleMatch[1].trim() : null;
};

const buildFrontmatter = (title: string) => `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n`;

const normalizeTabTitle = (value: string) => value.trim() || "Untitled";

const getSourceNameFromPath = (sourcePathOrName: string) =>
  sourcePathOrName.split(/[\\/]/).pop() || sourcePathOrName;

const getMarkdownFromEditor = (editor: Editor | undefined, tab: EditorTabRecord) => {
  if (editor && typeof (editor as any).storage?.markdown?.getMarkdown === "function") {
    return (editor as any).storage.markdown.getMarkdown() as string;
  }

  if (typeof (tab.metadata as any)?.rawMarkdown === "string") {
    return (tab.metadata as any).rawMarkdown as string;
  }

  return "";
};

const persistTab = async (tabId: string) => {
  const tab = getTab(tabId);

  if (!tab) {
    return;
  }

  if (conflictedTabs.value.has(tabId)) {
    return;
  }

  const editor = editors.get(tabId);

  if (editor) {
    tab.content = editor.getJSON();
  }

  try {
    await saveEditorTab(tab);
  } catch (err) {
    if (err instanceof ApiError && err.isConflict) {
      conflictedTabs.value.add(tabId);
      throw err;
    }
    throw err;
  }
};

const savesInFlight = new Set<string>();

const scheduleTabSave = (tabId: string) => {
  if (conflictedTabs.value.has(tabId)) {
    return;
  }

  const existingTimer = pendingSaveTimers.get(tabId);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(async () => {
    pendingSaveTimers.delete(tabId);

    if (savesInFlight.has(tabId)) {
      scheduleTabSave(tabId);
      return;
    }

    savesInFlight.add(tabId);
    try {
      await persistTab(tabId);
    } catch (error) {
      if (error instanceof ApiError && error.isConflict) {
        console.warn(`Conflict on tab ${tabId} — reload required`);
        return;
      }
      console.error(`Failed to persist tab ${tabId}:`, error);
    } finally {
      savesInFlight.delete(tabId);
    }
  }, 250);

  pendingSaveTimers.set(tabId, timer);
};

const updateTabTitle = (tabId: string, title: string) => {
  const tab = getTab(tabId);

  if (!tab) {
    return;
  }

  tab.title = title.trim() || "Untitled";
  scheduleTabSave(tabId);
};

const updateTabMetadata = (tabId: string, metadata: EditorMetadata) => {
  const tab = getTab(tabId);

  if (!tab) {
    return;
  }

  tab.metadata = metadata;
  scheduleTabSave(tabId);
};

const updateTabContent = (tabId: string, content: EditorTab["content"]) => {
  const tab = getTab(tabId);

  if (!tab) {
    return;
  }

  tab.content = content;
  scheduleTabSave(tabId);
};

const createTab = async () => {
  const note = await dbCreateNote("Untitled");

  tabs.value = [...tabs.value, note];
  activeTabId.value = note.id;
  openTabIds.value = [...openTabIds.value, note.id];

  return note;
};

const openNote = (note: EditorTabRecord) => {
  const existing = tabs.value.find((t) => t.id === note.id);
  if (existing) {
    activeTabId.value = note.id;
    return;
  }

  tabs.value = [...tabs.value, note];
  activeTabId.value = note.id;
  if (!openTabIds.value.includes(note.id)) {
    openTabIds.value = [...openTabIds.value, note.id];
  }
};

const closeTab = (tabId: string) => {
  const index = tabs.value.findIndex((tab) => tab.id === tabId);

  if (index === -1) {
    return;
  }

  // Flush any pending save before closing
  const timer = pendingSaveTimers.get(tabId);
  if (timer) {
    clearTimeout(timer);
    pendingSaveTimers.delete(tabId);
    void persistTab(tabId).catch(() => {});
  }

  tabs.value = tabs.value.filter((tab) => tab.id !== tabId);
  editors.delete(tabId);
  conflictedTabs.value.delete(tabId);
  openTabIds.value = openTabIds.value.filter((id) => id !== tabId);

  if (activeTabId.value === tabId) {
    if (tabs.value.length > 0) {
      const nextIndex = Math.min(index, tabs.value.length - 1);
      activeTabId.value = tabs.value[nextIndex].id;
    } else {
      activeTabId.value = "";
    }
  }
};

const reloadTab = async (tabId: string): Promise<boolean> => {
  if (!isCloudMode()) return false;

  const reloaded = await cloudReloadNote(tabId);
  if (!reloaded) return false;

  const index = tabs.value.findIndex((t) => t.id === tabId);
  if (index < 0) return false;

  tabs.value[index] = reloaded;
  conflictedTabs.value.delete(tabId);

  const editor = editors.get(tabId);
  if (editor) {
    editor.commands.setContent(reloaded.content, { emitUpdate: false });
  }

  return true;
};

export const initializeEditorStore = async () => {
  if (isReady.value) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      await ensureEditorSchema();

      if (isCloudMode()) {
        registerOfflineListeners();
      }

      // Load only notes that are currently open as tabs
      const ids = openTabIds.value;
      if (ids.length > 0) {
        const loaded = await loadNotesByIds(ids);
        tabs.value = loaded;

        // Clean up stale IDs (notes that were deleted while editor was closed)
        const loadedIds = new Set(loaded.map((t) => t.id));
        openTabIds.value = ids.filter((id) => loadedIds.has(id));

        if (!tabs.value.some((t) => t.id === activeTabId.value)) {
          activeTabId.value = loaded[0]?.id ?? "";
        }
      } else {
        tabs.value = [];
        activeTabId.value = "";
      }
    } catch (error) {
      console.error("Failed to initialize the editor store:", error);
      tabs.value = [];
      activeTabId.value = "";
    } finally {
      isReady.value = true;
    }
  })();

  return initializationPromise;
};

export const reinitializeEditorStore = async () => {
  // Clear all pending saves
  for (const [, timer] of pendingSaveTimers) {
    clearTimeout(timer);
  }
  pendingSaveTimers.clear();
  editors.clear();
  conflictedTabs.value.clear();
  clearQueue();

  // Reset state
  tabs.value = [];
  isReady.value = false;
  initializationPromise = null;
  activeTabId.value = "";
  openTabIds.value = [];

  // Re-initialize from the new storage backend
  await initializeEditorStore();
};

export function useEditor() {
  const keys = useMagicKeys({
    passive: false,
    onEventFired(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "s" || event.key === "S") &&
        event.type === "keydown"
      ) {
        event.preventDefault();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "o" || event.key === "O") &&
        event.type === "keydown"
      ) {
        event.preventDefault();
      }
    },
  });

  const activeEditor = computed(() => editors.get(activeTabId.value));

  const registerEditor = (tabId: string, editor: Editor) => {
    editors.set(tabId, markRaw(editor));
  };

  const unregisterEditor = (tabId: string) => {
    editors.delete(tabId);
  };

  const getEditor = (tabId: string = activeTabId.value) => editors.get(tabId);

  const setActiveTab = (tabId: string) => {
    if (!tabId || tabs.value.some((tab) => tab.id === tabId)) {
      activeTabId.value = tabId;
    }
  };

  const openFileDialog = async () => {
    if (IS_TAURI) {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { readTextFile } = await import("@tauri-apps/plugin-fs");

      const selectedPath = await open({
        multiple: false,
        directory: false,
        filters: markdownDialogFilters,
      });

      if (!selectedPath || Array.isArray(selectedPath)) {
        return;
      }

      const content = await readTextFile(selectedPath);
      await handleImportedContent(content, selectedPath);
      return;
    }

    if (!browserFileSystemAccess.isSupported.value) {
      console.warn("File System Access API is not supported in this browser.");
      return;
    }

    await openBrowserFile({ types: [markdownFileType] });

    if (typeof browserFileData.value === "string" && browserFileData.value) {
      await handleImportedContent(browserFileData.value, browserFileName.value || undefined);
    }
  };

  const handleImportedContent = async (text: string, sourcePathOrName?: string) => {
    const { frontmatter, body } = parseFrontmatter(text);
    const titleFromFm = extractTitleFromFrontmatter(frontmatter);
    const defaultTitle =
      titleFromFm ||
      (typeof sourcePathOrName === "string"
        ? String(sourcePathOrName).replace(/\.(md|markdown|txt)$/, "")
        : "Untitled");

    const tab = createEmptyTabRecord(globalThis.crypto.randomUUID());
    tab.title = normalizeTabTitle(defaultTitle);
    tab.metadata = {
      rawMarkdown: body,
      origin: "external_file",
      sourceName: sourcePathOrName ? getSourceNameFromPath(sourcePathOrName) : undefined,
      sourcePath: sourcePathOrName,
    } as EditorMetadata;

    tabs.value = [...tabs.value, tab];
    activeTabId.value = tab.id;

    try {
      await createEditorTab(tab);
    } catch (err) {
      console.error("Failed to save imported tab to DB:", err);
    }
  };

  const exportActiveToMarkdown = async () => {
    const tab = getTab(activeTabId.value);
    const editor = editors.get(activeTabId.value);

    if (!tab) return "";

    const markdown = getMarkdownFromEditor(editor, tab);

    const title = tab.title || "Untitled";
    return buildFrontmatter(title) + markdown;
  };

  const saveActiveToDisk = async () => {
    const tab = getTab(activeTabId.value);

    if (!tab) {
      return;
    }

    const fullMarkdown = await exportActiveToMarkdown();

    if (IS_TAURI) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");

      const targetPath = await save({ filters: markdownDialogFilters });

      if (!targetPath || Array.isArray(targetPath)) {
        return;
      }

      await writeTextFile(targetPath, fullMarkdown);

      return;
    }

    if (!browserFileSystemAccess.isSupported.value) {
      console.warn("File System Access API is not supported in this browser.");
      return;
    }

    browserFileData.value = fullMarkdown;
    await saveBrowserFile({ suggestedName: `${normalizeTabTitle(tab.title)}.md` });
  };

  whenever(
    () => keys.ctrl_o?.value || keys.meta_o?.value,
    () => {
      void openFileDialog();
    },
  );

  return {
    activeEditor,
    activeTabId,
    closeTab,
    conflictedTabs,
    createTab,
    initializeEditorStore,
    editors,
    getEditor,
    getTab,
    isOffline,
    isReady,
    openNote,
    registerEditor,
    reloadTab,
    setActiveTab,
    updateTabContent,
    updateTabMetadata,
    updateTabTitle,
    openFileDialog,
    exportActiveToMarkdown,
    saveActiveToDisk,
    tabs,
    unregisterEditor,
  };
}
