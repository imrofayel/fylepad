<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import EditorLinkPopover from "./EditorLinkPopover.vue";
import { useEditorCompletion } from "@/composables/useEditorCompletion";
import { useEditorMathPopover } from "@/composables/useEditorMathPopover";
import { useEditorToc } from "@/composables/useEditorToc";
import { useEditor } from "@/composables/useEditor";
import { TipTapExtensions } from "@/lib/extensions";
import { suggestionMenu, buildToolbarItems, tableItems } from "@/lib/menus";
import { createEditorCustomHandlers } from "@/lib/editorCustomHandlers";

const props = defineProps<{
  tabId: string;
}>();

const editorRef = useTemplateRef("editorRef");
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
  api: "http://localhost:3008/ai",
  autoTrigger: false,
  debounce: 800,
  minAutoTriggerChars: 10,
  acceptOnTab: true,
  trapTab: true,
});

const toolBarItems = computed(() => buildToolbarItems(aiLoading.value));

const value = ref("");

const { tocAnchors, updateTocAnchors, goToTocAnchor } = useEditorToc();

const { mathPopoverOpen, mathLatex, openMathPopover, getMathReference, applyMathUpdate } =
  useEditorMathPopover();

const tipTapExtensions = TipTapExtensions({
  onTocUpdate: updateTocAnchors,
  openMathPopover,
});

const customHandlers = createEditorCustomHandlers(aiHandlers);

const shouldShowTextToolbar = ({ editor, state, view }: any) => {
  const { selection } = state;
  return view.hasFocus() && !selection.empty && !editor.isActive("table");
};

const shouldShowTableToolbar = ({ editor, view }: any) => {
  return view.hasFocus() && editor.isActive("table");
};
</script>

<template>
  <div
    class="grid grid-cols-1 gap-8"
    :class="tocAnchors.length !== 0 && 'xl:grid-cols-[minmax(0,1fr)_17rem]'"
  >
    <div>
      <EditorHead v-model="tabTitle" />
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        v-model="value"
        placeholder="Write / for commands..."
        :handlers="customHandlers"
        :extensions="[...tipTapExtensions, completionExtension]"
        class="py-2 min-h-21"
        :ui="{
          base: 'sm:px-0! text-[16.5px] w-full px-0! [&_p]:leading-normal',
        }"
      >
        <UEditorToolbar
          :editor="editor"
          :items="toolBarItems"
          layout="bubble"
          :should-show="shouldShowTextToolbar"
          :ui="{
            root: 'z-130!',
            base: 'p-0.5',
          }"
        >
          <template #link>
            <EditorLinkPopover :editor="editor" auto-open />
          </template>
        </UEditorToolbar>

        <UEditorToolbar
          :editor="editor"
          :items="[...tableItems, ...toolBarItems]"
          layout="bubble"
          :should-show="shouldShowTableToolbar"
          :ui="{
            root: 'z-120!',
            base: 'p-1',
          }"
        >
          <template #link>
            <EditorLinkPopover :editor="editor" auto-open />
          </template>
        </UEditorToolbar>

        <UPopover
          :open="mathPopoverOpen"
          :reference="getMathReference(editor)"
          :content="{ side: 'top', align: 'start', sideOffset: 8 }"
          :ui="{ content: 'p-0.5 dark:bg-neutral-800! w-84 z-120' }"
          @update:open="(value) => (mathPopoverOpen = value)"
        >
          <span class="sr-only" />

          <template #content>
            <div class="p-1.5 w-full flex flex-col space-y-2">
              <UInput
                v-model="mathLatex"
                autofocus
                placeholder="Edit LaTeX"
                :ui="{
                  base: 'w-full font-mono leading-6 bg-transparent ring- 0 focus-visible:ring-0! p-0',
                }"
                @keydown="
                  (event: KeyboardEvent) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault();
                      applyMathUpdate(editor);
                    }
                  }
                "
              />

              <div class="flex items-center justify-end gap-1">
                <UButton
                  icon="tabler:circle-check-filled"
                  color="primary"
                  size="sm"
                  :disabled="!mathLatex.trim()"
                  @click="applyMathUpdate(editor)"
                  label="Update"
                />
              </div>
            </div>
          </template>
        </UPopover>

        <UEditorSuggestionMenu :editor="editor" :items="suggestionMenu" />
      </UEditor>
    </div>

    <aside class="hidden xl:block mr-4" v-if="tocAnchors.length !== 0">
      <div class="sticky top-18 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
        <div class="px-2 dark:text-neutral-300 text-neutral-600 flex gap-1 items-center">
          <UIcon name="tabler:align-left" class="text-xl" />On this page
        </div>
        <nav class="py-2" aria-label="Table of contents">
          <UButton
            v-for="anchor in tocAnchors"
            :key="anchor.id"
            variant="link"
            color="neutral"
            size="lg"
            class="w-full transition-colors"
            :ui="{
              base: 'text-left py-1.5 text-[16.5px]',
            }"
            :class="[anchor.isActive && 'dark:text-neutral-300 text-neutral-600']"
            :style="{ paddingLeft: `${Math.max(anchor.level - 1, 0) * 0.8 + 0.5}rem` }"
            @click="goToTocAnchor(anchor)"
          >
            {{ anchor.textContent || "Untitled heading" }}
          </UButton>
        </nav>
      </div>
    </aside>
  </div>
</template>
