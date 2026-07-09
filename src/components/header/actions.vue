<script setup lang="ts">
import { useEditor } from "@/composables/useEditor";
import { ICONS } from "@lib/constants/icons";
import { useColorMode } from "@vueuse/core";

const { value } = useColorMode();
const { activeTabId, toggleSearch, isSearchOpen } = useEditor();
import SearchBar from "@/components/editor/SearchBar.vue";
import { onMounted, onBeforeUnmount } from "vue";

function handleShortcut(event: KeyboardEvent) {
  const isModifierPressed = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (!isModifierPressed) return;

  if (key === "f") {
    event.preventDefault();
    isSearchOpen.value = !isSearchOpen.value;
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleShortcut);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleShortcut);
});
</script>
<template>
  <div class="flex items-center gap-2.5" v-if="activeTabId">
    <UPopover
      v-model:open="isSearchOpen"
      arrow
      :ui="{
        content: 'bg-neutral-100 dark:bg-neutral-800!',
        arrow: 'fill-neutral-100! dark:fill-neutral-800!',
      }"
    >
      <ButtonWithTooltip text="Search" :icon="ICONS.search" />
      <template #content>
        <SearchBar />
      </template>
    </UPopover>

    <HeaderMenu :is-home="false" />
  </div>

  <div class="flex gap-2.5" v-if="!activeTabId">
    <UTooltip :text="value === 'light' ? 'Dark mode' : 'Light mode'" arrow>
      <UColorModeButton variant="link" color="neutral" />
    </UTooltip>
  </div>
</template>
