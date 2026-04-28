import type { Editor } from "@tiptap/core";
import { computed, markRaw, ref, shallowReactive } from "vue";

export type EditorTab = {
  id: string;
  title: string;
};

const tabs = ref<EditorTab[]>([{ id: "notes", title: "Untitled" }]);
let tabCounter = 1;

const activeTabId = ref(tabs.value[0]?.id ?? "");
const editors = shallowReactive(new Map<string, Editor>());

const getTab = (tabId: string) => tabs.value.find((tab) => tab.id === tabId);

const updateTabTitle = (tabId: string, title: string) => {
  const tab = getTab(tabId);

  if (!tab) {
    return;
  }

  tab.title = title.trim() || "Untitled";
};

const createTab = () => {
  let id = `tab-${tabCounter}`;

  while (tabs.value.some((tab) => tab.id === id)) {
    tabCounter += 1;
    id = `tab-${tabCounter}`;
  }

  tabCounter += 1;

  const tab: EditorTab = {
    id,
    title: "Untitled",
  };

  tabs.value = [...tabs.value, tab];
  activeTabId.value = tab.id;

  return tab;
};

const closeTab = (tabId: string) => {
  const index = tabs.value.findIndex((tab) => tab.id === tabId);

  if (index === -1) {
    return;
  }

  tabs.value = tabs.value.filter((tab) => tab.id !== tabId);

  editors.delete(tabId);

  if (activeTabId.value === tabId) {
    if (tabs.value.length > 0) {
      const nextIndex = Math.min(index, tabs.value.length - 1);
      activeTabId.value = tabs.value[nextIndex].id;
    } else {
      activeTabId.value = "";
    }
  }
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
    activeTabId.value = tabId;
  };

  return {
    activeEditor,
    activeTabId,
    closeTab,
    createTab,
    editors,
    getEditor,
    getTab,
    registerEditor,
    setActiveTab,
    updateTabTitle,
    tabs,
    unregisterEditor,
  };
}
