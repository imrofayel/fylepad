// lib/notes.ts
import { db } from "./db";
import { notes, type Note, type NewNote } from "./schema";
import { eq, desc, and } from "drizzle-orm";

export const notesService = {
  async create(userId: string, noteData: Partial<NewNote> = {}): Promise<Note> {
    const newNote: NewNote = {
      id: crypto.randomUUID(), // Your requested ID generation
      title: noteData.title || "Untitled",
      content: noteData.content || "",
      color: noteData.color || "Default",
      lock: noteData.lock || false,
      isOpen: noteData.isOpen !== undefined ? noteData.isOpen : true,
      userId, // Clerk user ID
    };

    const result = await db.insert(notes).values(newNote).returning();
    return result[0];
  },

  async getUserNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
  },

  async getNote(noteId: string, userId: string): Promise<Note | undefined> {
    const result = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .limit(1);
    
    return result[0];
  },

  async update(noteId: string, userId: string, updates: Partial<Note>): Promise<Note | null> {
    const result = await db
      .update(notes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    return result[0] || null;
  },

  async delete(noteId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    return result.rowsAffected > 0;
  },
};
