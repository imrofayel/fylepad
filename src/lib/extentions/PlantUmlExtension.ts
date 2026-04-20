import CodeBlockLowlight, {
  type CodeBlockLowlightOptions,
} from "@tiptap/extension-code-block-lowlight";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

type PlantUmlContainer = HTMLElement & { __bound?: boolean };

const PLANTUML_LANG_RE = /^(plantuml|puml|uml)$/i;
const PLANTUML_PLUGIN_KEY = new PluginKey<PlantUmlPluginState>("plantuml");
const DEFAULT_RENDER_ENDPOINT = "https://kroki.io/plantuml/svg";
const PLANTUML_FONT_FAMILY = "Open Runde";

const resolvePlantUmlTheme = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const buildPlantUmlThemeBlock = (theme: "dark" | "light") => {
  const textColor = theme === "dark" ? "#a1a1a1" : "#737373";
  const lineColor = theme === "dark" ? "#737373" : "#a1a1a1";

  return [
    "' Added by editor renderer for theme sync",
    "skinparam backgroundColor transparent",
    "skinparam shadowing false",
    `skinparam defaultFontName "${PLANTUML_FONT_FAMILY}"`,
    `skinparam defaultFontColor ${textColor}`,
    `skinparam ArrowColor ${lineColor}`,
    `skinparam LineColor ${lineColor}`,
    `skinparam BorderColor ${lineColor}`,
    `skinparam DiamondBorderColor ${lineColor}`,
    "skinparam DiamondBackgroundColor transparent",
    `skinparam DiamondFontColor ${textColor}`,
    `skinparam ActivityBorderColor ${lineColor}`,
    "skinparam ActivityBackgroundColor transparent",
    `skinparam ActivityFontColor ${textColor}`,
    `skinparam NoteBorderColor ${lineColor}`,
    "skinparam NoteBackgroundColor transparent",
    `skinparam NoteFontColor ${textColor}`,
    `skinparam SequenceLifeLineBorderColor ${lineColor}`,
    "skinparam SequenceLifeLineBackgroundColor transparent",
    `skinparam SequenceBoxBorderColor ${lineColor}`,
    "skinparam SequenceBoxBackgroundColor transparent",
    `skinparam SequenceGroupBorderColor ${lineColor}`,
    "skinparam SequenceGroupBackgroundColor transparent",
    `skinparam ParticipantBorderColor ${lineColor}`,
    "skinparam ParticipantBackgroundColor transparent",
    `skinparam ParticipantFontColor ${textColor}`,
    `skinparam ComponentBorderColor ${lineColor}`,
    "skinparam ComponentBackgroundColor transparent",
    `skinparam ComponentFontColor ${textColor}`,
    `skinparam NodeBorderColor ${lineColor}`,
    "skinparam NodeBackgroundColor transparent",
    `skinparam NodeFontColor ${textColor}`,
    `skinparam CloudBorderColor ${lineColor}`,
    "skinparam CloudBackgroundColor transparent",
    `skinparam CloudFontColor ${textColor}`,
    `skinparam FolderBorderColor ${lineColor}`,
    "skinparam FolderBackgroundColor transparent",
    `skinparam FolderFontColor ${textColor}`,
    `skinparam FrameBorderColor ${lineColor}`,
    "skinparam FrameBackgroundColor transparent",
    `skinparam FrameFontColor ${textColor}`,
    `skinparam ActorBorderColor ${lineColor}`,
    "skinparam ActorBackgroundColor transparent",
    `skinparam ActorFontColor ${textColor}`,
    `skinparam DatabaseBorderColor ${lineColor}`,
    "skinparam DatabaseBackgroundColor transparent",
    `skinparam DatabaseFontColor ${textColor}`,
    `skinparam DatabaseTitleFontColor ${textColor}`,
    `skinparam RectangleBorderColor ${lineColor}`,
    "skinparam RectangleBackgroundColor transparent",
    `skinparam RectangleFontColor ${textColor}`,
    `skinparam ClassBorderColor ${lineColor}`,
    "skinparam ClassBackgroundColor transparent",
    `skinparam ClassFontColor ${textColor}`,
    `skinparam PackageBorderColor ${lineColor}`,
    "skinparam PackageBackgroundColor transparent",
    `skinparam PackageFontColor ${textColor}`,
    "",
  ].join("\n");
};

const withPlantUmlTheme = (source: string, theme: "dark" | "light") => {
  const normalized = source.replace(/\r\n/g, "\n");
  const themeBlock = buildPlantUmlThemeBlock(theme);

  const startMatch = normalized.match(/^\s*@startuml[^\n]*$/im);
  if (!startMatch || startMatch.index === undefined) {
    return `${themeBlock}${normalized}`;
  }

  const insertAt = startMatch.index + startMatch[0].length;
  return `${normalized.slice(0, insertAt)}\n${themeBlock}${normalized.slice(insertAt)}`;
};

interface PlantUmlPluginState {
  decorations: DecorationSet;
  editingId: string | null;
}

interface CodeBlockLowlightPlantUmlOptions extends CodeBlockLowlightOptions {
  /**
   * The debounce delay in milliseconds for rendering the PlantUML diagram after
   * the user stops typing.
   * @default 300
   */
  debounce?: number;

  /**
   * HTTP endpoint that accepts plain PlantUML text and returns SVG.
   * @default "https://kroki.io/plantuml/svg"
   */
  renderEndpoint?: string;

  /**
   * Extra headers passed to the render request.
   */
  requestHeaders?: Record<string, string>;

  /**
   * CSS classes to apply to the rendered diagram container.
   */
  classList: string[] | string;
}

const isPlantUmlNode = (nodeName: string, language: unknown, expectedName: string) =>
  nodeName === expectedName && typeof language === "string" && PLANTUML_LANG_RE.test(language);

const getSelectionPlantUmlId = (viewState: {
  selection: { $from: { depth: number; node: (depth: number) => any } };
}) => {
  const { $from } = viewState.selection;
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);
    if (PLANTUML_LANG_RE.test(node.attrs?.language || "") && typeof node.attrs?.id === "string") {
      return node.attrs.id as string;
    }
  }

  return null;
};

const waitForFontLoad = async () => {
  if (!("fonts" in document)) {
    return;
  }

  await document.fonts.ready;
};

const createPlantUmlPlugin = ({
  name,
  debounce,
  renderEndpoint,
  requestHeaders,
  classList,
}: {
  name: string;
  debounce: number;
  renderEndpoint: string;
  requestHeaders?: Record<string, string>;
  classList: string[] | string;
}) => {
  const sourceCache = new Map<string, string>();
  const themeCache = new Map<string, "dark" | "light">();
  const renderTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const renderTokens = new Map<string, number>();
  const renderControllers = new Map<string, AbortController>();
  const containers = new Map<string, PlantUmlContainer>();
  const positionById = new Map<string, number>();
  let activeTheme = resolvePlantUmlTheme();

  let activeView: EditorView | null = null;

  const createContainer = (id: string) => {
    const container = document.createElement("div") as PlantUmlContainer;
    container.classList.add(...(Array.isArray(classList) ? classList : [classList]));
    container.dataset.plantumlId = id;
    container.title = "Click to edit PlantUML source";
    return container;
  };

  const renderError = (container: PlantUmlContainer, error: unknown) => {
    container.replaceChildren();
    container.classList.add("plantuml-container--error");

    const message = document.createElement("p");
    message.className = "plantuml-error";
    message.textContent = `PlantUML render error: ${
      error instanceof Error ? error.message : String(error)
    }`;

    container.appendChild(message);
  };

  const fetchPlantUmlSvg = async (source: string, signal: AbortSignal) => {
    const response = await fetch(renderEndpoint, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...requestHeaders,
      },
      body: source,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const svg = await response.text();
    if (!svg.includes("<svg")) {
      throw new Error("Renderer did not return valid SVG output.");
    }

    return svg;
  };

  const renderDiagram = async (
    id: string,
    source: string,
    token: number,
    theme: "dark" | "light",
  ) => {
    const container = containers.get(id);
    if (!container) {
      return;
    }

    try {
      await waitForFontLoad();

      const prevController = renderControllers.get(id);
      if (prevController) {
        prevController.abort();
      }

      const controller = new AbortController();
      renderControllers.set(id, controller);

      const themedSource = withPlantUmlTheme(source, theme);
      const svg = await fetchPlantUmlSvg(themedSource, controller.signal);
      if (renderTokens.get(id) !== token) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = svg;
      const svgElement = wrapper.querySelector("svg");

      container.replaceChildren();
      container.classList.remove("plantuml-container--error");

      if (svgElement) {
        container.appendChild(svgElement);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      if (renderTokens.get(id) !== token) {
        return;
      }

      renderError(container, error);
    } finally {
      renderTimers.delete(id);
    }
  };

  const buildDecorations = (doc: any, editingId: string | null, refresh = false) => {
    const decorations: Decoration[] = [];
    const liveIds = new Set<string>();
    const currentTheme = resolvePlantUmlTheme();

    activeTheme = currentTheme;

    positionById.clear();

    doc.descendants((node: any, pos: number) => {
      if (!isPlantUmlNode(node.type.name, node.attrs?.language, name)) {
        return;
      }

      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const source = node.textContent.trim();
      if (!id || !source) {
        return;
      }

      liveIds.add(id);
      positionById.set(id, pos);

      const isEditing = editingId === id;
      const container = containers.get(id) ?? createContainer(id);
      containers.set(id, container);

      container.classList.toggle("is-editing", isEditing);

      if (!container.__bound) {
        container.addEventListener("click", () => {
          const view = activeView;
          if (!view) {
            return;
          }

          const nodePos = positionById.get(id);
          if (typeof nodePos !== "number") {
            return;
          }

          const tr = view.state.tr
            .setMeta(PLANTUML_PLUGIN_KEY, { editingId: id })
            .setSelection(TextSelection.create(view.state.doc, nodePos + 1));

          view.dispatch(tr);
          view.focus();
        });

        container.__bound = true;
      }

      decorations.push(
        Decoration.node(pos, pos + node.nodeSize, {
          class: isEditing
            ? "plantuml-source plantuml-source--editing"
            : "plantuml-source plantuml-source--hidden",
        }),
      );

      decorations.push(
        Decoration.widget(pos + node.nodeSize, container, {
          side: 1,
        }),
      );

      if (sourceCache.get(id) === source && themeCache.get(id) === currentTheme) {
        return;
      }

      sourceCache.set(id, source);
      themeCache.set(id, currentTheme);

      const existingTimer = renderTimers.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const token = (renderTokens.get(id) ?? 0) + 1;
      renderTokens.set(id, token);

      const timeout = setTimeout(
        () => {
          void renderDiagram(id, source, token, currentTheme);
        },
        refresh ? 0 : debounce,
      );
      renderTimers.set(id, timeout);
    });

    for (const id of Array.from(containers.keys())) {
      if (liveIds.has(id)) {
        continue;
      }

      const timer = renderTimers.get(id);
      if (timer) {
        clearTimeout(timer);
      }

      const controller = renderControllers.get(id);
      if (controller) {
        controller.abort();
      }

      containers.delete(id);
      renderTimers.delete(id);
      renderTokens.delete(id);
      renderControllers.delete(id);
      sourceCache.delete(id);
      themeCache.delete(id);
      positionById.delete(id);
    }

    return DecorationSet.create(doc, decorations);
  };

  return new Plugin<PlantUmlPluginState>({
    key: PLANTUML_PLUGIN_KEY,
    state: {
      init: (_, state) => {
        const editingId = getSelectionPlantUmlId(state);

        return {
          editingId,
          decorations: buildDecorations(state.doc, editingId),
        };
      },
      apply: (tr, pluginState, _oldState, newState) => {
        const meta = tr.getMeta(PLANTUML_PLUGIN_KEY) as
          | { editingId?: string | null; refresh?: boolean }
          | undefined;
        const editingId =
          meta?.editingId !== undefined ? meta.editingId : getSelectionPlantUmlId(newState);

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
      decorations: (state) => PLANTUML_PLUGIN_KEY.getState(state)?.decorations ?? null,
    },
    view: (view) => {
      activeView = view;

      const themeObserver = new MutationObserver(() => {
        const viewRef = activeView;
        if (!viewRef) {
          return;
        }

        const nextTheme = resolvePlantUmlTheme();
        if (nextTheme === activeTheme) {
          return;
        }

        activeTheme = nextTheme;
        viewRef.dispatch(viewRef.state.tr.setMeta(PLANTUML_PLUGIN_KEY, { refresh: true }));
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

          for (const controller of renderControllers.values()) {
            controller.abort();
          }
          renderControllers.clear();
        },
      };
    },
  });
};

export const CodeBlockLowlightPlantUml = CodeBlockLowlight.extend<CodeBlockLowlightPlantUmlOptions>(
  {
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
        renderEndpoint: DEFAULT_RENDER_ENDPOINT,
        requestHeaders: {},
        classList: "plantuml-container",
      };
    },
    addAttributes() {
      const parentAttrs = this.parent?.() ?? {};

      return {
        ...parentAttrs,
        id: {
          default: () => `p${crypto.randomUUID().slice(0, 8)}`,
          parseHTML: (element) =>
            element.getAttribute("data-id") || `p${crypto.randomUUID().slice(0, 8)}`,
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
        createPlantUmlPlugin({
          name: this.name,
          classList: this.options.classList,
          debounce: this.options.debounce ?? 300,
          renderEndpoint: this.options.renderEndpoint ?? DEFAULT_RENDER_ENDPOINT,
          requestHeaders: this.options.requestHeaders,
        }),
      ];
    },
  },
);
