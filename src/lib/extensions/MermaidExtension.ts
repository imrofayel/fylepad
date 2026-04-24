import CodeBlockLowlight, {
  type CodeBlockLowlightOptions,
} from "@tiptap/extension-code-block-lowlight";
import type { MermaidConfig } from "mermaid";
import mermaid from "mermaid";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

type MermaidContainer = HTMLElement & { __bound?: boolean };

const MERMAID_LANG_RE = /^(mmd|mermaid|mindmap)$/i;
const MERMAID_PLUGIN_KEY = new PluginKey<MermaidPluginState>("mermaid");
const MERMAID_FONT_FAMILY = '"Open Runde", system-ui, sans-serif';

const resolveMermaidTheme = (): NonNullable<MermaidConfig["theme"]> =>
  document.documentElement.classList.contains("dark") ? "dark" : "neutral";

const buildMermaidConfig = (
  theme: NonNullable<MermaidConfig["theme"]>,
  config?: MermaidConfig,
): MermaidConfig => ({
  ...config,
  startOnLoad: false,
  suppressErrorRendering: true,
  theme,
  themeVariables: {
    ...config?.themeVariables,
    fontFamily: MERMAID_FONT_FAMILY,
  },
  themeCSS: `${config?.themeCSS ?? ""}
    .label,
    .nodeLabel,
    .edgeLabel,
    text,
    tspan,
    foreignObject,
    foreignObject div,
    foreignObject span,
    .cluster-label text,
    .flowchart-label text,
    .label text {
      fill: var(--ui-text) !important;
      color: var(--ui-text) !important;
      font-family: ${MERMAID_FONT_FAMILY} !important;
    }
  `,
});

const waitForFontLoad = async () => {
  if (!("fonts" in document)) {
    return;
  }

  await document.fonts.ready;
};

interface MermaidPluginState {
  decorations: DecorationSet;
  editingId: string | null;
}

const getMermaidBlockKey = (id: string, pos: number) => `${id || "mermaid"}@${pos}`;

const isMermaidNode = (nodeName: string, language: unknown, expectedName: string) =>
  nodeName === expectedName && typeof language === "string" && MERMAID_LANG_RE.test(language);

const getSelectionMermaidId = (viewState: {
  selection: {
    $from: { depth: number; node: (depth: number) => any; before: (depth: number) => number };
  };
}) => {
  const { $from } = viewState.selection;
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);
    if (MERMAID_LANG_RE.test(node.attrs?.language || "")) {
      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const pos = depth > 0 ? $from.before(depth) : 0;
      return getMermaidBlockKey(id, pos);
    }
  }

  return null;
};

const createMermaidPlugin = ({
  name,
  debounce,
  mermaidConfig,
  classList,
}: {
  name: string;
  debounce: number;
  mermaidConfig?: MermaidConfig;
  classList: string[] | string;
}) => {
  const sourceCache = new Map<string, string>();
  const themeCache = new Map<string, string>();
  const renderTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const renderTokens = new Map<string, number>();
  const containers = new Map<string, MermaidContainer>();
  const positionByKey = new Map<string, number>();
  let activeTheme = resolveMermaidTheme();

  mermaid.initialize(buildMermaidConfig(activeTheme, mermaidConfig));

  let activeView: EditorView | null = null;

  const createContainer = (key: string) => {
    const container = document.createElement("div") as MermaidContainer;
    container.classList.add(...(Array.isArray(classList) ? classList : [classList]));
    container.dataset.mermaidId = key;
    container.title = "Click to edit Mermaid source";
    return container;
  };

  const renderError = (container: MermaidContainer, error: unknown) => {
    container.replaceChildren();
    container.classList.add("mermaid-container--error");

    const message = document.createElement("p");
    message.className = "mermaid-error";
    message.textContent = `Mermaid render error: ${
      error instanceof Error ? error.message : String(error)
    }`;

    container.appendChild(message);
  };

  const renderDiagram = async (
    key: string,
    source: string,
    token: number,
    theme: NonNullable<MermaidConfig["theme"]>,
  ) => {
    const container = containers.get(key);
    if (!container) {
      return;
    }

    try {
      await waitForFontLoad();
      mermaid.initialize(buildMermaidConfig(theme, mermaidConfig));

      const renderId = `mermaid_${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
      const { svg } = await mermaid.render(renderId, source);
      if (renderTokens.get(key) !== token) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = svg;
      const svgElement = wrapper.firstElementChild;

      container.replaceChildren();
      container.classList.remove("mermaid-container--error");
      if (svgElement) {
        container.appendChild(svgElement);
      }
    } catch (error) {
      if (renderTokens.get(key) !== token) {
        return;
      }

      renderError(container, error);
    } finally {
      renderTimers.delete(key);
    }
  };

  const buildDecorations = (doc: any, editingId: string | null, refresh = false) => {
    const decorations: Decoration[] = [];
    const liveIds = new Set<string>();
    const currentTheme = resolveMermaidTheme();

    activeTheme = currentTheme;

    positionByKey.clear();

    doc.descendants((node: any, pos: number) => {
      if (!isMermaidNode(node.type.name, node.attrs?.language, name)) {
        return;
      }

      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const key = getMermaidBlockKey(id, pos);
      const source = node.textContent.trim();
      if (!source) {
        return;
      }

      liveIds.add(key);
      positionByKey.set(key, pos);

      const isEditing = editingId === key;
      const container = containers.get(key) ?? createContainer(key);
      containers.set(key, container);

      container.classList.toggle("is-editing", isEditing);

      if (!container.__bound) {
        container.addEventListener("click", () => {
          const view = activeView;
          if (!view) {
            return;
          }

          const nodePos = positionByKey.get(key);
          if (typeof nodePos !== "number") {
            return;
          }

          const tr = view.state.tr
            .setMeta(MERMAID_PLUGIN_KEY, { editingId: key })
            .setSelection(TextSelection.create(view.state.doc, nodePos + 1));

          view.dispatch(tr);
          view.focus();
        });

        container.__bound = true;
      }

      decorations.push(
        Decoration.node(pos, pos + node.nodeSize, {
          class: isEditing
            ? "mermaid-source mermaid-source--editing"
            : "mermaid-source mermaid-source--hidden",
        }),
      );

      decorations.push(
        Decoration.widget(pos + node.nodeSize, container, {
          side: 1,
        }),
      );

      if (sourceCache.get(key) === source && themeCache.get(key) === currentTheme) {
        return;
      }

      sourceCache.set(key, source);
      themeCache.set(key, currentTheme);

      const existingTimer = renderTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const token = (renderTokens.get(key) ?? 0) + 1;
      renderTokens.set(key, token);

      const timeout = setTimeout(
        () => {
          void renderDiagram(key, source, token, currentTheme);
        },
        refresh ? 0 : debounce,
      );
      renderTimers.set(key, timeout);
    });

    for (const id of Array.from(containers.keys())) {
      if (liveIds.has(id)) {
        continue;
      }

      const timer = renderTimers.get(id);
      if (timer) {
        clearTimeout(timer);
      }

      containers.delete(id);
      renderTimers.delete(id);
      renderTokens.delete(id);
      sourceCache.delete(id);
      themeCache.delete(id);
      positionByKey.delete(id);
    }

    return DecorationSet.create(doc, decorations);
  };

  return new Plugin<MermaidPluginState>({
    key: MERMAID_PLUGIN_KEY,
    state: {
      init: (_, state) => {
        const editingId = getSelectionMermaidId(state);

        return {
          editingId,
          decorations: buildDecorations(state.doc, editingId),
        };
      },
      apply: (tr, pluginState, _oldState, newState) => {
        const meta = tr.getMeta(MERMAID_PLUGIN_KEY) as
          | { editingId?: string | null; refresh?: boolean }
          | undefined;
        const editingId =
          meta?.editingId !== undefined ? meta.editingId : getSelectionMermaidId(newState);

        if (!tr.docChanged && !tr.selectionSet && meta?.editingId === undefined && !meta?.refresh) {
          return pluginState;
        }

        return {
          editingId,
          decorations: buildDecorations(newState.doc, editingId, Boolean(meta?.refresh)),
        };
      },
    },
    props: {
      decorations: (state) => MERMAID_PLUGIN_KEY.getState(state)?.decorations ?? null,
    },
    view: (view) => {
      activeView = view;

      const themeObserver = new MutationObserver(() => {
        const viewRef = activeView;
        if (!viewRef) {
          return;
        }

        const nextTheme = resolveMermaidTheme();
        if (nextTheme === activeTheme) {
          return;
        }

        activeTheme = nextTheme;
        viewRef.dispatch(viewRef.state.tr.setMeta(MERMAID_PLUGIN_KEY, { refresh: true }));
      });

      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return {
        update: (nextView) => {
          activeView = nextView;
        },
        destroy: () => {
          themeObserver.disconnect();
          activeView = null;
          for (const timer of renderTimers.values()) {
            clearTimeout(timer);
          }
          renderTimers.clear();
        },
      };
    },
  });
};

interface CodeBlockLowlightMermaidOptions extends CodeBlockLowlightOptions {
  /**
   * The debounce delay in milliseconds for rendering the mermaid diagram after
   * the user stops typing.
   * @default 300
   */
  debounce?: number;

  /**
   * Configuration options for the mermaid library.
   */
  mermaidConfig?: MermaidConfig;
  /**
   * CSS classes to apply to the container
   */
  classList: string[] | string;
}

export const CodeBlockLowlightMermaid = CodeBlockLowlight.extend<CodeBlockLowlightMermaidOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight: {},
      languageClassPrefix: "language-",
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      defaultLanguage: null,
      enableTabIndentation: false,
      tabSize: 4,
      HTMLAttributes: {},
      debounce: 300,
      mermaidConfig: {},
      classList: "mermaid-container",
    };
  },
  addAttributes() {
    const parentAttrs = this.parent?.() ?? {};

    return {
      ...parentAttrs,
      id: {
        default: () => `m${crypto.randomUUID().slice(0, 8)}`,
        parseHTML: (element) =>
          element.getAttribute("data-id") || `m${crypto.randomUUID().slice(0, 8)}`,
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { "data-id": attributes.id };
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      createMermaidPlugin({
        name: this.name,
        classList: this.options.classList,
        mermaidConfig: this.options.mermaidConfig,
        debounce: this.options.debounce ?? 300,
      }),
    ];
  },
});
