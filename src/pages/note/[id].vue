<script setup lang="ts">
import { defineAsyncComponent, computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEditor } from "@/composables/useEditor";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import { loadNotesByIds } from "@/lib/notesDb";

const EditorBlock = defineAsyncComponent(() => import("@/components/editor/block.vue"));

const route = useRoute();
const router = useRouter();
useAuth();
const {
  activeTabId,
  tabs,
  isReady,
  isOffline,
  conflictedTabs,
  reloadTab,
  openNote,
  closeTab,
  createTab,
  setActiveTab,
  initializeEditorStore,
} = useEditor();

const noteId = computed(() => route.params.id as string);
const notFound = ref(false);

const activeTabConflicted = computed(() => conflictedTabs.value.has(activeTabId.value));

const handleReload = async () => {
  if (!activeTabId.value) return;
  await reloadTab(activeTabId.value);
};

onMounted(async () => {
  // Ensure editor store is initialized
  await initializeEditorStore();

  // Check if this note is already open as a tab
  const existing = tabs.value.find((t) => t.id === noteId.value);
  if (existing) {
    activeTabId.value = noteId.value;
    return;
  }

  // Load the note and open it
  try {
    const notes = await loadNotesByIds([noteId.value]);
    if (notes.length > 0) {
      openNote(notes[0]);
    } else {
      notFound.value = true;
    }
  } catch (err) {
    console.error("Failed to load note:", err);
    notFound.value = true;
  }
});
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

    <AppHeader v-if="!notFound" />

    <!-- Not Found -->
    <div
      v-if="notFound"
      class="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-4"
    >
      <UIcon name="tabler:file-off" class="size-10 text-neutral-300 dark:text-neutral-600" />
      <p class="text-neutral-400 text-sm">Note not found or has been deleted</p>
      <UButton
        label="Go to Home"
        variant="soft"
        color="neutral"
        :icon="ICONS.home"
        @click="router.push('/')"
      />
    </div>

    <!-- Loading -->
    <div v-else-if="!isReady" class="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <UIcon :name="ICONS.loader" class="size-6 text-neutral-400" />
    </div>

    <!-- Editor -->
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
