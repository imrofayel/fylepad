<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import type { Editor } from "@tiptap/core";

const props = defineProps<{
  editor: Editor;
  open: boolean;
  latex: string;
  getReference: (editor: Editor) => HTMLElement | undefined;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:latex", value: string): void;
  (e: "apply"): void;
}>();

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    emit("apply");
  }
};
</script>

<template>
  <UPopover
    :open="open"
    :reference="props.getReference(props.editor)"
    :content="{ side: 'top', align: 'start', sideOffset: 8 }"
    :ui="{ content: 'p-0.5 dark:bg-neutral-800! w-84 z-120' }"
    @update:open="(value: boolean) => emit('update:open', value)"
  >
    <span class="sr-only" />

    <template #content>
      <div class="p-1.5 w-full flex flex-col space-y-2">
        <UInput
          :model-value="latex"
          autofocus
          placeholder="Edit LaTeX"
          :ui="{
            base: 'w-full font-mono leading-6 bg-transparent ring- 0 focus-visible:ring-0! p-0',
          }"
          @update:model-value="(value: string) => emit('update:latex', value)"
          @keydown="handleKeydown"
        />

        <div class="flex items-center justify-end gap-1">
          <UButton
            :icon="ICONS.circleCheck"
            color="primary"
            size="sm"
            :disabled="!latex.trim()"
            @click="emit('apply')"
            label="Update"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
