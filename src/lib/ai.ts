export type AIMode =
  | "fix"
  | "extend"
  | "reduce"
  | "simplify"
  | "summarize"
  | "continue"
  | "user"
  | "translate";

export interface SystemPromptConfig {
  system: string;
  maxOutputTokens?: number;
}

export const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

const PRESERVE_MARKDOWN_TEXT =
  "IMPORTANT: Preserve all markdown formatting (bold, italic, links, etc.) exactly as in the original.";

export function getSystemPrompt(mode?: AIMode, language?: string): SystemPromptConfig {
  if (mode === "user") {
    return {
      system:
        "You are a helpful assistant. Follow the user's instructions and only output the requested content. DO NOT add any explanations or extra text. If the user provides specific instructions, follow them exactly.",
    };
  }

  switch (mode) {
    case "fix":
      return {
        system: `You are a writing assistant. Fix all spelling and grammar errors in the given text. ${PRESERVE_MARKDOWN_TEXT} Only output the corrected text, nothing else.`,
        maxOutputTokens: 500,
      };
    case "extend":
      return {
        system: `You are a writing assistant. Extend the given text with more details, examples, and explanations while maintaining the same style. ${PRESERVE_MARKDOWN_TEXT} Only output the extended text, nothing else.`,
        maxOutputTokens: 500,
      };
    case "reduce":
      return {
        system: `You are a writing assistant. Make the given text more concise by removing unnecessary words while keeping the meaning. ${PRESERVE_MARKDOWN_TEXT} Only output the reduced text, nothing else.`,
        maxOutputTokens: 300,
      };
    case "simplify":
      return {
        system: `You are a writing assistant. Simplify the given text to make it easier to understand, using simpler words and shorter sentences. ${PRESERVE_MARKDOWN_TEXT} Only output the simplified text, nothing else.`,
        maxOutputTokens: 400,
      };
    case "summarize":
      return {
        system:
          "You are a writing assistant. Summarize the given text concisely while keeping the key points. Only output the summary, nothing else.",
        maxOutputTokens: 200,
      };
    case "translate":
      return {
        system: `You are a writing assistant. Translate the given text to ${language || "English"} while maintaining the same formatting. ${PRESERVE_MARKDOWN_TEXT} Only output the translated text, nothing else.`,
        maxOutputTokens: 500,
      };
    case "continue":
    default:
      return {
        system: `You are a writing assistant providing inline autocompletions.
CRITICAL RULES:
- Output ONLY the NEW text that comes AFTER the user's input
- NEVER repeat any words from the end of the user's text
- Keep completions short (1 sentence max)
- Match the tone and style of the existing text
- ${PRESERVE_MARKDOWN_TEXT}`,
        maxOutputTokens: 25,
      };
  }
}
