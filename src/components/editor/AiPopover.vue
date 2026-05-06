<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import type { Editor } from "@tiptap/vue-3";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useEditorCompletion } from "@/composables/useEditorCompletion";

const props = defineProps<{
  editor: Editor;
  autoOpen?: boolean;
  open?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:open", value: boolean): void;
  (event: "update:loading", value: boolean | undefined): void;
}>();

const internalOpen = ref(false);
const prompt = ref("");
const selectedText = ref("");

const open = computed({
  get: () => props.open ?? internalOpen.value,
  set: (value: boolean) => {
    if (props.open === undefined) {
      internalOpen.value = value;
      return;
    }

    emit("update:open", value);
  },
});

const editorRefProxy = computed(() => ({
  editor: props.editor,
}));

const { handlers: aiHandlers, isLoading } = useEditorCompletion(ref(editorRefProxy), {
  api: import.meta.env.VITE_AI_BACKEND_API,
});

const disabled = computed(() => {
  if (!props.editor.isEditable) return true;
  const { selection } = props.editor.state;
  return selection.empty;
});

function captureSelection() {
  const { selection } = props.editor.state;
  if (selection.empty) {
    selectedText.value = "";
    return;
  }

  selectedText.value = props.editor.state.doc.textBetween(selection.from, selection.to);
}

// manual outside-click handler since we use :dismissible="false"
function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement;
  if (target.closest(".ai-popover-content")) return;
  if (target.closest(".ai-popover-trigger")) return;
  open.value = false;
}

watch(open, (isOpen) => {
  if (isOpen) {
    if (!selectedText.value) {
      captureSelection();
    }
    // add listener after current event cycle so it doesn't catch the opening click
    requestAnimationFrame(() => {
      document.addEventListener("pointerdown", onDocumentPointerDown);
    });
  } else {
    document.removeEventListener("pointerdown", onDocumentPointerDown);
    selectedText.value = "";
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
});

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    applyPrompt();
  }
  if (event.key === "Escape") {
    open.value = false;
  }
}

function applyPrompt() {
  if (!prompt.value) return;

  const userPrompt = prompt.value;
  prompt.value = "";
  open.value = false;
  aiHandlers.aiCustom.execute(props.editor, {
    prompt: `USER PROMPT: ${userPrompt}\n\n ORIGINAL TEXT ${selectedText.value}`.trim(),
  });
  selectedText.value = "";
}

watch(isLoading, (val: boolean | undefined) => {
  emit("update:loading", val);
});
</script>

<template>
  <UPopover
    v-model:open="open"
    :dismissible="false"
    :ui="{ content: 'p-px py-0.5 dark:bg-neutral-800! mt-1 ai-popover-content' }"
  >
    <span class="ai-popover-trigger">
      <UButton
        color="neutral"
        variant="ghost"
        class="p-0"
        size="xs"
        :active="!disabled"
        :disabled="disabled"
        @mousedown="captureSelection"
      />
    </span>

    <template #content>
      <UInput
        v-model="prompt"
        autofocus
        name="prompt"
        type="text"
        variant="none"
        placeholder="Enter a prompt..."
        :ui="{
          base: 'focus-visible:ring-0!',
        }"
        @keydown="handleKeyDown"
      >
        <template #trailing>
          <div class="flex items-center">
            <ButtonWithTooltip
              text="Apply Prompt"
              :icon="ICONS.arrowBack"
              size="md"
              :disabled="!prompt"
              title="Apply prompt"
              @click="applyPrompt"
            />
          </div>
        </template>
      </UInput>
    </template>
  </UPopover>
</template>

<style scoped>
.ai-gradient-icon :deep(svg path) {
  fill: url(#ai-icon-gradient);
}

.ai-gradient-icon :deep(svg path),
.ai-gradient-icon :deep(svg circle),
.ai-gradient-icon :deep(svg rect) {
  fill: url(#ai-icon-gradient) !important;
}
</style>
