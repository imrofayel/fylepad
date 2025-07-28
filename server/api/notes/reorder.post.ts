import { getAuth } from '@clerk/nuxt/server';
import { notesService } from "~/lib/notes";

export default defineEventHandler(async (event) => {
  const { userId } = getAuth(event);

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }

  const body = await readBody(event);
  const { noteId, newPosition } = body;
  
  if (!noteId || typeof newPosition !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: "Note ID and new position are required"
    });
  }

  try {
    const updatedNotes = await notesService.reorderNote(userId, noteId, newPosition);
    return { notes: updatedNotes };
  } catch (error) {
    console.error('Failed to reorder note:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to reorder note"
    });
  }
});
