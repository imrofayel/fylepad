<script setup lang="ts">
import { useEditor } from "@/composables/useEditor";
import { ICONS } from "@lib/constants/icons";
import { useColorMode } from "@vueuse/core";

const { value } = useColorMode();
const { activeTabId } = useEditor();
</script>
<template>
  <div class="flex items-center gap-2.5" v-if="activeTabId">
    <ButtonWithTooltip text="Search" :icon="ICONS.search" />

    <HeaderMenu :is-home="false" />
  </div>

  <div class="flex gap-2.5" v-if="!activeTabId">
    <UTooltip :text="value === 'light' ? 'Dark mode' : 'Light mode'" arrow>
      <UColorModeButton variant="link" color="neutral" />
    </UTooltip>
  </div>
</template>
