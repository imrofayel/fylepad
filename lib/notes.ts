// lib/notes.ts
import { db } from "./db";
import { notes, type Note, type NewNote } from "./schema";
import { eq, desc, and, asc, gte, lte, sql } from "drizzle-orm";

export const notesService = {
  async create(userId: string, noteData: Partial<NewNote> = {}): Promise<Note> {
    // Get the next position for this user
    const maxPositionResult = await db
      .select({ maxPosition: sql<number>`MAX(${notes.position})` })
      .from(notes)
      .where(eq(notes.userId, userId));
    
    const nextPosition = (maxPositionResult[0]?.maxPosition || 0) + 1;

    const newNote: NewNote = {
      id: crypto.randomUUID(), // Your requested ID generation
      title: noteData.title || "Untitled",
      content: noteData.content || "",
      color: noteData.color || "Default",
      lock: noteData.lock || false,
      position: noteData.position || nextPosition,
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
      .orderBy(asc(notes.position));
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
    // Get the position of the note being deleted
    const noteToDelete = await this.getNote(noteId, userId);
    if (!noteToDelete) return false;

    // Delete the note
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    // If deletion was successful, update positions of remaining notes
    if (result.rowsAffected > 0) {
      await db
        .update(notes)
        .set({
          position: sql`${notes.position} - 1`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(notes.userId, userId),
          gte(notes.position, noteToDelete.position)
        ));
    }

    return result.rowsAffected > 0;
  },

  async updatePositions(userId: string, positionUpdates: { id: string; position: number }[]): Promise<void> {
    // Use a transaction to update all positions atomically
    await db.transaction(async (tx) => {
      for (const update of positionUpdates) {
        await tx
          .update(notes)
          .set({
            position: update.position,
            updatedAt: new Date(),
          })
          .where(and(eq(notes.id, update.id), eq(notes.userId, userId)));
      }
    });
  },

  async reorderNote(userId: string, noteId: string, newPosition: number): Promise<Note[]> {
    // Get current note and validate
    const currentNote = await this.getNote(noteId, userId);
    if (!currentNote) {
      throw new Error('Note not found');
    }

    const oldPosition = currentNote.position;
    
    // Get all user notes to determine the valid position range
    const userNotes = await this.getUserNotes(userId);
    const maxPosition = userNotes.length;
    
    // Clamp the new position to valid range
    const clampedNewPosition = Math.max(1, Math.min(newPosition, maxPosition));
    
    if (oldPosition === clampedNewPosition) {
      return userNotes; // No change needed
    }

    // Calculate position updates for affected notes
    const positionUpdates: { id: string; position: number }[] = [];

    if (oldPosition < clampedNewPosition) {
      // Moving forward: shift notes between old and new position back by 1
      for (const note of userNotes) {
        if (note.position > oldPosition && note.position <= clampedNewPosition && note.id !== noteId) {
          positionUpdates.push({ id: note.id, position: note.position - 1 });
        }
      }
    } else {
      // Moving backward: shift notes between new and old position forward by 1
      for (const note of userNotes) {
        if (note.position >= clampedNewPosition && note.position < oldPosition && note.id !== noteId) {
          positionUpdates.push({ id: note.id, position: note.position + 1 });
        }
      }
    }

    // Add the moved note's new position
    positionUpdates.push({ id: noteId, position: clampedNewPosition });

    // Apply all position updates
    await this.updatePositions(userId, positionUpdates);

    // Return updated notes in correct order
    return await this.getUserNotes(userId);
  },
};
