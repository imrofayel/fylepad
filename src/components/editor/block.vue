<script setup lang="ts">
import type { Editor } from "@tiptap/core";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useEditorCompletion } from "@/composables/useEditorCompletion";
import { useAISettings } from "@/composables/useAISettings";
import { useEditorMathPopover } from "@/composables/useEditorMathPopover";
import { useEditorToc } from "@/composables/useEditorToc";
import { useEditor } from "@/composables/useEditor";
import { useIsMobile } from "@/composables/useIsMobile";
import { ICONS } from "@/lib/constants/icons";
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

const characterCount = ref(0);
const wordCount = ref(0);

const editorRef = useTemplateRef<{ editor: Editor | undefined }>("editorRef");
const {
  getTab,
  registerEditor,
  unregisterEditor,
  updateTabContent,
  updateTabMetadata,
  updateTabTitle,
  isFocusMode,
  toggleFocusMode,
} = useEditor();
const aiSettings = useAISettings();
const { isMobile } = useIsMobile();

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
      characterCount.value = editor.storage.characterCount.characters();
      wordCount.value = editor.storage.characterCount.words();
    };

    editor.on("update", handleUpdate);
    registerEditor(props.tabId, editor);

    // Set initial values
    characterCount.value = editor.storage.characterCount.characters();
    wordCount.value = editor.storage.characterCount.words();

    onCleanup(() => {
      editor.off("update", handleUpdate);
      unregisterEditor(props.tabId);
    });
  },
  { immediate: true },
);

watch(
  [() => editorRef.value?.editor, isFocusMode],
  ([editor, focusMode]) => {
    if (editor) {
      editor.setEditable(!focusMode);
    }
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
    :class="
      !isFocusMode && tocAnchors.length !== 0 && 'xl:grid-cols-[minmax(0,1fr)_18rem] max-w-5xl!'
    "
  >
    <div>
      <EditorHead
        v-model="tabTitle"
        :folder-label="currentTab?.collectionName"
        :readonly="isFocusMode"
        @enter="focusEditor"
      />

      <EditorTocSidebar
        v-if="isMobile && !isFocusMode"
        :toc-anchors="tocAnchors"
        :is-mobile="true"
        @select="goToTocAnchor"
      />
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        v-model="value"
        placeholder="Write / for commands..."
        :handlers="customHandlers"
        :extensions="editorExtensions"
        :class="['py-2 min-h-21', isMobile && 'pb-20']"
        :ui="{
          base: 'sm:px-0! cursor-auto! text-[17.5px] w-full px-0!',
        }"
        textDirection="auto"
      >
        <!-- Desktop: bubble toolbar near selection -->
        <UEditorToolbar
          v-if="!isFocusMode && !isMobile"
          :editor="editor"
          :items="getToolbarItems(editor)"
          layout="bubble"
          :should-show="shouldShowToolbar"
          :ui="{
            root: 'z-130!',
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

        <!-- Mobile: unified fixed bottom bar -->
        <Teleport to="body">
          <div
            v-if="isMobile && !isFocusMode"
            class="mobile-bottom-bar border-neutral-300! dark:border-neutral-600! bg-neutral-100! dark:bg-neutral-700!"
          >
            <div class="mobile-bottom-bar-inner w-full justify-between items-center">
              <UEditorToolbar
                :editor="editor"
                :items="getToolbarItems(editor)"
                layout="fixed"
                :ui="{
                  root: 'w-full!',
                  base: 'p-0! gap-0.5 justify-start overflow-x-auto scrollbar-none flex-nowrap',
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
                    @update:loading="
                      (val: boolean | undefined) => (aiPopoverLoading = val ?? false)
                    "
                    auto-open
                  />
                </template>
              </UEditorToolbar>

              <UButton
                :icon="isFocusMode ? 'ph:x-circle-duotone' : 'ph:book-open-duotone'"
                variant="ghost"
                color="neutral"
                size="md"
                class="shrink-0"
                @click="toggleFocusMode"
              />
            </div>
          </div>
        </Teleport>

        <EditorMathPopover
          v-if="!isFocusMode"
          :editor="editor"
          :open="mathPopoverOpen"
          :latex="mathLatex"
          :get-reference="getMathReference"
          @update:open="(value: boolean) => (mathPopoverOpen = value)"
          @update:latex="(value: string) => (mathLatex = value)"
          @apply="applyMathUpdate(editor)"
        />

        <UEditorSuggestionMenu v-if="!isFocusMode" :editor="editor" :items="suggestionMenu" />
      </UEditor>
    </div>

    <EditorTocSidebar v-if="!isFocusMode" :toc-anchors="tocAnchors" @select="goToTocAnchor" />
  </div>
</template>

<style scoped>
.mobile-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 130;
  background: var(--color-white);
  border-top: 1px solid var(--color-neutral-200);
  padding: 4px 6px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
  print-color-adjust: exact;
}

:root.dark .mobile-bottom-bar {
  background: var(--color-neutral-900);
  border-top-color: var(--color-neutral-700);
}

.mobile-bottom-bar-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.mobile-bottom-bar-divider {
  width: 1px;
  height: 24px;
  flex-shrink: 0;
  background: var(--color-neutral-200);
  margin: 0 2px;
}

:root.dark .mobile-bottom-bar-divider {
  background: var(--color-neutral-700);
}

@media print {
  .mobile-bottom-bar {
    display: none;
  }
}
</style>
