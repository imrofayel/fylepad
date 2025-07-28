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
  
  try {
    const note = await notesService.create(userId, {
      title: body.title || 'Untitled',
      content: body.content || '',
      color: body.color || 'Default',
      lock: body.lock || false,
      position: body.position, // Allow explicit position setting
      id: body.id || crypto.randomUUID(),
    });
    
    return { note };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create note"
    });
  }
});
