<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { useEditor } from "@/composables/useEditor";

const { closeTab, createTab, setActiveTab, tabs } = useEditor();

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
    <div class="flex gap-x-2 itetabler:mood-happyms-center">
      <ButtonWithTooltip
        text="New Tab"
        variant="link"
        color="neutral"
        :icon="ICONS.newTab"
        @click="createTab"
      />

      <div class="flex gap-x-1 z-10">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.title"
          variant="outline"
          class="text-[17px] relative"
          :ui="{
            base: ['py-0 px-2 font-normal'],
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
