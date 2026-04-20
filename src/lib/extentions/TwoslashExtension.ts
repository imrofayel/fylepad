import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";
import { createHighlighter, type HighlighterCore } from "shiki";
import { createTransformerFactory, rendererRich } from "@shikijs/twoslash/core";
import { createTwoslashFromCDN } from "twoslash-cdn";

type TwoslashContainer = HTMLElement & { __bound?: boolean };

const TWOSLASH_PLUGIN_KEY = new PluginKey<TwoslashPluginState>("twoslash");

const TWOSLASH_LANGS = new Set(["ts", "tsx", "typescript", "js", "jsx", "javascript"]);

interface TwoslashRuntime {
  prepareTypes: (source: string) => Promise<void>;
  transformer: ReturnType<ReturnType<typeof createTransformerFactory>>;
}

interface TwoslashPluginState {
  decorations: DecorationSet;
  editingKey: string | null;
}

interface TwoslashExtensionOptions {
  debounce?: number;
  classList: string[] | string;
}

const getBlockKey = (id: string, pos: number) => `${id || "twoslash"}@${pos}`;

const resolveTheme = (): "light" | "dark" =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const normalizeLanguage = (language: string) => {
  const lower = language.toLowerCase();
  if (lower === "typescript") return "ts";
  if (lower === "javascript") return "js";
  return lower;
};

const isTwoslashCandidate = (language: unknown, source: string) => {
  if (typeof language !== "string") {
    return false;
  }

  const lang = normalizeLanguage(language);
  if (!TWOSLASH_LANGS.has(lang)) {
    return false;
  }

  return source.includes("^?") || /@twoslash\b/i.test(source);
};

const getSelectionTwoslashKey = (viewState: {
  selection: {
    $from: { depth: number; node: (depth: number) => any; before: (depth: number) => number };
  };
}) => {
  const { $from } = viewState.selection;
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type?.name !== "codeBlock") {
      continue;
    }

    const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
    const pos = depth > 0 ? $from.before(depth) : 0;
    return getBlockKey(id, pos);
  }

  return null;
};

export const TwoslashExtension = Extension.create<TwoslashExtensionOptions>({
  name: "twoslashPreview",

  addOptions() {
    return {
      debounce: 280,
      classList: "twoslash-container",
    };
  },

  addProseMirrorPlugins() {
    const debounce = this.options.debounce ?? 280;
    const classList = this.options.classList;

    const sourceCache = new Map<string, string>();
    const themeCache = new Map<string, "light" | "dark">();
    const langCache = new Map<string, string>();
    const renderTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const renderTokens = new Map<string, number>();
    const containers = new Map<string, TwoslashContainer>();
    const positionByKey = new Map<string, number>();
    const renderModeByKey = new Map<string, "twoslash" | "fallback" | "error">();

    let activeView: EditorView | null = null;
    let activeTheme: "light" | "dark" = resolveTheme();
    let highlighterPromise: Promise<HighlighterCore> | null = null;
    let highlighter: HighlighterCore | null = null;
    let twoslashRuntimePromise: Promise<TwoslashRuntime | null> | null = null;

    const getHighlighter = async () => {
      if (highlighter) {
        return highlighter;
      }

      if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
          themes: ["github-light", "github-dark"],
          langs: ["ts", "tsx", "js", "jsx"],
        }).then((instance) => {
          highlighter = instance;
          return instance;
        });
      }

      return highlighterPromise;
    };

    const createContainer = (key: string) => {
      const container = document.createElement("div") as TwoslashContainer;
      container.classList.add(...(Array.isArray(classList) ? classList : [classList]));
      container.dataset.twoslashId = key;
      return container;
    };

    const getTwoslashRuntime = async (): Promise<TwoslashRuntime | null> => {
      if (twoslashRuntimePromise) {
        return twoslashRuntimePromise;
      }

      twoslashRuntimePromise = (async () => {
        try {
          const twoslash = createTwoslashFromCDN({
            compilerOptions: {
              lib: ["esnext", "dom"],
            },
            twoSlashOptionsOverrides: {
              handbookOptions: {
                noErrorValidation: true,
              },
            },
          });

          await twoslash.init();

          const transformer = createTransformerFactory(twoslash.runSync)({
            renderer: rendererRich(),
            explicitTrigger: false,
            throws: false,
          });

          return {
            prepareTypes: twoslash.prepareTypes,
            transformer,
          };
        } catch {
          return null;
        }
      })();

      return twoslashRuntimePromise;
    };

    const renderError = (container: TwoslashContainer, error: unknown) => {
      container.replaceChildren();

      const message = document.createElement("p");
      message.className = "twoslash-error";
      message.textContent = `Twoslash render error: ${
        error instanceof Error ? error.message : String(error)
      }`;

      container.appendChild(message);
    };

    const requestRefresh = () => {
      if (!activeView) {
        return;
      }

      activeView.dispatch(activeView.state.tr.setMeta(TWOSLASH_PLUGIN_KEY, { refresh: true }));
    };

    const renderPreview = async (key: string, source: string, lang: string, token: number) => {
      const container = containers.get(key);
      if (!container) {
        return;
      }

      try {
        const twoslashRuntime = await getTwoslashRuntime();
        if (!twoslashRuntime) {
          throw new Error("Twoslash runtime unavailable");
        }

        await twoslashRuntime.prepareTypes(source);

        if (renderTokens.get(key) !== token) {
          return;
        }

        const shiki = await getHighlighter();
        const html = shiki.codeToHtml(source, {
          lang: normalizeLanguage(lang),
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          transformers: [twoslashRuntime.transformer],
        });

        if (renderTokens.get(key) !== token) {
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        const shikiNode = wrapper.firstElementChild as HTMLElement | null;
        const hasTwoslashMarkup =
          Boolean(
            wrapper.querySelector(
              ".twoslash-popup-container, .twoslash-error-line, [data-twoslash-error], .twoslash-query-line",
            ),
          ) || shikiNode?.classList.contains("twoslash");

        if (!hasTwoslashMarkup) {
          renderModeByKey.set(key, "fallback");
          container.replaceChildren();
          requestRefresh();
          return;
        }

        renderModeByKey.set(key, "twoslash");

        container.replaceChildren();
        if (shikiNode) {
          container.appendChild(shikiNode);
        }

        requestRefresh();
      } catch (error) {
        if (renderTokens.get(key) !== token) {
          return;
        }

        try {
          renderModeByKey.set(key, "fallback");
          container.replaceChildren();
          requestRefresh();
        } catch {
          renderModeByKey.set(key, "error");
          renderError(container, error);
          requestRefresh();
        }
      } finally {
        renderTimers.delete(key);
      }
    };

    const buildDecorations = (doc: any, editingKey: string | null, refresh = false) => {
      const decorations: Decoration[] = [];
      const liveKeys = new Set<string>();

      activeTheme = resolveTheme();
      positionByKey.clear();

      doc.descendants((node: any, pos: number) => {
        if (node.type.name !== "codeBlock") {
          return;
        }

        const source = node.textContent;
        const language = typeof node.attrs?.language === "string" ? node.attrs.language : "";
        if (!isTwoslashCandidate(language, source)) {
          return;
        }

        const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
        const key = getBlockKey(id, pos);
        liveKeys.add(key);
        positionByKey.set(key, pos);

        const isEditing = editingKey === key;
        const hasRenderedTwoslash = renderModeByKey.get(key) === "twoslash";
        const showPreview = !isEditing && hasRenderedTwoslash;
        const container = containers.get(key) ?? createContainer(key);
        containers.set(key, container);
        container.classList.toggle("is-editing", !showPreview);

        const openEditor = () => {
          const view = activeView;
          if (!view) {
            return;
          }

          const nodePos = positionByKey.get(key);
          if (typeof nodePos !== "number") {
            return;
          }

          const tr = view.state.tr
            .setMeta(TWOSLASH_PLUGIN_KEY, { editingKey: key })
            .setSelection(TextSelection.create(view.state.doc, nodePos + 1));

          view.dispatch(tr);
          view.focus();
        };

        if (!container.__bound) {
          container.addEventListener("dblclick", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openEditor();
          });

          container.__bound = true;
        }

        decorations.push(
          Decoration.node(pos, pos + node.nodeSize, {
            class: showPreview
              ? "twoslash-source twoslash-source--hidden"
              : "twoslash-source twoslash-source--editing",
          }),
        );

        decorations.push(
          Decoration.widget(pos + node.nodeSize, container, {
            side: 1,
          }),
        );

        if (
          sourceCache.get(key) === source &&
          themeCache.get(key) === activeTheme &&
          langCache.get(key) === language &&
          (hasRenderedTwoslash || renderModeByKey.has(key))
        ) {
          return;
        }

        renderModeByKey.set(key, "fallback");

        sourceCache.set(key, source);
        themeCache.set(key, activeTheme);
        langCache.set(key, language);

        const oldTimer = renderTimers.get(key);
        if (oldTimer) {
          clearTimeout(oldTimer);
        }

        const token = (renderTokens.get(key) ?? 0) + 1;
        renderTokens.set(key, token);

        const timer = setTimeout(
          () => {
            void renderPreview(key, source, language, token);
          },
          refresh ? 0 : debounce,
        );

        renderTimers.set(key, timer);
      });

      for (const key of Array.from(containers.keys())) {
        if (liveKeys.has(key)) {
          continue;
        }

        const timer = renderTimers.get(key);
        if (timer) {
          clearTimeout(timer);
        }

        containers.delete(key);
        sourceCache.delete(key);
        themeCache.delete(key);
        langCache.delete(key);
        renderTimers.delete(key);
        renderTokens.delete(key);
        positionByKey.delete(key);
        renderModeByKey.delete(key);
      }

      return DecorationSet.create(doc, decorations);
    };

    return [
      new Plugin<TwoslashPluginState>({
        key: TWOSLASH_PLUGIN_KEY,
        state: {
          init: (_, state) => {
            const editingKey = getSelectionTwoslashKey(state);
            return {
              editingKey,
              decorations: buildDecorations(state.doc, editingKey),
            };
          },
          apply: (tr, pluginState, _oldState, newState) => {
            const meta = tr.getMeta(TWOSLASH_PLUGIN_KEY) as
              | { editingKey?: string | null; refresh?: boolean }
              | undefined;

            const editingKey =
              meta?.editingKey !== undefined ? meta.editingKey : getSelectionTwoslashKey(newState);

            if (
              !tr.docChanged &&
              !tr.selectionSet &&
              !meta?.refresh &&
              meta?.editingKey === undefined
            ) {
              return pluginState;
            }

            return {
              editingKey,
              decorations: buildDecorations(newState.doc, editingKey, Boolean(meta?.refresh)),
            };
          },
        },
        props: {
          decorations: (state) => TWOSLASH_PLUGIN_KEY.getState(state)?.decorations ?? null,
        },
        view: (view) => {
          activeView = view;

          const observer = new MutationObserver(() => {
            const nextTheme = resolveTheme();
            if (nextTheme === activeTheme || !activeView) {
              return;
            }

            activeTheme = nextTheme;
            activeView.dispatch(
              activeView.state.tr.setMeta(TWOSLASH_PLUGIN_KEY, { refresh: true }),
            );
          });

          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
          });

          return {
            update: (nextView) => {
              activeView = nextView;
            },
            destroy: () => {
              observer.disconnect();
              activeView = null;
              for (const timer of renderTimers.values()) {
                clearTimeout(timer);
              }
              renderTimers.clear();
            },
          };
        },
      }),
    ];
  },
});
