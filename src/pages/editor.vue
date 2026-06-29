<script setup lang="ts">
import { defineAsyncComponent, computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEditor } from "@/composables/useEditor";
import { useAuth } from "@/composables/useAuth";
import { useAISettings } from "@/composables/useAISettings";
import { useIsMobile } from "@/composables/useIsMobile";
import { isCloudMode } from "@/lib/editorDb";
import { ICONS } from "@/lib/constants/icons";
import { loadNotesByIds } from "@/lib/notesDb";

const EditorBlock = defineAsyncComponent(() => import("@/components/editor/block.vue"));

const route = useRoute();
const router = useRouter();
const { initialized, user } = useAuth();
const aiSettings = useAISettings();
const { isMobile } = useIsMobile();
const cloudMode = isCloudMode();

const {
  activeTabId,
  tabs,
  isReady,
  isOffline,
  conflictedTabs,
  reloadTab,
  openNote,
  createTab,
  initializeEditorStore,
  isFocusMode,
  toggleFocusMode,
} = useEditor();

const noteId = computed(() => (route.query.id as string) || "");
const notFound = ref(false);
const loadingNote = ref(false);

const activeTabConflicted = computed(() => conflictedTabs.value.has(activeTabId.value));

const handleReload = async () => {
  if (!activeTabId.value) return;
  await reloadTab(activeTabId.value);
};

const handleCreateNote = async () => {
  const note = await createTab();
  router.replace({ path: "/editor", query: { id: note.id } });
};

async function openNoteById(id: string) {
  notFound.value = false;
  loadingNote.value = true;

  // Check if already open as a tab
  const existing = tabs.value.find((t) => t.id === id);
  if (existing) {
    activeTabId.value = id;
    loadingNote.value = false;
    return;
  }

  // Load the note and open it
  try {
    const notes = await loadNotesByIds([id]);
    if (notes.length > 0) {
      openNote(notes[0]);
    } else {
      notFound.value = true;
    }
  } catch (err) {
    console.error("Failed to load note:", err);
    notFound.value = true;
  } finally {
    loadingNote.value = false;
  }
}

onMounted(async () => {
  if (!initialized.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(initialized, (val) => {
        if (val) {
          unwatch();
          resolve();
        }
      });
    });
  }

  await initializeEditorStore();

  if (noteId.value) {
    // URL has ?id=xxx — open that note
    await openNoteById(noteId.value);
  } else if (tabs.value.length > 0) {
    // No id in URL but tabs exist — redirect to the first tab
    router.replace({ path: "/editor", query: { id: tabs.value[0].id } });
  }
  // else: no tabs, no id → show empty state
});

// Watch for query param changes (e.g. tab switching updates the URL)
watch(noteId, async (newId) => {
  if (!newId || !isReady.value) return;
  await openNoteById(newId);
});

// Sync browser tab title with the active note title
const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value));
watch(
  () => activeTab.value?.title,
  (title) => {
    document.title = title ? `${title}` : "Untitled";
  },
  { immediate: true },
);

onUnmounted(() => {
  document.title = "fylepad - a notepad of your dreams!";
});
</script>

<template>
  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-2 px-2 bg-default">
    <!-- Offline indicator -->
    <Transition name="slide-down">
      <div
        v-if="isOffline && cloudMode"
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

    <!-- AI Missing Key banner -->
    <Transition name="slide-down">
      <div
        v-if="!cloudMode && aiSettings.aiEnabled.value && !aiSettings.apiKey.value"
        class="flex items-center justify-between gap-2 py-2 px-4 mb-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium"
      >
        <div class="flex items-center gap-2">
          <UIcon name="tabler:key" class="size-4" />
          <span>AI features require an API key</span>
        </div>
        <UButton
          label="Settings"
          size="xs"
          variant="soft"
          color="warning"
          :icon="ICONS.settings"
          @click="router.push('/settings')"
        />
      </div>
    </Transition>

    <!-- AI Error banner -->
    <Transition name="slide-down">
      <div
        v-if="aiSettings.aiError.value"
        class="flex items-center justify-between gap-2 py-2 px-4 mb-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium"
      >
        <div class="flex items-center gap-2">
          <UIcon name="tabler:alert-triangle" class="size-4" />
          <span>{{ aiSettings.aiError.value }}</span>
        </div>
        <UButton
          label="Dismiss"
          size="xs"
          variant="soft"
          color="error"
          :icon="ICONS.close"
          @click="aiSettings.clearError()"
        />
      </div>
    </Transition>

    <!-- Loading State -->
    <div
      v-if="!isReady || loadingNote"
      class="flex items-center justify-center min-h-[calc(100vh-80px)]"
    >
      <UIcon :name="ICONS.loader" class="size-6 animate-spin text-neutral-400" />
    </div>

    <!-- Not Found -->
    <div
      v-else-if="notFound"
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

    <!-- Empty State: No tabs at all -->
    <div
      v-else-if="tabs.length === 0"
      class="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-4"
    >
      <img src="../../src/assets/icons/icon.svg" alt="fylepad logo" class="w-16 h-16 opacity-30" />
      <p class="text-neutral-400 text-sm">No notes open</p>
      <div class="flex gap-2">
        <UButton
          label="Create a new note"
          variant="soft"
          color="primary"
          :icon="ICONS.newTab"
          @click="handleCreateNote"
        />
        <UButton
          label="Go to Home"
          variant="soft"
          color="neutral"
          :icon="ICONS.home"
          @click="$router.push('/')"
        />
      </div>
    </div>

    <!-- Editor State -->
    <template v-else>
      <AppHeader />

      <Suspense>
        <template #default>
          <div>
            <div v-for="tab in tabs" :key="tab.id" v-show="tab.id === activeTabId">
              <EditorBlock :tab-id="tab.id" />
            </div>
          </div>
        </template>
      </Suspense>
    </template>

    <!-- Focus Mode toggle button (desktop only — mobile has it in the bottom bar) -->
    <div
      v-if="tabs.length > 0 && isReady && !notFound && !loadingNote && !isMobile"
      class="fixed bottom-3 right-4.5 z-50 print:hidden"
    >
      <ButtonWithTooltip
        :text="isFocusMode ? 'Exit focus mode' : 'Enter focus mode'"
        :icon="isFocusMode ? 'ph:x-circle-duotone' : 'ph:book-open-duotone'"
        @click="toggleFocusMode"
      />
    </div>
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
