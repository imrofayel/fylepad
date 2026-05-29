import type { Editor } from "@tiptap/core";
import { Completion } from "@lib/extensions/EditorCompletionExtension";
import type { CompletionStorage } from "@lib/extensions/EditorCompletionExtension";
import { ref, watch } from "vue";
import type { Ref, ShallowRef } from "vue";
import { marked } from "marked";
import { useAISettings } from "./useAISettings";
import { isCloudMode } from "@/lib/editorDb";
import { getSystemPrompt, DEFAULT_MODEL } from "@/lib/ai";

type CompletionMode =
  | "continue"
  | "fix"
  | "extend"
  | "reduce"
  | "simplify"
  | "summarize"
  | "translate"
  | "user";

export interface UseEditorCompletionOptions {
  api?: string;
  autoTrigger?: boolean;
  debounce?: number;
  minAutoTriggerChars?: number;
  acceptOnTab?: boolean;
  trapTab?: boolean;
}

export function useEditorCompletion(
  editorRef:
    | Ref<{ editor: Editor | undefined } | null | undefined>
    | Readonly<ShallowRef<{ editor: Editor | undefined } | null>>,
  options: UseEditorCompletionOptions = {},
) {
  const aiSettings = useAISettings();

  const autoTriggerEnabled = options.autoTrigger ?? false;
  const autoTriggerDebounce = options.debounce ?? 800;
  const minAutoTriggerChars = options.minAutoTriggerChars ?? 10;

  // State for direct insertion/transform mode
  const insertState = ref<{
    pos: number;
    deleteRange?: { from: number; to: number };
  }>();
  const renderedState = ref<{
    from: number;
    to: number;
  }>();
  const mode = ref<CompletionMode>("continue");
  const language = ref<string>();
  const customPrompt = ref<string>("");

  // Helper to get completion storage
  function getCompletionStorage() {
    const storage = editorRef.value?.editor?.storage as
      | Record<string, CompletionStorage>
      | undefined;
    return storage?.completion;
  }

  const completion = ref("");
  const isLoading = ref(false);
  let abortController: AbortController | null = null;

  function setCompletion(text: string) {
    completion.value = text;
  }

  function stop() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isLoading.value = false;
  }

  async function complete(prompt: string) {
    if (isLoading.value) stop();

    isLoading.value = true;
    completion.value = "";
    abortController = new AbortController();

    try {
      let res: Response;

      if (isCloudMode()) {
        const apiEndpoint =
          options.api || import.meta.env.VITE_AI_BACKEND_API || "http://localhost:3008/ai";
        res = await window.fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            mode: mode.value,
            language: language.value,
            ...(mode.value === "user" && customPrompt.value ? { prompt: customPrompt.value } : {}),
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error(`Cloud API error: ${res.statusText}`);
        }
      } else {
        if (!aiSettings.apiKey.value) {
          aiSettings.setError("AI features require an API key — Set up in Settings");
          throw new Error("Missing API key");
        }

        const systemPromptConfig = getSystemPrompt(mode.value, language.value);

        let userContent = prompt;
        if (mode.value === "user" && customPrompt.value) {
          userContent = `Instruction: ${customPrompt.value}\n\nText:\n${prompt}`;
        }

        const openaiBody = {
          model: aiSettings.selectedModel.value || DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPromptConfig.system },
            { role: "user", content: userContent },
          ],
          stream: true,
          ...(systemPromptConfig.maxOutputTokens
            ? { max_tokens: systemPromptConfig.maxOutputTokens }
            : {}),
        };

        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", `Bearer ${aiSettings.apiKey.value}`);

        res = await window.fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
          method: "POST",
          headers,
          body: JSON.stringify(openaiBody),
          signal: abortController.signal,
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            aiSettings.setError("Invalid API key — check your AI Gateway key in Settings");
          } else {
            aiSettings.setError(`Failed to reach AI service: ${res.statusText}`);
          }
          throw new Error("AI service error");
        }
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (isCloudMode()) {
          completion.value += chunk;
        } else {
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content ?? "";
                if (text) {
                  completion.value += text;
                }
              } catch {}
            }
          }
        }
      }

      // onFinish logic
      const storage = getCompletionStorage();
      if (mode.value === "continue" && storage?.visible) {
        return;
      }

      const transformModes = ["fix", "extend", "reduce", "simplify", "summarize", "translate"];
      const userModes = ["user"];
      if (
        (transformModes.includes(mode.value) || userModes.includes(mode.value)) &&
        insertState.value &&
        completion.value
      ) {
        const editor = editorRef.value?.editor;
        if (editor) {
          const range = renderedState.value ?? {
            from: insertState.value.pos,
            to: insertState.value.pos,
          };

          if (range.to > range.from) {
            editor.chain().focus().deleteRange(range).run();
          }

          const html = marked.parse(completion.value) as string;
          editor
            .chain()
            .focus()
            .insertContentAt(insertState.value.pos, html, {
              parseOptions: {
                preserveWhitespace: "full",
              },
            })
            .run();
        }
      }

      insertState.value = undefined;
      renderedState.value = undefined;
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("AI completion error:", error);
      insertState.value = undefined;
      renderedState.value = undefined;
      getCompletionStorage()?.clearSuggestion();
    } finally {
      isLoading.value = false;
      abortController = null;
    }
  }

  // Watch completion for inline suggestion updates
  watch(completion, (newCompletion, oldCompletion) => {
    const editor = editorRef.value?.editor;
    if (!editor || !newCompletion) return;

    const storage = getCompletionStorage();
    if (storage?.visible) {
      // Update inline suggestion
      // Add space prefix if needed (so preview matches what will be inserted)
      let suggestionText = newCompletion;
      if (storage.position !== undefined) {
        const textBefore = editor.state.doc.textBetween(
          Math.max(0, storage.position - 1),
          storage.position,
        );
        if (textBefore && !/\s/.test(textBefore) && !suggestionText.startsWith(" ")) {
          suggestionText = " " + suggestionText;
        }
      }
      //moviebox.ph/
      storage.setSuggestion(suggestionText);
      editor.view.dispatch(editor.state.tr.setMeta("completionUpdate", true));
    } else if (insertState.value) {
      // Direct insertion/transform mode (from toolbar actions)

      // Determine whether this mode expects markdown rendering
      const transformModes = ["fix", "extend", "reduce", "simplify", "summarize", "translate"];
      const userModes = ["user"];
      const isMarkdownMode = transformModes.includes(mode.value) || userModes.includes(mode.value);

      // If this is the first chunk and we have a selection to replace, delete it first
      if (insertState.value.deleteRange && !oldCompletion) {
        editor.chain().focus().deleteRange(insertState.value.deleteRange).run();
        insertState.value.deleteRange = undefined;
      }

      // For markdown-transform modes, parse accumulated markdown and replace the rendered content
      if (isMarkdownMode) {
        if (renderedState.value && renderedState.value.to > renderedState.value.from) {
          editor.chain().focus().deleteRange(renderedState.value).run();
          renderedState.value = undefined;
        }

        const beforeInsertSize = editor.state.doc.content.size;
        const html = marked.parse(newCompletion) as string;
        editor
          .chain()
          .focus()
          .insertContentAt(insertState.value.pos, html, {
            parseOptions: { preserveWhitespace: "full" },
          })
          .run();
        const afterInsertSize = editor.state.doc.content.size;
        renderedState.value = {
          from: insertState.value.pos,
          to: insertState.value.pos + Math.max(0, afterInsertSize - beforeInsertSize),
        };

        // Don't insert raw markdown – we've rendered HTML live instead
        return;
      }

      let delta = newCompletion.slice(oldCompletion?.length || 0);
      if (delta) {
        // For single-paragraph transforms, replace all line breaks with spaces
        if (["fix", "simplify", "translate"].includes(mode.value)) {
          delta = delta.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");
        }

        // For "continue" mode, add a space before if needed (first chunk only)
        if (mode.value === "continue" && !oldCompletion) {
          const textBefore = editor.state.doc.textBetween(
            Math.max(0, insertState.value.pos - 1),
            insertState.value.pos,
          );
          if (textBefore && !/\s/.test(textBefore)) {
            delta = " " + delta;
          }
        }

        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.insertText(delta, insertState.value!.pos);
            return true;
          })
          .run();
        insertState.value.pos += delta.length;
      }
    }
  });

  function triggerTransform(
    editor: Editor,
    transformMode: Exclude<CompletionMode, "continue">,
    lang?: string,
  ) {
    if (isLoading.value) return;

    getCompletionStorage()?.clearSuggestion();

    const { state } = editor;
    const { selection } = state;

    if (selection.empty) return;

    mode.value = transformMode;
    language.value = lang;
    const selectedText = state.doc.textBetween(selection.from, selection.to);

    // Replace the selected text with the transformed version
    insertState.value = {
      pos: selection.from,
      deleteRange: { from: selection.from, to: selection.to },
    };
    renderedState.value = undefined;

    complete(selectedText);
  }

  function getMarkdownBefore(editor: Editor, pos: number): string {
    const { state } = editor;
    const serializer = (
      editor.storage.markdown as {
        serializer?: { serialize: (content: unknown) => string };
      }
    )?.serializer;
    if (serializer) {
      const slice = state.doc.slice(0, pos);
      return serializer.serialize(slice.content);
    }
    // Fallback to plain text
    return state.doc.textBetween(0, pos, "\n");
  }

  function triggerContinue(editor: Editor) {
    if (isLoading.value) return;

    mode.value = "continue";
    getCompletionStorage()?.clearSuggestion();
    const { state } = editor;
    const { selection } = state;

    if (selection.empty) {
      // No selection: continue from cursor position
      const textBefore = getMarkdownBefore(editor, selection.from);
      insertState.value = { pos: selection.from };
      complete(textBefore);
    } else {
      // Text selected: append completion after the selection
      const textBefore = getMarkdownBefore(editor, selection.to);
      insertState.value = { pos: selection.to };
      complete(textBefore);
    }
  }

  function triggerCustomPrompt(editor: Editor, prompt: string) {
    if (isLoading.value || !prompt) return;

    getCompletionStorage()?.clearSuggestion();

    const { state } = editor;
    const { selection } = state;

    if (selection.empty) return;

    mode.value = "user";
    customPrompt.value = prompt;
    const selectedText = state.doc.textBetween(selection.from, selection.to);

    // Replace the selected text with the response
    insertState.value = {
      pos: selection.from,
      deleteRange: { from: selection.from, to: selection.to },
    };
    renderedState.value = undefined;

    complete(selectedText);
  }
  // Configure Completion extension
  const extension = Completion.configure({
    autoTrigger: autoTriggerEnabled,
    debounce: autoTriggerDebounce,
    acceptOnTab: options.acceptOnTab ?? true,
    trapTab: options.trapTab ?? true,
    onTrigger: (editor) => {
      if (isLoading.value || !aiSettings.isConfigured.value) return;
      mode.value = "continue";
      const textBefore = getMarkdownBefore(editor, editor.state.selection.from);
      complete(textBefore);
    },
    onAutoTrigger: (editor) => {
      const textBefore = getMarkdownBefore(editor, editor.state.selection.from);
      if (!textBefore || textBefore.trim().length < minAutoTriggerChars) {
        return;
      }

      mode.value = "continue";

      // Cancel stale in-flight requests before starting a new auto-completion.
      if (isLoading.value) {
        stop();
      }

      complete(textBefore);
    },
    onAccept: () => {
      setCompletion("");
    },
    onDismiss: () => {
      stop();
      setCompletion("");
    },
  });

  // Create handlers for toolbar
  const handlers = {
    aiContinue: {
      canExecute: () => !isLoading.value,
      execute: (editor: Editor) => {
        triggerContinue(editor);
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "continue"),
      isDisabled: () => !!isLoading.value,
    },
    aiFix: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor) => {
        triggerTransform(editor, "fix");
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "fix"),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
    aiExtend: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor) => {
        triggerTransform(editor, "extend");
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "extend"),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
    aiReduce: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor) => {
        triggerTransform(editor, "reduce");
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "reduce"),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
    aiSimplify: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor) => {
        triggerTransform(editor, "simplify");
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "simplify"),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
    aiSummarize: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor) => {
        triggerTransform(editor, "summarize");
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "summarize"),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
    aiTranslate: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor, cmd: { language?: string } | undefined) => {
        triggerTransform(editor, "translate", cmd?.language);
        return editor.chain();
      },
      isActive: (_editor: Editor, cmd: { language?: string } | undefined) =>
        !!(isLoading.value && mode.value === "translate" && language.value === cmd?.language),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
    aiCustom: {
      canExecute: (editor: Editor) => !editor.state.selection.empty && !isLoading.value,
      execute: (editor: Editor, cmd: { prompt: string } | undefined) => {
        if (cmd?.prompt) {
          triggerCustomPrompt(editor, cmd.prompt);
        }
        return editor.chain();
      },
      isActive: () => !!(isLoading.value && mode.value === "user"),
      isDisabled: (editor: Editor) => editor.state.selection.empty || !!isLoading.value,
    },
  };

  return {
    extension,
    handlers,
    isLoading,
    mode,
  };
}
