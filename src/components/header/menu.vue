<script setup lang="ts">
import { ICONS } from "@lib/constants/icons";
</script>
<template>
  <UPopover arrow>
    <ButtonWithTooltip text="Menu" :icon="ICONS.menu" />

    <template #content>
      <div class="flex flex-col p-0.5 py-1 gap-0.5 w-42">
        <UButton
          label="Save file"
          variant="link"
          color="neutral"
          icon="tabler:markdown"
          class="p-2 py-1.5"
        />

        <UButton
          label="Open (Ctrl + O)"
          variant="link"
          color="neutral"
          icon="tabler:folder-open"
          class="p-2 py-1.5"
        />

        <UButton
          label="About"
          variant="link"
          color="neutral"
          icon="tabler:info-circle"
          class="p-2 py-1.5"
        />
      </div>
    </template>
  </UPopover>
</template>
