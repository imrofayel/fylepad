<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { useEditor } from "@/composables/useEditor";
import { useRouter } from "vue-router";

const router = useRouter();
const { closeTab, createTab, setActiveTab, tabs, activeTabId, isFocusMode } = useEditor();

const selectTab = (id: string) => {
  setActiveTab(id);
  router.replace({ path: "/editor", query: { id } });
};

const handleCreateTab = async () => {
  const note = await createTab();
  router.push({ path: "/editor", query: { id: note.id } });
};

const handleCloseTab = (id: string, event: Event) => {
  event.stopPropagation();
  closeTab(id);
  // After closing, navigate to the next active tab or home
  if (tabs.value.length > 0) {
    router.replace({ path: "/editor", query: { id: activeTabId.value } });
  } else {
    router.push("/");
  }
};
</script>

<template>
  <div
    class="flex w-full items-center justify-between gap-4 print:hidden sticky top-0 z-40 bg-default backdrop-blur-md py-1"
  >
    <div class="flex min-w-0 flex-1 items-center gap-x-3">
      <ButtonWithTooltip
        text="Home"
        variant="link"
        color="neutral"
        :icon="ICONS.home"
        @click="$router.push('/')"
        v-if="!isFocusMode"
      />
      <ButtonWithTooltip
        text="New Tab"
        variant="link"
        color="neutral"
        :icon="ICONS.newTab"
        @click="handleCreateTab"
        v-if="!isFocusMode"
      />

      <div
        class="no-scrollbar flex min-w-0 max-w-full flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap"
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
          <template #trailing v-if="!isFocusMode">
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

    <HeaderActions v-if="!isFocusMode" />
  </div>
</template>
