<script setup lang="ts">
import { useEditor } from "@/composables/useEditor";
import { ICONS } from "@lib/constants/icons";
import { useColorMode } from "@vueuse/core";

const color = useColorMode();
const { openFileDialog, saveActiveToDisk } = useEditor();
</script>
<template>
  <UPopover
    arrow
    :ui="{
      content: 'dark:bg-neutral-800!',
      arrow: 'dark:fill-neutral-800!',
    }"
  >
    <ButtonWithTooltip text="Menu" :icon="ICONS.menu" />

    <template #content>
      <div class="flex flex-col p-0.5 py-1 gap-0.5 w-42">
        <UButton
          label="Save file (Ctrl + S)"
          variant="link"
          color="neutral"
          :icon="ICONS.markdown"
          class="p-2 py-1.5"
          @click="saveActiveToDisk"
        />

        <UButton
          label="Open (Ctrl + O)"
          variant="link"
          color="neutral"
          :icon="ICONS.folderOpen"
          class="p-2 py-1.5"
          @click="openFileDialog"
        />

        <UColorModeButton
          variant="link"
          color="neutral"
          :label="color === 'light' ? 'Dark mode' : 'Light mode'"
          class="p-2 py-1.5"
        />

        <UButton
          label="About"
          variant="link"
          color="neutral"
          :icon="ICONS.info"
          class="p-2 py-1.5"
        />
      </div>
    </template>
  </UPopover>
</template>
