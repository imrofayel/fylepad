<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useNotes } from "@/composables/useNotes";
import { useEditor } from "@/composables/useEditor";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import type { EditorTabRecord, CollectionRecord } from "@/lib/editorDb";

const router = useRouter();
useAuth();
const {
  filteredNotes,
  collections,
  activeCollectionId,
  searchQuery,
  loading,
  showCollections,
  noteCountByCollection,
  refresh,
  createNewNote,
  deleteNote,
  moveNoteToCollection,
  renameNoteTitle,
  addCollection,
  editCollection,
  removeCollection,
} = useNotes();
const { openNote, isReady } = useEditor();

// ─── Modals ───────────────────────────────────────────
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

// ─── Actions ──────────────────────────────────────────
function handleOpenNote(note: EditorTabRecord) {
  openNote(note);
  router.push("/editor");
}

async function handleCreateNote() {
  const note = await createNewNote();
  openNote(note);
  router.push("/editor");
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
        .filter((c) => c.id !== note.collectionId)
        .map((c) => ({
          label: c.name,
          icon: ICONS.folder,
          onSelect: () => moveNoteToCollection(note.id, c.id),
        }))
    : [];

  const items: any[][] = [
    [
      { label: "Open", icon: ICONS.arrowRight, onSelect: () => handleOpenNote(note) },
      { label: "Rename", icon: ICONS.edit, onSelect: () => openRenameNote(note) },
    ],
  ];

  if (moveItems.length > 0) {
    items.push(moveItems.map((m) => ({ ...m, label: `Move to ${m.label}` })));
  }

  items.push([
    {
      label: "Delete",
      icon: ICONS.trash,
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
        icon: ICONS.trash,
        color: "error" as const,
        onSelect: () => openDeleteCollection(col),
      },
    ],
  ];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

onMounted(() => {
  refresh();
});
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Top bar -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800"
    >
      <div class="flex items-center gap-3 flex-1">
        <img src="../../src/assets/icons/icon.svg" alt="fylepad" class="w-6 h-6" />
        <UInput
          v-model="searchQuery"
          :icon="ICONS.search"
          placeholder="Search notes..."
          class="max-w-sm flex-1"
          :ui="{ base: 'text-[15px]' }"
        />
      </div>
      <div class="flex items-center gap-2.5">
        <UButton
          label="New note"
          :icon="ICONS.notePlus"
          variant="soft"
          color="neutral"
          class="text-[14px]"
          @click="handleCreateNote"
        />
        <UTooltip text="Trash" arrow>
          <UButton
            :icon="ICONS.trash"
            variant="link"
            color="neutral"
            @click="$router.push('/trash')"
          />
        </UTooltip>
        <AuthUser />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !isReady" class="flex items-center justify-center py-32">
      <UIcon :name="ICONS.loader" class="size-6 text-neutral-400" />
    </div>

    <!-- Main content -->
    <div v-else class="flex">
      <!-- Sidebar: collections -->
      <aside
        v-if="showCollections"
        class="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 p-3 min-h-[calc(100vh-57px)]"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider"
            >Folders</span
          >
          <UButton
            :icon="ICONS.folderPlus"
            size="xs"
            variant="link"
            color="neutral"
            @click="newCollectionModal = true"
          />
        </div>

        <div class="flex flex-col gap-0.5">
          <UButton
            label="All Notes"
            variant="link"
            color="neutral"
            class="w-full justify-start px-2 py-1.5 text-[14px] font-normal"
            :class="activeCollectionId === 'all' && 'bg-neutral-100 dark:bg-neutral-800'"
            @click="activeCollectionId = 'all'"
          >
            <template #trailing>
              <UBadge
                :label="String(filteredNotes.length)"
                size="sm"
                variant="subtle"
                color="neutral"
              />
            </template>
          </UButton>

          <div v-for="col in collections" :key="col.id" class="group flex items-center">
            <UButton
              :label="col.name"
              variant="link"
              color="neutral"
              class="flex-1 justify-start px-2 py-1.5 text-[14px] font-normal truncate"
              :class="activeCollectionId === col.id && 'bg-neutral-100 dark:bg-neutral-800'"
              :icon="ICONS.folder"
              :ui="{ leadingIcon: 'size-3.5 opacity-50' }"
              @click="activeCollectionId = col.id"
            >
              <template #trailing>
                <UBadge
                  v-if="noteCountByCollection.get(col.id)"
                  :label="String(noteCountByCollection.get(col.id) || 0)"
                  size="sm"
                  variant="subtle"
                  color="neutral"
                />
              </template>
            </UButton>

            <UDropdownMenu
              v-if="!col.isSystem"
              :items="collectionDropdownItems(col)"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <UButton :icon="ICONS.dots" size="xs" variant="link" color="neutral" />
            </UDropdownMenu>
          </div>
        </div>
      </aside>

      <!-- Notes grid -->
      <main class="flex-1 p-4">
        <div
          v-if="filteredNotes.length === 0"
          class="flex flex-col items-center justify-center py-24 gap-3"
        >
          <UIcon name="tabler:notes-off" class="size-10 text-neutral-300 dark:text-neutral-600" />
          <p class="text-neutral-400 text-sm">
            {{ searchQuery ? "No notes match your search" : "No notes yet" }}
          </p>
          <UButton
            v-if="!searchQuery"
            label="Create your first note"
            :icon="ICONS.notePlus"
            variant="soft"
            color="neutral"
            @click="handleCreateNote"
          />
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="group relative border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer"
            @click="handleOpenNote(note)"
          >
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-[15px] font-medium truncate flex-1">
                {{ note.title || "Untitled" }}
              </h3>
              <UDropdownMenu :items="noteDropdownItems(note)">
                <UButton
                  :icon="ICONS.dots"
                  size="xs"
                  variant="link"
                  color="neutral"
                  class="opacity-0 group-hover:opacity-100 shrink-0"
                  @click.stop
                />
              </UDropdownMenu>
            </div>

            <div class="flex items-center gap-3 mt-3 text-xs text-neutral-400">
              <span v-if="note.collectionName && showCollections" class="flex items-center gap-1">
                <UIcon :name="ICONS.folder" class="size-3" />
                {{ note.collectionName }}
              </span>
              <span>{{ formatDate(note.createdAt) }}</span>
            </div>

            <div v-if="note.updatedAt" class="mt-1 text-xs text-neutral-400">
              Updated {{ formatDate(note.updatedAt) }}
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Rename note modal -->
    <UModal v-model:open="renameNoteModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-medium mb-4">Rename note</h3>
          <UInput
            v-model="renameNoteValue"
            placeholder="Note title"
            class="mb-4"
            @keydown.enter="confirmRenameNote"
          />
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="soft"
              color="neutral"
              @click="renameNoteModal = false"
            />
            <UButton label="Rename" variant="solid" @click="confirmRenameNote" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Rename collection modal -->
    <UModal v-model:open="renameCollectionModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-medium mb-4">Rename folder</h3>
          <UInput
            v-model="renameCollectionValue"
            placeholder="Folder name"
            class="mb-4"
            @keydown.enter="confirmRenameCollection"
          />
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="soft"
              color="neutral"
              @click="renameCollectionModal = false"
            />
            <UButton label="Rename" variant="solid" @click="confirmRenameCollection" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- New collection modal -->
    <UModal v-model:open="newCollectionModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-medium mb-4">New folder</h3>
          <UInput
            v-model="newCollectionName"
            placeholder="Folder name"
            class="mb-4"
            @keydown.enter="confirmNewCollection"
          />
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="soft"
              color="neutral"
              @click="newCollectionModal = false"
            />
            <UButton label="Create" variant="solid" @click="confirmNewCollection" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete collection modal -->
    <UModal v-model:open="deleteCollectionModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-medium mb-1">Delete folder</h3>
          <p class="text-sm text-neutral-500 mb-5">
            Choose what happens to the notes inside this folder.
          </p>

          <div class="flex flex-col gap-2 mb-5">
            <label
              class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
              :class="
                deleteCollectionMode === 'move'
                  ? 'border-neutral-400 dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-800/50'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
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
                <span class="text-sm font-medium">Move notes to Default</span>
                <p class="text-xs text-neutral-400 mt-0.5">
                  Keep the notes safe in your Default folder
                </p>
              </div>
            </label>

            <label
              class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
              :class="
                deleteCollectionMode === 'delete'
                  ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
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
                <span class="text-sm font-medium text-red-600 dark:text-red-400"
                  >Trash all notes</span
                >
                <p class="text-xs text-neutral-400 mt-0.5">
                  Send all notes to trash (can be restored later)
                </p>
              </div>
            </label>
          </div>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="soft"
              color="neutral"
              @click="deleteCollectionModal = false"
            />
            <UButton
              label="Delete folder"
              variant="solid"
              color="error"
              @click="confirmDeleteCollection"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
