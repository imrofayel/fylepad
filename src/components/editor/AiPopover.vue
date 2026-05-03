<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";
import { useEditorCompletion } from "@/composables/useEditorCompletion";

const props = defineProps<{
  editor: Editor;
  autoOpen?: boolean;
}>();

const open = ref(false);
const prompt = ref("");
const selectedText = ref("");

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

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    applyPrompt();
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
</script>

<template>
  <UPopover v-model:open="open" :ui="{ content: 'p-0.5 dark:bg-neutral-800!' }">
    <UTooltip text="Custom Prompt" arrow>
      <UButton
        color="neutral"
        variant="ghost"
        size="md"
        :active="!disabled"
        :disabled="disabled"
        :loading="isLoading"
        @mousedown="captureSelection"
      >
        <template #leading>
          <span class="ai-gradient-icon size-5.5 shrink-0">
            <svg width="0" height="0" class="absolute">
              <defs>
                <linearGradient id="ai-icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#FFF1BF" />
                  <stop offset="47.8365%" stop-color="#EC458D" />
                  <stop offset="100%" stop-color="#474ED7" />
                </linearGradient>
              </defs>
            </svg>
            <UIcon :name="ICONS.aiText" class="size-5" />
          </span>
        </template>
      </UButton>
    </UTooltip>

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
          <div class="flex items-center mr-0.5">
            <ButtonWithTooltip
              text="Apply Prompt"
              :icon="ICONS.arrowBack"
              size="md"
              class="px-1"
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
</style>
