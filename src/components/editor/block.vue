<script setup lang="ts">
import type { Editor } from "@tiptap/core";
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { useEditorCompletion } from "@/composables/useEditorCompletion";
import { useEditorMathPopover } from "@/composables/useEditorMathPopover";
import { useEditorToc } from "@/composables/useEditorToc";
import { useEditor } from "@/composables/useEditor";
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
const { getTab, registerEditor, unregisterEditor, updateTabTitle } = useEditor();

const currentTab = computed(() => getTab(props.tabId));

const tabTitle = computed({
  get: () => currentTab.value?.title ?? "Untitled",
  set: (value: string) => updateTabTitle(props.tabId, value),
});

watch(
  () => editorRef.value?.editor,
  (editor, previousEditor) => {
    if (previousEditor && previousEditor !== editor) {
      unregisterEditor(props.tabId);
    }

    if (editor) {
      registerEditor(props.tabId, editor);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  unregisterEditor(props.tabId);
});

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
  trapTab: true,
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
      ? [...tableItems, ...buildToolbarItems(isLoading.value, editor, onCustomPromptClick)]
      : editor.isActive("codeBlock")
        ? codeToolbar(editor)
        : buildToolbarItems(isLoading.value, editor, onCustomPromptClick);

const focusEditor = () => {
  editorRef.value?.editor?.commands.focus();
};
</script>

<template>
  <div
    class="grid grid-cols-1 gap-8"
    :class="tocAnchors.length !== 0 && 'xl:grid-cols-[minmax(0,1fr)_17rem]'"
  >
    <div>
      <EditorHead v-model="tabTitle" @enter="focusEditor" />
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        v-model="value"
        placeholder="Write / for commands..."
        :handlers="customHandlers"
        :extensions="[...tipTapExtensions, completionExtension]"
        class="py-2 min-h-21"
        :ui="{
          base: 'sm:px-0! text-[17.8px] w-full px-0!',
        }"
        textDirection="auto"
      >
        <UEditorToolbar
          :editor="editor"
          :items="getToolbarItems(editor)"
          layout="bubble"
          :should-show="shouldShowToolbar"
          :ui="{
            root: 'z-130!',
            base: 'p-0.5 pr-0! px-px',
            group: 'gap-0',
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
