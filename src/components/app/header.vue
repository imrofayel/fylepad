<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { useEditor } from "@/composables/useEditor";

const { closeTab, createTab, setActiveTab, tabs, activeTabId } = useEditor();

const selectTab = (id: string) => {
  setActiveTab(id);
};

const handleCloseTab = (id: string, event: Event) => {
  event.stopPropagation();
  closeTab(id);
};
</script>

<template>
  <div class="flex w-full items-center justify-between gap-4">
    <div class="flex min-w-0 flex-1 items-center gap-x-2">
      <ButtonWithTooltip
        text="New Tab"
        variant="link"
        color="neutral"
        :icon="ICONS.newTab"
        @click="createTab"
      />

      <div
        class="no-scrollbar flex min-w-0 max-w-full flex-1 gap-x-1 overflow-x-auto overflow-y-hidden whitespace-nowrap"
      >
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.title"
          variant="link"
          class="relative shrink-0 whitespace-nowrap text-[17px]"
          :ui="{
            base: [
              'shrink-0 whitespace-nowrap py-0 px-2 font-normal',
              activeTabId === tab.id && 'bg-neutral-100 dark:bg-neutral-800!',
            ],
          }"
          @click="selectTab(tab.id)"
        >
          <template #trailing>
            <ButtonWithTooltip
              text="Close"
              :icon="ICONS.close"
              size="xs"
              variant="link"
              color="neutral"
              :ui="{ leadingIcon: 'size-3.5!' }"
              @click="handleCloseTab(tab.id, $event)"
            />
          </template>
        </UButton>
      </div>
    </div>

    <HeaderActions />
  </div>
</template>
