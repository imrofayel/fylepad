<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { useEditor } from "@/composables/useEditor";

const { activeTabId, createTab, setActiveTab, tabs } = useEditor();

const selectTab = (id: string) => {
  setActiveTab(id);
};
</script>

<template>
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-2.5">
      <ButtonWithTooltip
        text="New Tab"
        variant="link"
        color="neutral"
        :icon="ICONS.newTab"
        @click="createTab"
      />

      <div class="flex gap-2 z-10">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.title"
          :variant="tab.id === activeTabId ? 'solid' : 'outline'"
          :color="tab.id === activeTabId ? 'primary' : 'neutral'"
          :icon="tab.icon"
          class="group text-[15.3px] relative"
          :ui="{
            base: [
              tab.id === activeTabId
                ? 'hover:pr-7! py-0.5!'
                : 'dark:bg-neutral-800! hover:opacity-80! bg-neutral-50! hover:pr-7! py-0.5!',
              'duration-300 transition-all',
            ],
          }"
          @click="selectTab(tab.id)"
        >
          <template #trailing>
            <UButton
              icon="tabler:x"
              size="xs"
              variant="link"
              color="neutral"
              class="opacity-0 group-hover:opacity-100 transition-all duration-200 delay-150 absolute right-2"
              :class="tab.id === activeTabId && 'text-inverted hover:text-inverted!'"
              :ui="{ leadingIcon: 'size-3.5!' }"
            />
          </template>
        </UButton>
      </div>
    </div>

    <HeaderActions />
  </div>
</template>
