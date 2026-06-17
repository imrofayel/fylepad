<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useNotes } from "@/composables/useNotes";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import type { EditorTabRecord, CollectionRecord } from "@/lib/editorDb";
import Menu from "@/components/header/menu.vue";

const router = useRouter();
const route = useRoute();
const { initialized, user } = useAuth();
const {
  notes,
  filteredNotes,
  collections,
  activeCollectionId,
  searchQuery,
  loading,
  showCollections,
  noteCountByCollection,
  refresh,
  createNewNote,
  importFile,
  deleteNote,
  moveNoteToCollection,
  renameNoteTitle,
  addCollection,
  editCollection,
  removeCollection,
} = useNotes();

// ─── State ────────────────────────────────────────────
const renameNoteModal = ref(false);
const renameNoteId = ref("");
const renameNoteValue = ref("");
const renameCollectionModal = ref(false);
const renameCollectionId = ref("");
const renameCollectionValue = ref("");
const newCollectionModal = ref(false);
const newCollectionName = ref("");
const deleteCollectionModal = ref(false);
const deleteCollectionId = ref("");
const deleteCollectionMode = ref<"move" | "delete">("move");

const isInsideCollection = computed(() => activeCollectionId.value !== "all");

const activeCollection = computed(() =>
  collections.value.find((c) => c.id === activeCollectionId.value),
);

const isRecoveredCollection = computed(() => {
  if (!isInsideCollection.value) return false;
  return activeCollection.value?.name?.toLowerCase() === "recovered";
});

// Find the default collection (isSystem + name "default")
const defaultCollection = computed(() =>
  collections.value.find((c) => c.isSystem && c.name.toLowerCase().startsWith("default")),
);

// Notes in the default collection (shown on home)
const defaultNotes = computed(() => {
  const defId = defaultCollection.value?.id;
  if (!defId) return [];
  let result = notes.value.filter((n) => n.collectionId === defId);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    result = result.filter((n) => n.title.toLowerCase().includes(q));
  }
  return result;
});

// Non-default collections (hide default box from home)
const nonDefaultCollections = computed(() =>
  collections.value.filter((c) => !(c.isSystem && c.name.toLowerCase().startsWith("default"))),
);

// ─── Actions ──────────────────────────────────────────
function handleOpenNote(note: EditorTabRecord) {
  if (note.id.startsWith("temp-")) return;
  router.push({ path: "/editor", query: { id: note.id } });
}

async function handleCreateNote() {
  const note = await createNewNote();
  if (note) {
    router.push({ path: "/editor", query: { id: note.id } });
  }
}

async function handleImportFile() {
  const note = await importFile();
  if (note) {
    router.push({ path: "/editor", query: { id: note.id } });
  }
}

function goBack() {
  router.push({ query: {} });
}

function openCollection(colId: string) {
  router.push({ query: { c: colId } });
}

function openRenameNote(note: EditorTabRecord) {
  renameNoteId.value = note.id;
  renameNoteValue.value = note.title;
  renameNoteModal.value = true;
}

async function confirmRenameNote() {
  if (renameNoteValue.value.trim()) {
    await renameNoteTitle(renameNoteId.value, renameNoteValue.value.trim());
  }
  renameNoteModal.value = false;
}

async function handleDeleteNote(noteId: string) {
  await deleteNote(noteId);
}

function openRenameCollection(col: CollectionRecord) {
  renameCollectionId.value = col.id;
  renameCollectionValue.value = col.name;
  renameCollectionModal.value = true;
}

async function confirmRenameCollection() {
  if (renameCollectionValue.value.trim()) {
    await editCollection(renameCollectionId.value, renameCollectionValue.value.trim());
  }
  renameCollectionModal.value = false;
}

function openDeleteCollection(col: CollectionRecord) {
  deleteCollectionId.value = col.id;
  deleteCollectionMode.value = "move";
  deleteCollectionModal.value = true;
}

async function confirmDeleteCollection() {
  await removeCollection(deleteCollectionId.value, deleteCollectionMode.value);
  deleteCollectionModal.value = false;
  router.push({ query: {} });
}

async function confirmNewCollection() {
  if (newCollectionName.value.trim()) {
    await addCollection(newCollectionName.value.trim());
  }
  newCollectionName.value = "";
  newCollectionModal.value = false;
}

function noteDropdownItems(note: EditorTabRecord) {
  const moveItems = showCollections.value
    ? collections.value
        .filter((c) => c.id !== note.collectionId && c.name?.toLowerCase() !== "recovered")
        .map((c) => ({
          label: c.name,
          onSelect: () => moveNoteToCollection(note.id, c.id),
        }))
    : [];

  const items: any[][] = [
    [{ label: "Rename", icon: ICONS.edit, onSelect: () => openRenameNote(note) }],
  ];

  if (moveItems.length > 0) {
    items[0].push({
      label: "Move to",
      icon: ICONS.folderMove,
      children: [moveItems],
    });
  }
  items.push([
    {
      label: "Delete",
      icon: ICONS.trashFilled,
      color: "error" as const,
      onSelect: () => handleDeleteNote(note.id),
    },
  ]);

  return items;
}

function collectionDropdownItems(col: CollectionRecord) {
  if (col.isSystem) return [];
  return [
    [
      { label: "Rename", icon: ICONS.edit, onSelect: () => openRenameCollection(col) },
      {
        label: "Delete",
        icon: ICONS.trashFilled,
        color: "error" as const,
        onSelect: () => openDeleteCollection(col),
      },
    ],
  ];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Dropdown items for the Add button
const addDropdownItems = computed(() => {
  if (isInsideCollection.value) {
    return [
      [
        { label: "New Note", icon: ICONS.notePlus, onSelect: () => handleCreateNote() },
        { label: "Open File", icon: ICONS.folderOpen, onSelect: () => handleImportFile() },
      ],
    ];
  }
  return [
    [
      { label: "Note", icon: ICONS.notePlus, onSelect: () => handleCreateNote() },
      { label: "Open File", icon: ICONS.folderOpen, onSelect: () => handleImportFile() },
      {
        label: "Collection",
        icon: ICONS.folderPlus,
        onSelect: () => (newCollectionModal.value = true),
      },
    ],
  ];
});

// Sync activeCollectionId with URL query param
watch(
  () => route.query.c,
  (c) => {
    activeCollectionId.value = (c as string) || "all";
  },
  { immediate: true },
);

watch(
  [initialized, user],
  ([isInit]) => {
    if (isInit) refresh();
  },
  { immediate: true },
);
</script>

<template>
  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-3 px-2 bg-default">
    <!-- Top bar -->
    <div class="flex items-center justify-end">
      <Menu is-home />
    </div>

    <!-- Loading -->
    <div v-if="loading || !initialized" class="flex items-center justify-center py-32">
      <UIcon :name="ICONS.loader" class="size-7 animate-spin text-neutral-400" />
    </div>

    <!-- Main content -->
    <div v-else>
      <!-- Logo -->
      <img src="/favicon.svg" class="w-10 h-10 w-full my-6" />

      <!-- Search -->
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

      <!-- ════════ INSIDE A COLLECTION ════════ -->
      <div v-if="isInsideCollection" class="max-w-2xl mx-auto">
        <!-- Back + collection name + add -->
        <div class="flex items-center justify-between my-4 mb-2">
          <div class="flex items-center gap-2">
            <ButtonWithTooltip
              text="Go Back"
              :icon="ICONS.arrowBackFilled"
              size="lg"
              color="neutral"
              @click="goBack"
            />
            <h2 class="text-xl font-medium">{{ activeCollection?.name || "Collection" }}</h2>
          </div>
          <div class="flex items-center gap-1">
            <UDropdownMenu
              v-if="activeCollection && !activeCollection.isSystem"
              :items="collectionDropdownItems(activeCollection)"
              arrow
            >
              <UButton :icon="ICONS.dots" size="lg" variant="ghost" color="neutral" />
            </UDropdownMenu>
            <UDropdownMenu v-if="!isRecoveredCollection" :items="addDropdownItems" arrow>
              <ButtonWithTooltip :icon="ICONS.plus" size="md" text="Create note" />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Notes list -->
        <div v-if="filteredNotes.length === 0" class="flex flex-col items-center py-20 gap-3">
          <UIcon name="tabler:notes-off" class="size-10 text-neutral-300 dark:text-neutral-600" />
          <UButton
            v-if="!searchQuery && !isRecoveredCollection"
            label="Create a note"
            :icon="ICONS.notePlus"
            variant="soft"
            color="neutral"
            size="sm"
            @click="handleCreateNote"
          />
        </div>

        <div v-else class="flex flex-col">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="group flex items-center justify-between py-0.5 px-1"
            :class="note.id.startsWith('temp-') && 'opacity-50 pointer-events-none animate-pulse'"
            @click="handleOpenNote(note)"
          >
            <span class="text-[17px] max-w-80 font-medium truncate flex-1">
              {{ note.title || "Untitled" }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[16.5px] font-medium text-neutral-400 whitespace-nowrap">
                {{ formatDate(note.updatedAt || note.createdAt) }}
              </span>
              <UDropdownMenu :items="noteDropdownItems(note)" arrow>
                <UButton :icon="ICONS.dots" size="lg" variant="link" color="neutral" @click.stop />
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════ HOME VIEW (all collections + notes) ════════ -->
      <div v-else class="max-w-2xl mx-auto">
        <!-- Header with Add dropdown -->
        <div class="flex items-center justify-end mb-4">
          <UDropdownMenu :items="addDropdownItems" arrow>
            <ButtonWithTooltip :icon="ICONS.plus" size="lg" text="Create" />
          </UDropdownMenu>
        </div>

        <!-- Collection cards -->
        <div
          v-if="showCollections && collections.length > 0 && !searchQuery"
          class="flex flex-wrap gap-2.5 mb-6"
        >
          <div
            v-for="col in nonDefaultCollections"
            :key="col.id"
            class="group relative min-w-40 flex flex-col overflow-hidden gap-3 p-3 px-4 rounded-sm bg-neutral-100 dark:bg-neutral-800"
            @click="openCollection(col.id)"
          >
            <UIcon
              :name="ICONS.folder"
              class="size-25 -rotate-16 absolute -bottom-8 -right-5 text-neutral-200 dark:text-neutral-600 shrink-0"
              :class="col.name?.toLowerCase() === 'recovered' && 'text-yellow-200!'"
            />
            <div class="w-35 h-25">
              <p class="text-[17px] w-25 font-medium truncate">{{ col.name }}</p>
              <p class="text-[16.5px] font-medium text-neutral-400 absolute bottom-2">
                {{ noteCountByCollection.get(col.id) || 0 }}
              </p>
            </div>
            <UDropdownMenu
              v-if="!col.isSystem"
              :items="collectionDropdownItems(col)"
              class="absolute right-2.5 top-2"
              arrow
            >
              <UButton
                :icon="ICONS.dotsCircle"
                size="md"
                variant="link"
                color="neutral"
                @click.stop
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Notes list -->
        <div v-if="defaultNotes.length === 0" class="flex flex-col items-center py-20 gap-3">
          <UIcon name="tabler:notes-off" class="size-9 text-neutral-300 dark:text-neutral-600" />
          <p class="text-neutral-400 text-base font-medium">
            {{ searchQuery ? "No notes match your search" : "No notes yet" }}
          </p>
          <UButton
            v-if="!searchQuery"
            label="Create your first note"
            :icon="ICONS.notePlus"
            variant="soft"
            color="neutral"
            size="lg"
            @click="handleCreateNote"
          />
        </div>

        <div v-else class="flex flex-col">
          <div
            v-for="note in defaultNotes"
            :key="note.id"
            class="group flex items-center justify-between py-0.5 px-1 cursor-pointer transition-colors"
            :class="note.id.startsWith('temp-') && 'opacity-50 pointer-events-none animate-pulse'"
            @click="handleOpenNote(note)"
          >
            <span class="text-[17px] font-medium max-w-80 truncate flex-1">
              {{ note.title || "Untitled" }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[15.5px] font-medium text-neutral-400 whitespace-nowrap">
                {{ formatDate(note.updatedAt || note.createdAt) }}
              </span>
              <UDropdownMenu
                :items="noteDropdownItems(note)"
                arrow
                :ui="{
                  content: 'w-40',
                }"
              >
                <UButton
                  :icon="ICONS.dots"
                  size="lg"
                  variant="link"
                  color="neutral"
                  class="cursor-pointer!"
                  @click.stop
                />
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ MODALS ═══════════════ -->

    <!-- Rename note -->
    <UModal v-model:open="renameNoteModal">
      <template #content>
        <div>
          <UInput
            v-model="renameNoteValue"
            placeholder="Note title"
            class="mb-0"
            :ui="{
              base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-xl! px-0 shadow-none!',
            }"
            size="xl"
            @keydown.enter="confirmRenameNote"
          />
          <div class="flex justify-end gap-2.5">
            <ButtonWithTooltip
              text="Close"
              :icon="ICONS.close"
              size="xl"
              @click="renameNoteModal = false"
            />
            <ButtonWithTooltip
              text="Confirm"
              :icon="ICONS.check"
              size="xl"
              color="success"
              @click="confirmRenameNote"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Rename collection -->
    <UModal v-model:open="renameCollectionModal">
      <template #content>
        <div>
          <UInput
            v-model="renameCollectionValue"
            placeholder="Folder name"
            class="mb-0"
            :ui="{
              base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-xl! px-0 shadow-none!',
            }"
            size="xl"
            @keydown.enter="confirmRenameCollection"
          />
          <div class="flex justify-end gap-2.5">
            <ButtonWithTooltip
              text="Close"
              :icon="ICONS.close"
              size="xl"
              @click="renameCollectionModal = false"
            />
            <ButtonWithTooltip
              text="Confirm"
              :icon="ICONS.check"
              size="xl"
              color="success"
              @click="confirmRenameCollection"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- New collection -->
    <UModal v-model:open="newCollectionModal">
      <template #content>
        <div>
          <UInput
            v-model="newCollectionName"
            placeholder="Collection name"
            class="mb-0"
            :ui="{
              base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-xl! px-0 shadow-none!',
            }"
            size="xl"
            @keydown.enter="confirmNewCollection"
          />
          <div class="flex justify-end gap-2.5">
            <ButtonWithTooltip
              text="Close"
              :icon="ICONS.close"
              size="xl"
              @click="newCollectionModal = false"
            />
            <ButtonWithTooltip
              text="Confirm"
              :icon="ICONS.check"
              size="xl"
              color="success"
              @click="confirmNewCollection"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete collection -->
    <UModal
      v-model:open="deleteCollectionModal"
      :ui="{
        content: 'p-0!',
      }"
    >
      <template #content>
        <div>
          <div class="flex flex-col gap-2 m-2">
            <label
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="
                deleteCollectionMode === 'move'
                  ? 'bg-neutral-50 dark:bg-neutral-800/70'
                  : 'bg-neutral-50 dark:bg-neutral-800/50'
              "
              @click="deleteCollectionMode = 'move'"
            >
              <input
                type="radio"
                name="deleteMode"
                value="move"
                :checked="deleteCollectionMode === 'move'"
                class="mt-0.5 accent-neutral-800 dark:accent-neutral-200"
              />
              <div>
                <span class="text-[15.5px] font-medium">Move notes to Default</span>
              </div>
            </label>
            <label
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="
                deleteCollectionMode === 'delete'
                  ? 'bg-red-200/70 dark:bg-red-900/40'
                  : 'bg-red-100 dark:bg-red-900/20'
              "
              @click="deleteCollectionMode = 'delete'"
            >
              <input
                type="radio"
                name="deleteMode"
                value="delete"
                :checked="deleteCollectionMode === 'delete'"
                class="mt-0.5 accent-red-600"
              />
              <div>
                <span class="text-[15.5px] font-medium text-red-400">Delete all notes</span>
              </div>
            </label>
          </div>
          <div class="flex justify-end gap-3 px-2.5">
            <ButtonWithTooltip
              text="Close"
              :icon="ICONS.close"
              size="xl"
              @click="deleteCollectionModal = false"
            />
            <ButtonWithTooltip
              text="Delete folder"
              :icon="ICONS.trash"
              size="xl"
              @click="confirmDeleteCollection"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
