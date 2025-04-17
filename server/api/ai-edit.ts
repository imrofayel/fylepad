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
      })
    });
    const data = await resp.json();
    const aiResult = data.choices?.[0]?.message?.content?.trim();
    if (!aiResult) {
      return { error: 'No AI result' };
    }
    return { result: aiResult };
  } catch (e) {
    return { error: (e as any)?.message || String(e) };
  }
});
