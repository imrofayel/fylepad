<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

const props = defineProps<{
  editor: Editor;
  autoOpen?: boolean;
}>();

const open = ref(false);

const prompt = ref("");

const disabled = computed(() => {
  if (!props.editor.isEditable) return true;
  const { selection } = props.editor.state;
  return selection.empty;
});

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
}

function applyPrompt() {
  if (!prompt.value) return;

  const aiResponse = `AI response for: ${prompt.value}`;

  props.editor.chain().focus().insertContent(aiResponse).run();
  prompt.value = "";
  open.value = false;
}
</script>

<template>
  <UPopover v-model:open="open" :ui="{ content: 'p-0.5 dark:bg-neutral-800!' }">
    <UTooltip text="Custom Prompt" arrow>
      <UButton
        :icon="ICONS.aiText"
        color="neutral"
        active-color="primary"
        variant="ghost"
        active-variant="soft"
        size="md"
        :active="!disabled"
        :disabled="disabled"
      />
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
      </UInput>
    </template>
  </UPopover>
</template>
