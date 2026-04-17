<script setup lang="ts">
import { ICONS } from "@lib/constants/icons";
import { useColorMode } from "@vueuse/core";

const { value } = useColorMode();
</script>
<template>
  <div class="flex items-center gap-2.5">
    <ButtonWithTooltip text="Command (Ctrl + K)" :icon="ICONS.command" />
    <ButtonWithTooltip text="Search (Ctrl + F)" :icon="ICONS.search" />
    <ButtonWithTooltip text="Customize" :icon="ICONS.style" />
    <UTooltip :text="value === 'light' ? 'Dark mode' : 'Light mode'" arrow>
      <UColorModeButton variant="link" color="neutral" />
    </UTooltip>
    <ButtonWithTooltip text="Menu" :icon="ICONS.menu" />
  </div>
</template>
