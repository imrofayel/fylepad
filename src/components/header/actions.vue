<script setup lang="ts">
import { useEditor } from "@/composables/useEditor";
import { ICONS } from "@lib/constants/icons";
import { useColorMode } from "@vueuse/core";

const { value } = useColorMode();
const { activeTabId } = useEditor();
</script>
<template>
  <div class="flex items-center gap-2.5" v-if="activeTabId">
    <EmojiPicker />
    <EditorCustomize />
    <ButtonWithTooltip text="Search (Ctrl + F)" :icon="ICONS.search" />

    <HeaderMenu />
  </div>

  <UTooltip :text="value === 'light' ? 'Dark mode' : 'Light mode'" arrow v-if="!activeTabId">
    <UColorModeButton variant="link" color="neutral" />
  </UTooltip>
</template>
