<script setup lang="ts">
import type { TocAnchor } from "@/composables/useEditorToc";
import { ICONS } from "@/lib/constants/icons";

defineProps<{
  tocAnchors: TocAnchor[];
}>();

const emit = defineEmits<{
  (e: "select", anchor: TocAnchor): void;
}>();
</script>

<template>
  <aside class="hidden xl:block mr-4" v-if="tocAnchors.length !== 0">
    <div class="sticky top-18 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
      <div class="px-2 flex gap-1 text-[17px] items-center">
        <UIcon :name="ICONS.alignLeft" class="text-lg" />On this page
      </div>
      <nav class="py-2" aria-label="Table of contents">
        <UButton
          v-for="anchor in tocAnchors"
          :key="anchor.id"
          variant="link"
          color="neutral"
          size="lg"
          class="w-full transition-colors"
          :ui="{
            base: 'text-left font-normal py-1 text-[17px]',
          }"
          :style="{ paddingLeft: `${Math.max(anchor.level - 1, 0) * 0.8 + 0.5}rem` }"
          @click="emit('select', anchor)"
        >
          {{ anchor.textContent || "Untitled heading" }}
        </UButton>
      </nav>
    </div>
  </aside>
</template>
