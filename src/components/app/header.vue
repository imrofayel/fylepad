<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { useEditor } from "@/composables/useEditor";

const { activeTabId, closeTab, createTab, setActiveTab, tabs } = useEditor();

const selectTab = (id: string) => {
  setActiveTab(id);
};

const handleCloseTab = (id: string, event: Event) => {
  event.stopPropagation();
  closeTab(id);
};
</script>

<template>
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-2.5 items-center">
      <img src="../../assets/icons/icon.svg" alt="fylepad logo" class="w-6 h-6" />
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
          class="group text-[15.3px] relative"
          :ui="{
            base: [
              'py-1! px-2 hover:pr-7!',
              tab.id === activeTabId ? '' : 'dark:bg-neutral-800! hover:opacity-80! bg-neutral-50!',
              'duration-300 transition-all',
            ],
          }"
          @click="selectTab(tab.id)"
        >
          <template #trailing>
            <UButton
              :icon="ICONS.close"
              size="xs"
              variant="link"
              color="neutral"
              class="opacity-0 group-hover:opacity-100 transition-all duration-200 delay-150 absolute right-2"
              :class="tab.id === activeTabId && 'text-inverted hover:text-inverted!'"
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
