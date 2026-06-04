<script setup lang="ts">
import type { Editor } from "@tiptap/core";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useEditorCompletion } from "@/composables/useEditorCompletion";
import { useAISettings } from "@/composables/useAISettings";
import { useEditorMathPopover } from "@/composables/useEditorMathPopover";
import { useEditorToc } from "@/composables/useEditorToc";
import { useEditor } from "@/composables/useEditor";
import { EMPTY_DOC } from "@/lib/editorDb";
import { TipTapExtensions } from "@/lib/extensions";
import {
  suggestionMenu,
  buildToolbarItems,
  tableItems,
  imageToolbar,
  codeToolbar,
} from "@/lib/menus";
import { createEditorCustomHandlers } from "@/lib/editorCustomHandlers";

const props = defineProps<{
  tabId: string;
}>();

const editorRef = useTemplateRef<{ editor: Editor | undefined }>("editorRef");
const {
  getTab,
  registerEditor,
  unregisterEditor,
  updateTabContent,
  updateTabMetadata,
  updateTabTitle,
} = useEditor();
const aiSettings = useAISettings();

const currentTab = computed(() => getTab(props.tabId));

const tabTitle = computed({
  get: () => currentTab.value?.title ?? "Untitled",
  set: (value: string) => updateTabTitle(props.tabId, value),
});

watch(
  () => editorRef.value?.editor,
  (editor, previousEditor, onCleanup) => {
    if (previousEditor && previousEditor !== editor) {
      unregisterEditor(props.tabId);
    }

    if (!editor) {
      return;
    }

    const tab = currentTab.value;

    if (tab) {
      if (tab.metadata && (tab.metadata as any).rawMarkdown) {
        // Hydrate markdown string into the editor using the markdown extension
        const raw = (tab.metadata as any).rawMarkdown as string;
        editor.commands.setContent(raw, { emitUpdate: false });

        // Update the stored JSON content in DB and clear the rawMarkdown marker
        updateTabContent(props.tabId, editor.getJSON());
        const newMeta = { ...tab.metadata } as Record<string, unknown>;
        delete newMeta.rawMarkdown;
        updateTabMetadata(props.tabId, newMeta as any);
      } else {
        editor.commands.setContent(tab.content ?? EMPTY_DOC, { emitUpdate: false });
      }
    }

    const handleUpdate = () => {
      updateTabContent(props.tabId, editor.getJSON());
    };

    editor.on("update", handleUpdate);
    registerEditor(props.tabId, editor);

    onCleanup(() => {
      editor.off("update", handleUpdate);
      unregisterEditor(props.tabId);
    });
  },
  { immediate: true },
);

const {
  extension: completionExtension,
  handlers: aiHandlers,
  isLoading: aiLoading,
} = useEditorCompletion(editorRef, {
  api: import.meta.env.VITE_AI_BACKEND_API,
  autoTrigger: false,
  debounce: 800,
  minAutoTriggerChars: 10,
  acceptOnTab: true,
  trapTab: false,
});

const value = ref("");

const aiPopoverOpen = ref(false);

const { tocAnchors, updateTocAnchors, goToTocAnchor } = useEditorToc();

const { mathPopoverOpen, mathLatex, openMathPopover, getMathReference, applyMathUpdate } =
  useEditorMathPopover();

const tipTapExtensions = TipTapExtensions({
  onTocUpdate: updateTocAnchors,
  openMathPopover,
});

const customHandlers = createEditorCustomHandlers(aiHandlers);

const showAiActions = computed(() => aiSettings.isConfigured.value);

const onCustomPromptClick = () => {
  nextTick(() => {
    aiPopoverOpen.value = true;
  });
};

const handleAiPopoverOpenUpdate = (value: boolean) => {
  aiPopoverOpen.value = value;
};

const shouldShowToolbar = ({ editor, state, view }: any) => {
  const { selection } = state;

  if (aiPopoverOpen.value) return true;

  return (
    view.hasFocus() &&
    (editor.isActive("table") ||
      editor.isActive("codeBlock") ||
      !selection.empty ||
      editor.isActive("image"))
  );
};

const aiPopoverLoading = ref(false);

const isLoading = computed(() => aiLoading.value || aiPopoverLoading.value);

const getToolbarItems = (editor: any) =>
  editor.isActive("image")
    ? imageToolbar(editor)
    : editor.isActive("table")
      ? [
          ...tableItems,
          ...buildToolbarItems(isLoading.value, editor, onCustomPromptClick, showAiActions.value),
        ]
      : editor.isActive("codeBlock")
        ? codeToolbar(editor)
        : buildToolbarItems(isLoading.value, editor, onCustomPromptClick, showAiActions.value);

const editorExtensions = computed(() => [...tipTapExtensions, completionExtension]);

const focusEditor = () => {
  editorRef.value?.editor?.commands.focus();
};
</script>

<template>
  <div
    class="grid grid-cols-1 gap-16 max-w-3xl mx-auto"
    :class="tocAnchors.length !== 0 && 'xl:grid-cols-[minmax(0,1fr)_18rem] max-w-5xl!'"
  >
    <div>
      <EditorHead
        v-model="tabTitle"
        :folder-label="currentTab?.collectionName"
        @enter="focusEditor"
      />
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        v-model="value"
        placeholder="Write / for commands..."
        :handlers="customHandlers"
        :extensions="editorExtensions"
        class="py-2 min-h-21"
        :ui="{
          base: 'sm:px-0! cursor-auto! text-[17.5px] w-full px-0!',
        }"
        textDirection="auto"
      >
        <UEditorToolbar
          :editor="editor"
          :items="getToolbarItems(editor)"
          layout="bubble"
          :should-show="shouldShowToolbar"
          :ui="{
            root: 'z-130! blur-[0.01px]',
            base: 'p-px rounded-sm dark:bg-neutral-800! pr-0! gap-1 pl-px',
            group: '[&>button]:dark:hover:bg-neutral-700!',
            separator: 'dark:bg-neutral-700!',
          }"
        >
          <template #link>
            <EditorLinkPopover :editor="editor" auto-open />
          </template>
          <template #codeLanguage>
            <EditorCodePopover :editor="editor" />
          </template>
          <template #prompt>
            <EditorAiPopover
              :editor="editor"
              :open="aiPopoverOpen"
              @update:open="handleAiPopoverOpenUpdate"
              @update:loading="(val: boolean | undefined) => (aiPopoverLoading = val ?? false)"
              auto-open
            />
          </template>
        </UEditorToolbar>

        <EditorMathPopover
          :editor="editor"
          :open="mathPopoverOpen"
          :latex="mathLatex"
          :get-reference="getMathReference"
          @update:open="(value: boolean) => (mathPopoverOpen = value)"
          @update:latex="(value: string) => (mathLatex = value)"
          @apply="applyMathUpdate(editor)"
        />

        <UEditorSuggestionMenu :editor="editor" :items="suggestionMenu" />
      </UEditor>
    </div>

    <EditorTocSidebar :toc-anchors="tocAnchors" @select="goToTocAnchor" />
  </div>
</template>
