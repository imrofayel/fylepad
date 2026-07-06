<script setup lang="ts">
import type { TocAnchor } from "@/composables/useEditorToc";
import { ICONS } from "@/lib/constants/icons";

defineProps<{
  tocAnchors: TocAnchor[];
  isMobile?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", anchor: TocAnchor): void;
}>();
</script>

<template>
  <template v-if="tocAnchors.length !== 0">
    <div
      v-if="isMobile"
      class="bg-neutral-100 dark:bg-neutral-700 mt-2 mb-2 border-neutral-200 dark:border-neutral-700 rounded-sm overflow-hidden"
    >
      <details class="group">
        <summary
          class="flex items-center justify-between px-3 py-2 cursor-pointer text-[15.5px] font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors list-none [&::-webkit-details-marker]:hidden"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="ICONS.alignLeft" class="text-xl" />
            On this page
          </div>
          <UIcon
            name="ph:caret-down"
            class="text-neutral-500 transition-transform group-open:rotate-180"
          />
        </summary>
        <nav class="py-2 px-1 max-h-[300px] overflow-y-auto" aria-label="Table of contents">
          <UButton
            v-for="anchor in tocAnchors"
            :key="anchor.id"
            variant="link"
            color="neutral"
            size="md"
            class="w-full transition-colors"
            :ui="{
              base: 'text-left font-normal py-1.5 text-[16.5px]',
            }"
            :style="{ paddingLeft: `${Math.max(anchor.level - 1, 0) * 0.8 + 0.5}rem` }"
            @click="emit('select', anchor)"
          >
            {{ anchor.textContent || "Untitled heading" }}
          </UButton>
        </nav>
      </details>
    </div>

    <aside v-else class="hidden xl:block mr-4">
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
              base: 'text-left font-normal py-1 text-[16.5px]',
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
</template>
