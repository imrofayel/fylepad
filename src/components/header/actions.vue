<script setup lang="ts">
import { ICONS } from "@lib/constants/icons";
import { defineAsyncComponent } from "vue";
import { useColorMode } from "@vueuse/core";

const { value } = useColorMode();

const EditorCustomize = defineAsyncComponent(() => import("@/components/editor/customize.vue"));
</script>
<template>
  <div class="flex items-center gap-2.5">
    <ButtonWithTooltip text="Command (Ctrl + K)" :icon="ICONS.command" />
    <ButtonWithTooltip text="Search (Ctrl + F)" :icon="ICONS.search" />
    <EditorCustomize />
    <UTooltip :text="value === 'light' ? 'Dark mode' : 'Light mode'" arrow>
      <UColorModeButton variant="link" color="neutral" />
    </UTooltip>
    <HeaderMenu />
  </div>
</template>
