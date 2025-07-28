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
  const { updates } = body;
  
  if (!updates || !Array.isArray(updates)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Updates array is required"
    });
  }

  try {
    const positionUpdates = updates.map((update: any) => ({
      id: update.id,
      position: update.position
    }));
    
    await notesService.updatePositions(userId, positionUpdates);
    return { success: true };
  } catch (error) {
    console.error('Failed to update positions:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update positions"
    });
  }
});
