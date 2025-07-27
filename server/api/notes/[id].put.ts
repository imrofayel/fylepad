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
  const body = await readBody(event);
  
  if (!noteId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Note ID is required"
    });
  }

  try {
    const updatedNote = await notesService.update(noteId, userId, body);
    
    if (!updatedNote) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found"
      });
    }
    
    return { note: updatedNote };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update note"
    });
  }
});
