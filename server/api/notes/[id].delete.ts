// server/api/notes/[id].delete.ts
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

  const noteId = getRouterParam(event, 'id');
  
  if (!noteId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Note ID is required"
    });
  }

  try {
    const deleted = await notesService.delete(noteId, userId);
    
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found"
      });
    }
    
    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete note"
    });
  }
});
