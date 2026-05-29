<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useNotes } from "@/composables/useNotes";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";

const { initialized, user } = useAuth();
const {
  trashedNotes,
  loading,
  syncing,
  refreshTrash,
  restoreNotes,
  permanentlyDeleteNotes,
  emptyTrash,
} = useNotes();

const selectedIds = ref<Set<string>>(new Set());
const confirmEmptyModal = ref(false);

const allSelected = computed(
  () => trashedNotes.value.length > 0 && selectedIds.value.size === trashedNotes.value.length,
);

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
  selectedIds.value = new Set(selectedIds.value);
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(trashedNotes.value.map((n) => n.id));
  }
}

async function handleRestore() {
  const ids = [...selectedIds.value];
  if (ids.length === 0) return;
  await restoreNotes(ids);
  selectedIds.value = new Set();
}

async function handlePermanentDelete() {
  const ids = [...selectedIds.value];
  if (ids.length === 0) return;
  await permanentlyDeleteNotes(ids);
  selectedIds.value = new Set();
}

async function handleEmptyTrash() {
  await emptyTrash();
  selectedIds.value = new Set();
  confirmEmptyModal.value = false;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

watch(
  [initialized, user],
  ([isInit]) => {
    if (isInit) refreshTrash();
  },
  { immediate: true },
);
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Top bar -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800"
    >
      <div class="flex items-center gap-3">
        <ButtonWithTooltip
          text="Go back"
          :icon="ICONS.arrowBackFilled"
          variant="link"
          color="neutral"
          @click="$router.push('/')"
        />
        <div class="flex items-center gap-2">
          <UIcon :name="ICONS.trash" class="size-5 text-neutral-400" />
          <h1 class="text-lg font-medium">Trash</h1>
        </div>
        <!-- Sync indicator -->
        <UTooltip v-if="syncing" text="Saving to cloud..." arrow>
          <UIcon :name="ICONS.loader" class="size-4 text-neutral-400" />
        </UTooltip>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          v-if="selectedIds.size > 0"
          label="Restore"
          :icon="ICONS.restore"
          variant="soft"
          color="neutral"
          size="sm"
          @click="handleRestore"
        />
        <UButton
          v-if="selectedIds.size > 0"
          label="Delete forever"
          :icon="ICONS.trashX"
          variant="soft"
          color="error"
          size="sm"
          @click="handlePermanentDelete"
        />
        <UButton
          v-if="trashedNotes.length > 0"
          label="Empty trash"
          :icon="ICONS.trashX"
          variant="link"
          color="error"
          size="sm"
          @click="confirmEmptyModal = true"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading || !initialized" class="flex items-center justify-center py-32">
      <UIcon :name="ICONS.loader" class="size-6 text-neutral-400" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="trashedNotes.length === 0"
      class="flex flex-col items-center justify-center py-32 gap-3"
    >
      <UIcon :name="ICONS.trash" class="size-10 text-neutral-300 dark:text-neutral-600" />
      <p class="text-neutral-400 text-sm">Trash is empty</p>
    </div>

    <!-- Trash list -->
    <div v-else class="max-w-3xl mx-auto p-4">
      <div class="flex items-center gap-3 mb-4">
        <UButton
          :label="allSelected ? 'Deselect all' : 'Select all'"
          variant="link"
          color="neutral"
          size="sm"
          @click="toggleAll"
        />
        <span class="text-xs text-neutral-400"
          >{{ trashedNotes.length }} item{{ trashedNotes.length > 1 ? "s" : "" }}</span
        >
      </div>

      <div class="flex flex-col gap-1">
        <div
          v-for="note in trashedNotes"
          :key="note.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
          :class="selectedIds.has(note.id) && 'bg-neutral-100 dark:bg-neutral-800'"
          @click="toggleSelect(note.id)"
        >
          <div
            class="size-4 rounded border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0"
            :class="
              selectedIds.has(note.id) && 'bg-neutral-800 dark:bg-neutral-200 border-transparent'
            "
          >
            <UIcon
              v-if="selectedIds.has(note.id)"
              name="tabler:check"
              class="size-3 text-white dark:text-neutral-900"
            />
          </div>

          <div class="flex-1 min-w-0">
            <span class="text-[15px] truncate block">{{ note.title || "Untitled" }}</span>
          </div>

          <span class="text-xs text-neutral-400 shrink-0">
            Deleted {{ formatDate(note.deletedAt) }}
          </span>

          <div class="flex items-center gap-1 shrink-0" @click.stop>
            <UTooltip text="Restore" arrow>
              <UButton
                :icon="ICONS.restore"
                size="xs"
                variant="link"
                color="neutral"
                @click="restoreNotes([note.id])"
              />
            </UTooltip>
            <UTooltip text="Delete forever" arrow>
              <UButton
                :icon="ICONS.trashX"
                size="xs"
                variant="link"
                color="error"
                @click="permanentlyDeleteNotes([note.id])"
              />
            </UTooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm empty trash modal -->
    <UModal v-model:open="confirmEmptyModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-medium mb-2">Empty trash?</h3>
          <p class="text-sm text-neutral-500 mb-4">
            All {{ trashedNotes.length }} note{{ trashedNotes.length > 1 ? "s" : "" }} will be
            permanently deleted. This cannot be undone.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="soft"
              color="neutral"
              @click="confirmEmptyModal = false"
            />
            <UButton label="Empty trash" variant="solid" color="error" @click="handleEmptyTrash" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
