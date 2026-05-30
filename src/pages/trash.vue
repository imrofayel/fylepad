<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useNotes } from "@/composables/useNotes";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import { useRouter } from "vue-router";

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

const searchQuery = ref("");

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<template>
  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-3 px-2 bg-default">
    <div class="flex items-center justify-end">
      <HeaderMenu is-home is-trash />
    </div>

    <div v-if="loading || !initialized" class="flex items-center justify-center py-32">
      <UIcon :name="ICONS.loader" class="size-7 text-neutral-400" />
    </div>

    <div v-else>
      <img src="/favicon.svg" class="w-10 h-10 w-full my-6" />

      <div class="w-full flex justify-center items-center">
        <UInput
          v-model="searchQuery"
          placeholder="Find notes..."
          :ui="{
            base: 'bg-neutral-100 dark:bg-neutral-800 pl-7!',
            leading: 'p-1.5 pr-0!',
            leadingIcon: 'size-4',
          }"
          class="w-50 mb-2"
          :icon="ICONS.search"
        />
      </div>

      <div class="max-w-2xl mx-auto my-4 mb-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ButtonWithTooltip
              text="Go Back"
              :icon="ICONS.arrowBackFilled"
              size="lg"
              color="neutral"
              @click="goBack"
            />
            <h2 class="text-xl flex items-center gap-1.5 font-medium">
              Trash
              <UTooltip text="Saving to cloud..." arrow>
                <UIcon
                  v-if="syncing"
                  :name="ICONS.loader"
                  class="size-5 animate-spin text-neutral-400"
                />
              </UTooltip>
            </h2>
          </div>
          <div class="flex gap-1 items-center">
            <ButtonWithTooltip
              text="Restore selected"
              v-if="selectedIds.size > 0"
              :icon="ICONS.restore"
              size="lg"
              @click="handleRestore"
            />
            <ButtonWithTooltip
              v-if="selectedIds.size > 0"
              text="Delete selected"
              :icon="ICONS.trash"
              color="error"
              size="lg"
              @click="handlePermanentDelete"
            />

            <ButtonWithTooltip
              text="Select all"
              :icon="ICONS.selectAll"
              size="lg"
              @click="toggleAll"
              v-if="trashedNotes.length > 0 && selectedIds.size === 0"
            />

            <ButtonWithTooltip
              text="Empty Trash"
              :icon="ICONS.trash"
              size="lg"
              color="error"
              @click="confirmEmptyModal = true"
              v-if="trashedNotes.length > 0 && selectedIds.size === 0"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="max-w-2xl mx-auto">
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
      </div>

      <!-- Trash list -->
      <div v-else class="max-w-3xl mx-auto mt-3">
        <div class="flex flex-col gap-1">
          <div
            v-for="note in trashedNotes"
            :key="note.id"
            class="flex items-center gap-3 py-1 cursor-pointer"
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
              <span class="text-[16.5px] truncate block">{{ note.title || "Untitled" }}</span>
            </div>

            <span class="text-[15.5px] font-medium text-neutral-400 shrink-0">
              {{ formatDate(note.deletedAt) }}
            </span>

            <div class="flex items-center gap-1 shrink-0" @click.stop>
              <UTooltip text="Restore" arrow>
                <UButton
                  :icon="ICONS.restore"
                  size="md"
                  variant="link"
                  color="neutral"
                  @click="restoreNotes([note.id])"
                />
              </UTooltip>
              <UTooltip text="Delete forever" arrow>
                <UButton
                  :icon="ICONS.trash"
                  size="md"
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
      <UModal
        v-model:open="confirmEmptyModal"
        :ui="{
          content: 'bg-red-100 dark:bg-red-950',
        }"
      >
        <template #content>
          <div class="pt-2">
            <p class="text-[15.5px]! text-red-500! dark:text-red-100! mb-6">
              All {{ trashedNotes.length }} note{{ trashedNotes.length > 1 ? "s" : "" }} will be
              permanently deleted. This cannot be undone.
            </p>
            <div class="flex justify-end gap-2">
              <ButtonWithTooltip
                text="Cancel"
                variant="soft"
                color="neutral"
                :icon="ICONS.close"
                @click="confirmEmptyModal = false"
              />
              <ButtonWithTooltip
                text="Empty Trash"
                :icon="ICONS.trash"
                variant="solid"
                color="error"
                @click="handleEmptyTrash"
              />
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>
