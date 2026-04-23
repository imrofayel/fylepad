import type { Editor } from "@tiptap/vue-3";
import { computed, markRaw, ref, shallowReactive } from "vue";

export type EditorTab = {
  id: string;
  title: string;
  icon: string;
};

const tabs = ref<EditorTab[]>([
  { id: "wabi-sabi", title: "Wabi Sabi", icon: "tabler:border-radius" },
  { id: "notes", title: "Notes", icon: "tabler:border-outer" },
]);

const activeTabId = ref(tabs.value[1]?.id ?? tabs.value[0]?.id ?? "");
const editors = shallowReactive(new Map<string, Editor>());

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
    editors,
    getEditor,
    registerEditor,
    setActiveTab,
    tabs,
    unregisterEditor,
  };
}
