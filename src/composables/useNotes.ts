import { ref, computed } from "vue";
import type { EditorTabRecord, CollectionRecord } from "@/lib/editorDb";
import {
  loadAllNotes,
  loadTrashedNotes,
  loadCollections,
  hasCollections as _hasCollections,
  createNote as _createNote,
  softDeleteNote,
  hardDeleteNotes,
  restoreNotes as _restoreNotes,
  moveNote as _moveNote,
  renameNote as _renameNote,
  createCollection as _createCollection,
  renameCollection as _renameCollection,
  deleteCollection as _deleteCollection,
} from "@/lib/notesDb";
import { useEditor } from "@/composables/useEditor";

const notes = ref<EditorTabRecord[]>([]);
const trashedNotes = ref<EditorTabRecord[]>([]);
const collections = ref<CollectionRecord[]>([]);
const activeCollectionId = ref<string>("all");
const searchQuery = ref("");
const loading = ref(false);

export function useNotes() {
  const showCollections = computed(() => _hasCollections());

  const filteredNotes = computed(() => {
    let result = notes.value;

    if (activeCollectionId.value !== "all") {
      result = result.filter((n) => n.collectionId === activeCollectionId.value);
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q));
    }

    return result;
  });

  const noteCountByCollection = computed(() => {
    const map = new Map<string, number>();
    for (const note of notes.value) {
      map.set(note.collectionId, (map.get(note.collectionId) || 0) + 1);
    }
    return map;
  });

  async function refresh() {
    loading.value = true;
    try {
      const [n, c] = await Promise.all([loadAllNotes(), loadCollections()]);
      notes.value = n;
      collections.value = c;
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      loading.value = false;
    }
  }

  async function refreshTrash() {
    loading.value = true;
    try {
      trashedNotes.value = await loadTrashedNotes();
    } catch (err) {
      console.error("Failed to load trashed notes:", err);
    } finally {
      loading.value = false;
    }
  }

  async function createNewNote(collectionId?: string) {
    const colId = activeCollectionId.value !== "all" ? activeCollectionId.value : collectionId;
    const note = await _createNote("Untitled", colId);
    notes.value = [...notes.value, note];
    return note;
  }

  async function deleteNote(noteId: string) {
    await softDeleteNote(noteId);
    notes.value = notes.value.filter((n) => n.id !== noteId);
    useEditor().closeTab(noteId);
  }

  async function permanentlyDeleteNotes(noteIds: string[]) {
    await hardDeleteNotes(noteIds);
    trashedNotes.value = trashedNotes.value.filter((n) => !noteIds.includes(n.id));
  }

  async function emptyTrash() {
    const ids = trashedNotes.value.map((n) => n.id);
    if (ids.length === 0) return;
    await hardDeleteNotes(ids);
    trashedNotes.value = [];
  }

  async function restoreNotes(noteIds: string[]) {
    await _restoreNotes(noteIds);
    const restored = trashedNotes.value.filter((n) => noteIds.includes(n.id));
    trashedNotes.value = trashedNotes.value.filter((n) => !noteIds.includes(n.id));
    notes.value = [...notes.value, ...restored.map((n) => ({ ...n, deletedAt: null }))];
  }

  async function moveNoteToCollection(noteId: string, collectionId: string) {
    await _moveNote(noteId, collectionId);
    const note = notes.value.find((n) => n.id === noteId);
    if (note) {
      note.collectionId = collectionId;
      const col = collections.value.find((c) => c.id === collectionId);
      if (col) note.collectionName = col.name;
    }
  }

  async function renameNoteTitle(noteId: string, title: string) {
    await _renameNote(noteId, title);
    const note = notes.value.find((n) => n.id === noteId);
    if (note) note.title = title;
  }

  async function addCollection(name: string) {
    const col = await _createCollection(name);
    collections.value = [...collections.value, col];
    return col;
  }

  async function editCollection(colId: string, name: string) {
    await _renameCollection(colId, name);
    const col = collections.value.find((c) => c.id === colId);
    if (col) col.name = name;
  }

  async function removeCollection(colId: string, mode: "move" | "delete" = "move") {
    await _deleteCollection(colId, mode);

    // If mode is delete, we need to close all tabs that were in this collection
    if (mode === "delete") {
      const { closeTab } = useEditor();
      for (const note of notes.value) {
        if (note.collectionId === colId) {
          closeTab(note.id);
        }
      }
    }

    collections.value = collections.value.filter((c) => c.id !== colId);
    if (activeCollectionId.value === colId) activeCollectionId.value = "all";
    await refresh();
  }

  return {
    notes,
    trashedNotes,
    collections,
    activeCollectionId,
    searchQuery,
    loading,
    filteredNotes,
    noteCountByCollection,
    showCollections,
    refresh,
    refreshTrash,
    createNewNote,
    deleteNote,
    permanentlyDeleteNotes,
    emptyTrash,
    restoreNotes,
    moveNoteToCollection,
    renameNoteTitle,
    addCollection,
    editCollection,
    removeCollection,
  };
}
