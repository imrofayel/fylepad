<script setup lang="ts">
import { defineAsyncComponent, computed } from "vue";
import { useEditor } from "@/composables/useEditor";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";

const EditorBlock = defineAsyncComponent(() => import("@/components/editor/block.vue"));
useAuth();
const { activeTabId, tabs, isReady, isOffline, conflictedTabs, reloadTab } = useEditor();

const isLoading = computed(() => !isReady.value);

const activeTabConflicted = computed(() => conflictedTabs.value.has(activeTabId.value));

const handleReload = async () => {
  if (!activeTabId.value) return;
  await reloadTab(activeTabId.value);
};
</script>

<template>
  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-2 px-2 bg-default">
    <!-- Offline indicator -->
    <Transition name="slide-down">
      <div
        v-if="isOffline"
        class="flex items-center justify-center gap-2 py-1.5 px-4 mb-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium"
      >
        <UIcon name="tabler:wifi-off" class="size-4" />
        <span>You're offline — changes will sync when you reconnect</span>
      </div>
    </Transition>

    <!-- Conflict banner -->
    <Transition name="slide-down">
      <div
        v-if="activeTabConflicted"
        class="flex items-center justify-between gap-2 py-2 px-4 mb-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium"
      >
        <div class="flex items-center gap-2">
          <UIcon name="tabler:alert-triangle" class="size-4" />
          <span>This note was modified on another device</span>
        </div>
        <UButton
          label="Reload note"
          size="xs"
          variant="soft"
          color="error"
          :icon="ICONS.arrowBack"
          @click="handleReload"
        />
      </div>
    </Transition>

    <AppHeader v-if="!isLoading" />

    <!-- Empty State -->
    <div v-if="tabs.length === 0" class="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <img
        src="../../src/assets/icons/icon.svg"
        alt="fylepad logo"
        class="w-16 h-16 mx-auto mb-6"
      />
    </div>

    <!-- Editor State -->
    <Suspense v-else>
      <template #default>
        <div>
          <div v-for="tab in tabs" :key="tab.id" v-show="tab.id === activeTabId">
            <EditorBlock :tab-id="tab.id" />
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
