import type { Editor } from "@tiptap/core";
import { computed, markRaw, ref, shallowReactive } from "vue";
import {
  createEmptyTabRecord,
  deleteEditorTab,
  ensureEditorSchema,
  loadEditorTabs,
  saveEditorTab,
  type EditorMetadata,
  type EditorTabRecord,
} from "@/lib/editorDb";

export type EditorTab = EditorTabRecord;

const tabs = ref<EditorTab[]>([]);
const isReady = ref(false);
let initializationPromise: Promise<void> | null = null;

const activeTabId = ref("");
const editors = shallowReactive(new Map<string, Editor>());
const pendingSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

const getTab = (tabId: string) => tabs.value.find((tab) => tab.id === tabId);

const persistTab = async (tabId: string) => {
  const tab = getTab(tabId);

  if (!tab) {
    return;
  }

  const editor = editors.get(tabId);

  if (editor) {
    tab.content = editor.getJSON();
  }

  await saveEditorTab(tab);
};

const scheduleTabSave = (tabId: string) => {
  const existingTimer = pendingSaveTimers.get(tabId);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    pendingSaveTimers.delete(tabId);

    void persistTab(tabId).catch((error) => {
      console.error(`Failed to persist tab ${tabId}:`, error);
    });
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

const createTab = () => {
  const tab = createEmptyTabRecord(globalThis.crypto.randomUUID());

  tabs.value = [...tabs.value, tab];
  activeTabId.value = tab.id;

  void saveEditorTab(tab).catch((error) => {
    console.error(`Failed to create tab ${tab.id}:`, error);
  });

  return tab;
};

const closeTab = (tabId: string) => {
  const index = tabs.value.findIndex((tab) => tab.id === tabId);

  if (index === -1) {
    return;
  }

  tabs.value = tabs.value.filter((tab) => tab.id !== tabId);

  const timer = pendingSaveTimers.get(tabId);

  if (timer) {
    clearTimeout(timer);
    pendingSaveTimers.delete(tabId);
  }

  editors.delete(tabId);

  void deleteEditorTab(tabId).catch((error) => {
    console.error(`Failed to delete tab ${tabId}:`, error);
  });

  if (activeTabId.value === tabId) {
    if (tabs.value.length > 0) {
      const nextIndex = Math.min(index, tabs.value.length - 1);
      activeTabId.value = tabs.value[nextIndex].id;
    } else {
      activeTabId.value = "";
    }
  }
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
      const persistedTabs = await loadEditorTabs();

      if (persistedTabs.length === 0) {
        const tab = createEmptyTabRecord(globalThis.crypto.randomUUID());
        tabs.value = [tab];
        activeTabId.value = tab.id;
        await saveEditorTab(tab);
      } else {
        tabs.value = persistedTabs;
        activeTabId.value = persistedTabs[0]?.id ?? "";
      }
    } catch (error) {
      console.error("Failed to initialize the editor store:", error);

      if (tabs.value.length === 0) {
        const tab = createEmptyTabRecord(globalThis.crypto.randomUUID());
        tabs.value = [tab];
        activeTabId.value = tab.id;
      }
    } finally {
      isReady.value = true;
    }
  })();

  return initializationPromise;
};

export function useEditor() {
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

  return {
    activeEditor,
    activeTabId,
    closeTab,
    createTab,
    initializeEditorStore,
    editors,
    getEditor,
    getTab,
    isReady,
    registerEditor,
    setActiveTab,
    updateTabContent,
    updateTabMetadata,
    updateTabTitle,
    tabs,
    unregisterEditor,
  };
}
