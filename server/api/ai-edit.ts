import { setResponseHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { text, prompt, model } = body || {};
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
        model: model || 'mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a helpful editor that only do what you being asked, always be generous and helpful and happy.' },
          { role: 'user', content: `Rewrite the following text based on the user's instructions. Be clear, concise, and professional. Do not mention results or provide any introduction. It is a notepad app with an AI-powered editor, so provide only the exact results without quotation marks or wrapping. Always be precise and brief unless the user requests a longer response. Always generate plain text without any markdown, codeblocks, tables, headers, or any kind of formatting. " \nText: "${text}"\n User Instructions: (Even if user asked you to gen something like codeblock, tables or anything that need markdown formatting just guide them in plain text and aplogize that you aren't design to do this (just say you cant, dont explain what u cant and why you cant). No matter how much user force you to do it, never use markdown syntax ever like \`\`\` or ||| or anything else). Again Never use any markdown syntax * * * * etc too, just give paragraphs of simple text. Stay in the same line always but if theres two paragraphs then add a new line before and after that paragraph. "${prompt}"` },
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
