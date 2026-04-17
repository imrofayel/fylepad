<script setup lang="ts">
import { ref } from "vue";
import { ICONS } from "@/lib/constants/icons";

type Tab = {
  id: string;
  title: string;
  icon: string;
  selected: boolean;
};

const tabs = ref<Tab[]>([
  { id: "wabi-sabi", title: "Wabi Sabi", icon: "tabler:border-radius", selected: false },
  { id: "notes", title: "Notes", icon: "tabler:border-outer", selected: true },
]);

const selectTab = (id: string) => {
  tabs.value = tabs.value.map((tab) => ({
    ...tab,
    selected: tab.id === id,
  }));
};
</script>

<template>
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-2.5">
      <ButtonWithTooltip text="New Tab" variant="link" color="neutral" :icon="ICONS.newTab" />

      <div class="flex gap-2 z-100">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.title"
          :variant="tab.selected ? 'solid' : 'outline'"
          :color="tab.selected ? 'primary' : 'neutral'"
          :icon="tab.icon"
          class="group text-[15.3px] relative"
          :ui="{
            base: [
              tab.selected
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
              class="hidden px-0 group-hover:block duration-200 transition-all absolute right-2"
              :class="tab.selected && 'text-inverted hover:text-inverted!'"
              :ui="{ leadingIcon: 'size-3.5!' }"
            />
          </template>
        </UButton>
      </div>
    </div>

    <HeaderActions />
  </div>
</template>
