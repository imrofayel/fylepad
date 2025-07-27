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

  try {
    const userNotes = await notesService.getUserNotes(userId);
    return { notes: userNotes };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch notes"
    });
  }
});
