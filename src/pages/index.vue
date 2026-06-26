<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useNotes } from "@/composables/useNotes";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import type { EditorTabRecord, CollectionRecord } from "@/lib/editorDb";
import NoteFilters from "@/components/editor/NoteFilters.vue";
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
const homeSortOrder = ref<"desc" | "asc">("asc");
const homeDateRange = ref<any>(null);
const collectionSortOrder = ref<"desc" | "asc">("asc");
const collectionDateRange = ref<any>(null);
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const isInsideCollection = computed(() => activeCollectionId.value !== "all");

const activeCollection = computed(() =>
  collections.value.find((c) => c.id === activeCollectionId.value),
);

const isRecoveredCollection = computed(() => {
  if (!isInsideCollection.value) return false;
  return activeCollection.value?.name?.toLowerCase() === "recovered";
});

const defaultCollection = computed(() =>
  collections.value.find((c) => c.isSystem && c.name.toLowerCase().startsWith("default")),
);

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

const nonDefaultCollections = computed(() =>
  collections.value.filter((c) => !(c.isSystem && c.name.toLowerCase().startsWith("default"))),
);

function getNoteTimestamp(note: EditorTabRecord) {
  const source = note.updatedAt || note.createdAt;
  if (!source) return 0;
  const timestamp = new Date(source).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function toRangeBoundary(value: unknown, endOfDay = false) {
  const candidate = value as { toDate?: (timeZone: string) => Date } | Date | undefined;
  const date =
    candidate instanceof Date
      ? new Date(candidate)
      : new Date(candidate?.toDate?.(localTimeZone) || 0);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.getTime();
}

function toNotesInRange(notesList: EditorTabRecord[], sortOrder: "asc" | "desc", dateRange: any) {
  let result = [...notesList];

  if (dateRange?.start && dateRange?.end) {
    const start = toRangeBoundary(dateRange.start);
    const end = toRangeBoundary(dateRange.end, true);

    result = result.filter((note) => {
      const noteTime = getNoteTimestamp(note);
      return noteTime >= start && noteTime <= end;
    });
  }

  result.sort((a, b) => {
    const aTime = getNoteTimestamp(a);
    const bTime = getNoteTimestamp(b);
    return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
  });

  return result;
}

const homeHasDateFilter = computed(
  () => !!homeDateRange.value?.start && !!homeDateRange.value?.end,
);
const collectionHasDateFilter = computed(
  () => !!collectionDateRange.value?.start && !!collectionDateRange.value?.end,
);

const homeVisibleNotes = computed(() =>
  toNotesInRange(defaultNotes.value, homeSortOrder.value, homeDateRange.value),
);

const collectionVisibleNotes = computed(() =>
  toNotesInRange(filteredNotes.value, collectionSortOrder.value, collectionDateRange.value),
);

function resetHomeDateFilter() {
  homeDateRange.value = null;
}

function resetCollectionDateFilter() {
  collectionDateRange.value = null;
}

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
    <div class="flex items-center justify-end">
      <Menu is-home />
    </div>

    <div v-if="loading || !initialized" class="flex items-center justify-center py-32">
      <UIcon :name="ICONS.loader" class="size-7 animate-spin text-neutral-400" />
    </div>

    <div v-else>
      <img src="/favicon.svg" class="h-10 w-full my-6" />

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

      <div v-if="isInsideCollection" class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between my-4 mb-4">
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
            <UPopover
              v-if="activeCollection && !activeCollection.isSystem"
              :open="
                (renameCollectionModal && renameCollectionId === activeCollection.id) ||
                (deleteCollectionModal && deleteCollectionId === activeCollection.id)
              "
              @update:open="
                (val: boolean) => {
                  if (!val) {
                    renameCollectionModal = false;
                    deleteCollectionModal = false;
                  }
                }
              "
              arrow
            >
              <UDropdownMenu :items="collectionDropdownItems(activeCollection)" arrow>
                <UButton :icon="ICONS.dots" size="lg" variant="ghost" color="neutral" />
              </UDropdownMenu>
              <template #content>
                <div v-if="renameCollectionModal" class="px-2">
                  <UInput
                    v-model="renameCollectionValue"
                    placeholder="Folder name"
                    class="mb-0"
                    :ui="{
                      base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-[17px]! px-0 shadow-none!',
                    }"
                    size="md"
                    autofocus
                    @keydown.enter="confirmRenameCollection"
                  />
                  <div class="flex justify-end gap-x-1 pb-1">
                    <ButtonWithTooltip
                      text="Close"
                      :icon="ICONS.close"
                      size="md"
                      @click="renameCollectionModal = false"
                    />
                    <ButtonWithTooltip
                      text="Confirm"
                      :icon="ICONS.check"
                      size="md"
                      color="success"
                      @click="confirmRenameCollection"
                    />
                  </div>
                </div>
                <div v-else-if="deleteCollectionModal" class="p-2 min-w-60">
                  <div class="flex flex-col gap-2">
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
                      <span class="text-[15.5px] font-medium">Move notes to Default</span>
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
                      <span class="text-[15.5px] font-medium text-red-400">Delete all notes</span>
                    </label>
                  </div>
                  <div class="flex justify-end gap-3 mt-2">
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
            </UPopover>
            <UDropdownMenu v-if="!isRecoveredCollection" :items="addDropdownItems" arrow>
              <ButtonWithTooltip :icon="ICONS.plus" size="md" text="Create note" />
            </UDropdownMenu>
          </div>
        </div>

        <NoteFilters
          v-model:sort-order="collectionSortOrder"
          v-model:date-range="collectionDateRange"
          storage-key="fylepad-zen.collection-note-filters"
        />

        <div
          v-if="collectionVisibleNotes.length === 0"
          class="flex flex-col items-center py-20 gap-3"
        >
          <UIcon name="tabler:notes-off" class="size-10 text-neutral-300 dark:text-neutral-600" />
        </div>

        <div v-else class="flex flex-col">
          <div
            v-for="note in collectionVisibleNotes"
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
              <UPopover
                :open="renameNoteModal && renameNoteId === note.id"
                @update:open="
                  (val: boolean) => {
                    if (!val) renameNoteModal = false;
                  }
                "
                arrow
              >
                <UDropdownMenu :items="noteDropdownItems(note)" arrow>
                  <UButton
                    :icon="ICONS.dots"
                    size="lg"
                    variant="link"
                    color="neutral"
                    @click.stop
                  />
                </UDropdownMenu>
                <template #content>
                  <div class="px-2">
                    <UInput
                      v-model="renameNoteValue"
                      placeholder="Note title"
                      class="mb-0"
                      :ui="{
                        base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-[17px]! px-0 shadow-none!',
                      }"
                      size="md"
                      autofocus
                      @keydown.enter="confirmRenameNote"
                    />
                    <div class="flex justify-end gap-x-1 pb-1">
                      <ButtonWithTooltip
                        text="Close"
                        :icon="ICONS.close"
                        size="md"
                        @click="renameNoteModal = false"
                      />
                      <ButtonWithTooltip
                        text="Confirm"
                        :icon="ICONS.check"
                        size="md"
                        color="success"
                        @click="confirmRenameNote"
                      />
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="max-w-2xl mx-auto">
        <div class="flex items-center justify-end mb-4">
          <UPopover
            :open="newCollectionModal"
            @update:open="
              (val: boolean) => {
                if (!val) newCollectionModal = false;
              }
            "
            arrow
          >
            <UDropdownMenu :items="addDropdownItems" arrow>
              <ButtonWithTooltip :icon="ICONS.plus" size="lg" text="Create" />
            </UDropdownMenu>
            <template #content>
              <div class="px-2">
                <UInput
                  v-model="newCollectionName"
                  placeholder="Collection name"
                  class="mb-0"
                  :ui="{
                    base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-[17px]! px-0 shadow-none!',
                  }"
                  size="md"
                  autofocus
                  @keydown.enter="confirmNewCollection"
                />
                <div class="flex justify-end gap-x-1 pb-0.5">
                  <ButtonWithTooltip
                    text="Close"
                    :icon="ICONS.close"
                    size="md"
                    @click="newCollectionModal = false"
                  />
                  <ButtonWithTooltip
                    text="Confirm"
                    :icon="ICONS.check"
                    size="md"
                    color="success"
                    @click="confirmNewCollection"
                  />
                </div>
              </div>
            </template>
          </UPopover>
        </div>

        <div
          v-if="showCollections && collections.length > 0 && !searchQuery"
          class="flex flex-wrap gap-2.5 mb-6"
        >
          <div
            v-for="col in nonDefaultCollections"
            :key="col.id"
            class="ring-1 ring-neutral-300 dark:ring-neutral-600 group relative min-w-40 flex flex-col overflow-hidden gap-3 p-3 px-4 rounded-sm bg-neutral-100 dark:bg-neutral-800"
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
            <UPopover
              v-if="!col.isSystem"
              :open="
                (renameCollectionModal && renameCollectionId === col.id) ||
                (deleteCollectionModal && deleteCollectionId === col.id)
              "
              @update:open="
                (val: boolean) => {
                  if (!val) {
                    renameCollectionModal = false;
                    deleteCollectionModal = false;
                  }
                }
              "
              class="absolute right-2.5 top-2"
              arrow
            >
              <UDropdownMenu :items="collectionDropdownItems(col)" arrow>
                <UButton
                  :icon="ICONS.dotsCircle"
                  size="md"
                  variant="link"
                  color="neutral"
                  @click.stop
                />
              </UDropdownMenu>
              <template #content>
                <div v-if="renameCollectionModal && renameCollectionId === col.id" class="px-2">
                  <UInput
                    v-model="renameCollectionValue"
                    placeholder="Folder name"
                    class="mb-0"
                    :ui="{
                      base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-[17px]! px-0 shadow-none!',
                    }"
                    size="md"
                    autofocus
                    @keydown.enter="confirmRenameCollection"
                  />
                  <div class="flex justify-end gap-x-1 pb-1">
                    <ButtonWithTooltip
                      text="Close"
                      :icon="ICONS.close"
                      size="md"
                      @click="renameCollectionModal = false"
                    />
                    <ButtonWithTooltip
                      text="Confirm"
                      :icon="ICONS.check"
                      size="md"
                      color="success"
                      @click="confirmRenameCollection"
                    />
                  </div>
                </div>
                <div
                  v-else-if="deleteCollectionModal && deleteCollectionId === col.id"
                  class="pt-3 pb-1.5"
                >
                  <div class="flex flex-col gap-2">
                    <label
                      class="flex items-center border-b pr-10 border-neutral-200 dark:border-neutral-600 pb-2 gap-3 px-4"
                      @click="deleteCollectionMode = 'move'"
                    >
                      <input
                        type="radio"
                        name="deleteMode"
                        value="move"
                        :checked="deleteCollectionMode === 'move'"
                        class="mt-0.5 accent-neutral-800 dark:accent-neutral-200"
                      />
                      <span class="text-[15.5px]">Move notes to Default</span>
                    </label>
                    <label
                      class="flex items-center gap-3 px-4 pb-2 border-b border-neutral-200 dark:border-neutral-600"
                      @click="deleteCollectionMode = 'delete'"
                    >
                      <input
                        type="radio"
                        name="deleteMode"
                        value="delete"
                        :checked="deleteCollectionMode === 'delete'"
                        class="mt-0.5 accent-red-600"
                      />
                      <span class="text-[15.5px] text-red-400">Delete all notes</span>
                    </label>
                  </div>
                  <div class="flex justify-end gap-0.5 mt-2">
                    <ButtonWithTooltip
                      text="Close"
                      :icon="ICONS.close"
                      size="md"
                      color="error"
                      @click="deleteCollectionModal = false"
                    />
                    <ButtonWithTooltip
                      text="Delete folder"
                      :icon="ICONS.trash"
                      size="md"
                      color="error"
                      @click="confirmDeleteCollection"
                    />
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>

        <NoteFilters
          v-model:sort-order="homeSortOrder"
          v-model:date-range="homeDateRange"
          storage-key="fylepad-zen.home-note-filters"
        />

        <div v-if="homeVisibleNotes.length === 0" class="flex flex-col items-center py-20 gap-3">
          <ButtonWithTooltip
            v-if="!searchQuery && !homeHasDateFilter"
            text="Create your first note"
            :icon="ICONS.notePlus"
            variant="soft"
            color="neutral"
            size="xl"
            @click="handleCreateNote"
          />
        </div>

        <div v-else class="flex flex-col">
          <div
            v-for="note in homeVisibleNotes"
            :key="note.id"
            class="group flex items-center justify-between py-0.5 px-1 cursor-pointer transition-colors"
            :class="note.id.startsWith('temp-') && 'opacity-50 pointer-events-none animate-pulse'"
            @click="handleOpenNote(note)"
          >
            <span class="text-[17px] font-medium max-w-80 truncate flex-1">
              {{ note.title || "Untitled" }}
            </span>
            <div class="flex items-center gap-3">
              <UTooltip arrow :text="formatDate(note.updatedAt || note.createdAt)">
                <UIcon name="ph:calendar-duotone" class="size-5" />
              </UTooltip>
              <UPopover
                :open="renameNoteModal && renameNoteId === note.id"
                @update:open="
                  (val: boolean) => {
                    if (!val) renameNoteModal = false;
                  }
                "
                arrow
              >
                <UDropdownMenu
                  :items="noteDropdownItems(note)"
                  arrow
                  :ui="{
                    content: 'w-40',
                    group: 'dark:border-neutral-600',
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
                <template #content>
                  <div class="px-2">
                    <UInput
                      v-model="renameNoteValue"
                      placeholder="Note title"
                      class="mb-0"
                      :ui="{
                        base: 'bg-transparent! ring-0! focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! font-normal! text-[17px]! px-0 shadow-none!',
                      }"
                      size="md"
                      autofocus
                      @keydown.enter="confirmRenameNote"
                    />
                    <div class="flex justify-end gap-x-1">
                      <ButtonWithTooltip
                        text="Close"
                        :icon="ICONS.close"
                        size="md"
                        @click="renameNoteModal = false"
                      />
                      <ButtonWithTooltip
                        text="Confirm"
                        :icon="ICONS.check"
                        size="md"
                        color="success"
                        @click="confirmRenameNote"
                      />
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
