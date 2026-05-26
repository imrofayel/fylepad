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
import { useToast } from "@nuxt/ui/composables/useToast";

const notes = ref<EditorTabRecord[]>([]);
const trashedNotes = ref<EditorTabRecord[]>([]);
const collections = ref<CollectionRecord[]>([]);
const activeCollectionId = ref<string>("all");
const searchQuery = ref("");
const loading = ref(false);

const syncing = ref(false);

export function useNotes() {
  const toast = useToast();
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

  async function refresh(forceLoading = false) {
    if (notes.value.length === 0 || forceLoading) {
      loading.value = true;
    } else {
      syncing.value = true;
    }
    try {
      const [n, c] = await Promise.all([loadAllNotes(), loadCollections()]);
      notes.value = n;
      collections.value = c;
    } catch (err: any) {
      console.error("Failed to load notes:", err);
      toast.add({ title: "Failed to load notes", description: err.message, color: "error" });
    } finally {
      loading.value = false;
      syncing.value = false;
    }
  }

  async function refreshTrash(forceLoading = false) {
    if (trashedNotes.value.length === 0 || forceLoading) {
      loading.value = true;
    } else {
      syncing.value = true;
    }
    try {
      trashedNotes.value = await loadTrashedNotes();
    } catch (err: any) {
      console.error("Failed to load trashed notes:", err);
      toast.add({ title: "Failed to load trash", description: err.message, color: "error" });
    } finally {
      loading.value = false;
      syncing.value = false;
    }
  }

  async function createNewNote(collectionId?: string) {
    const colId = activeCollectionId.value !== "all" ? activeCollectionId.value : collectionId;
    const tempId = `temp-${Date.now()}`;
    const tempNote: EditorTabRecord = {
      id: tempId,
      title: "Untitled",
      collectionId: colId || "default",
      collectionName: "Loading...",
      content: {},
      metadata: null,
    };
    notes.value = [...notes.value, tempNote];
    syncing.value = true;

    try {
      const realNote = await _createNote("Untitled", colId);
      const index = notes.value.findIndex((n) => n.id === tempId);
      if (index !== -1) notes.value[index] = realNote;
      return realNote;
    } catch (err: any) {
      notes.value = notes.value.filter((n) => n.id !== tempId);
      toast.add({ title: "Failed to create note", description: err.message, color: "error" });
      throw err;
    } finally {
      syncing.value = false;
    }
  }

  async function deleteNote(noteId: string) {
    const noteIndex = notes.value.findIndex((n) => n.id === noteId);
    if (noteIndex === -1) return;
    const note = notes.value[noteIndex];

    notes.value = notes.value.filter((n) => n.id !== noteId);
    useEditor().closeTab(noteId);
    syncing.value = true;

    try {
      await softDeleteNote(noteId);
    } catch (err: any) {
      notes.value = [...notes.value.slice(0, noteIndex), note, ...notes.value.slice(noteIndex)];
      toast.add({ title: "Failed to delete note", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  async function permanentlyDeleteNotes(noteIds: string[]) {
    const oldTrash = [...trashedNotes.value];
    trashedNotes.value = trashedNotes.value.filter((n) => !noteIds.includes(n.id));
    syncing.value = true;

    try {
      await hardDeleteNotes(noteIds);
    } catch (err: any) {
      trashedNotes.value = oldTrash;
      toast.add({
        title: "Failed to delete notes forever",
        description: err.message,
        color: "error",
      });
    } finally {
      syncing.value = false;
    }
  }

  async function emptyTrash() {
    const ids = trashedNotes.value.map((n) => n.id);
    if (ids.length === 0) return;
    const oldTrash = [...trashedNotes.value];
    trashedNotes.value = [];
    syncing.value = true;

    try {
      await hardDeleteNotes(ids);
    } catch (err: any) {
      trashedNotes.value = oldTrash;
      toast.add({ title: "Failed to empty trash", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  async function restoreNotes(noteIds: string[]) {
    const restored = trashedNotes.value.filter((n) => noteIds.includes(n.id));
    const oldTrash = [...trashedNotes.value];
    const oldNotes = [...notes.value];

    trashedNotes.value = trashedNotes.value.filter((n) => !noteIds.includes(n.id));
    notes.value = [...notes.value, ...restored.map((n) => ({ ...n, deletedAt: null }))];
    syncing.value = true;

    try {
      await _restoreNotes(noteIds);
    } catch (err: any) {
      trashedNotes.value = oldTrash;
      notes.value = oldNotes;
      toast.add({ title: "Failed to restore notes", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  async function moveNoteToCollection(noteId: string, collectionId: string) {
    const note = notes.value.find((n) => n.id === noteId);
    if (!note) return;

    const oldCollectionId = note.collectionId;
    const oldCollectionName = note.collectionName;
    const targetCol = collections.value.find((c) => c.id === collectionId);

    note.collectionId = collectionId;
    if (targetCol) note.collectionName = targetCol.name;
    syncing.value = true;

    try {
      await _moveNote(noteId, collectionId);
    } catch (err: any) {
      note.collectionId = oldCollectionId;
      note.collectionName = oldCollectionName;
      toast.add({ title: "Failed to move note", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  async function renameNoteTitle(noteId: string, title: string) {
    const note = notes.value.find((n) => n.id === noteId);
    if (!note) return;

    const oldTitle = note.title;
    note.title = title;
    syncing.value = true;

    try {
      await _renameNote(noteId, title);
    } catch (err: any) {
      note.title = oldTitle;
      toast.add({ title: "Failed to rename note", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  async function addCollection(name: string) {
    const tempId = `temp-col-${Date.now()}`;
    const tempCol: CollectionRecord = { id: tempId, name, isSystem: false };
    collections.value = [...collections.value, tempCol];
    syncing.value = true;

    try {
      const col = await _createCollection(name);
      const index = collections.value.findIndex((c) => c.id === tempId);
      if (index !== -1) collections.value[index] = col;
      return col;
    } catch (err: any) {
      collections.value = collections.value.filter((c) => c.id !== tempId);
      toast.add({ title: "Failed to create folder", description: err.message, color: "error" });
      throw err;
    } finally {
      syncing.value = false;
    }
  }

  async function editCollection(colId: string, name: string) {
    const col = collections.value.find((c) => c.id === colId);
    if (!col) return;

    const oldName = col.name;
    col.name = name;
    syncing.value = true;

    try {
      await _renameCollection(colId, name);
    } catch (err: any) {
      col.name = oldName;
      toast.add({ title: "Failed to rename folder", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  async function removeCollection(colId: string, mode: "move" | "delete" = "move") {
    const oldCollections = [...collections.value];
    const oldNotes = [...notes.value];

    if (mode === "delete") {
      const { closeTab } = useEditor();
      for (const note of notes.value) {
        if (note.collectionId === colId) {
          closeTab(note.id);
        }
      }
      notes.value = notes.value.filter((n) => n.collectionId !== colId);
    } else {
      for (const note of notes.value) {
        if (note.collectionId === colId) {
          note.collectionId = "default";
          note.collectionName = "Default folder";
        }
      }
    }

    collections.value = collections.value.filter((c) => c.id !== colId);
    const oldActiveId = activeCollectionId.value;
    if (activeCollectionId.value === colId) activeCollectionId.value = "all";
    syncing.value = true;

    try {
      await _deleteCollection(colId, mode);
    } catch (err: any) {
      collections.value = oldCollections;
      notes.value = oldNotes;
      activeCollectionId.value = oldActiveId;
      toast.add({ title: "Failed to delete folder", description: err.message, color: "error" });
    } finally {
      syncing.value = false;
    }
  }

  return {
    notes,
    trashedNotes,
    collections,
    activeCollectionId,
    searchQuery,
    loading,
    syncing,
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
