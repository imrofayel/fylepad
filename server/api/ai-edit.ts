import { setResponseHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { text, prompt } = body || {};
  if (!text || !prompt) {
    return { error: 'Missing text or prompt' };
  }

  const config = useRuntimeConfig();
  const apiKey = config.openrouterApiKey || process.env.NUXT_OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: 'OpenRouter API key not set in env' };
  }

  // Stream response from OpenRouter with SSE
  function sendStream(event: any, stream: ReadableStream<Uint8Array>) {
    event._handled = true;
    // @ts-ignore
    event.node.res._data = stream;
    if (event.node.res.socket) {
      stream.pipeTo(
        new WritableStream({
          write(chunk) {
            event.node.res.write(chunk);
          },
          close() {
            event.node.res.end();
          }
        })
      );
    }
  }

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
        messages: [
          { role: 'system', content: 'You are a world-class copy editor and expert prompt engineer.' },
          { role: 'user', content: `Rewrite the following text according to the user's instructions. Be clear, concise, and professional.\nText: "${text}"\nInstructions: "${prompt}"` },
        ],
        max_tokens: 600,
        temperature: 0.7,
        stream: true,
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      event.node.res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
      event.node.res.end();
      return;
    }
    // Send raw stream
    sendStream(event, resp.body as any);
  } catch (e) {
    event.node.res.write(`data: ${JSON.stringify({ error: (e as any)?.message || String(e) })}\n\n`);
    event.node.res.end();
  }
});
