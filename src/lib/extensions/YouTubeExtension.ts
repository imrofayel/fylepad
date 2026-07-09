import CodeBlockLowlight, {
  type CodeBlockLowlightOptions,
} from "@tiptap/extension-code-block-lowlight";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

type YouTubeContainer = HTMLElement & { __bound?: boolean };

const YOUTUBE_LANG_RE = /^youtube$/i;
const YOUTUBE_PLUGIN_KEY = new PluginKey<YouTubePluginState>("youtube");

interface YouTubePluginState {
  decorations: DecorationSet;
  editingId: string | null;
}

interface CodeBlockLowlightYouTubeOptions extends CodeBlockLowlightOptions {
  classList: string[] | string;
}

const getYouTubeBlockKey = (id: string, pos: number) => `${id || "youtube"}@${pos}`;

const isYouTubeNode = (nodeName: string, language: unknown, expectedName: string) =>
  nodeName === expectedName && typeof language === "string" && YOUTUBE_LANG_RE.test(language);

const getSelectionYouTubeId = (viewState: {
  selection: {
    $from: { depth: number; node: (depth: number) => any; before: (depth: number) => number };
  };
}) => {
  const { $from } = viewState.selection;
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);
    if (YOUTUBE_LANG_RE.test(node.attrs?.language || "")) {
      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const pos = depth > 0 ? $from.before(depth) : 0;
      return getYouTubeBlockKey(id, pos);
    }
  }

  return null;
};

const normalizeYouTubeEmbedUrl = (rawUrl: string) => {
  const source = rawUrl.trim();
  if (!source) {
    return null;
  }

  const urlMatch = source.match(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)\/.+$/i);
  const isVideoIdOnly = /^[A-Za-z0-9_-]{11}$/.test(source);

  let videoId: string | null = null;

  if (isVideoIdOnly) {
    videoId = source;
  } else if (urlMatch) {
    let parsed: URL;
    try {
      parsed = new URL(source.startsWith("http") ? source : `https://${source}`);
    } catch {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    if (host.endsWith("youtu.be")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
    } else if (host.endsWith("youtube.com")) {
      const pathname = parsed.pathname.toLowerCase();
      if (pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1] || null;
      } else if (pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1] || null;
      }
    }
  }

  if (!videoId) {
    return null;
  }

  return {
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    videoId,
  };
};

const createYouTubePlugin = ({
  name,
  classList,
}: {
  name: string;
  classList: string[] | string;
}) => {
  const sourceCache = new Map<string, string>();
  const containers = new Map<string, YouTubeContainer>();
  const positionByKey = new Map<string, number>();

  let activeView: EditorView | null = null;

  const createContainer = (key: string) => {
    const container = document.createElement("div") as YouTubeContainer;
    container.classList.add(...(Array.isArray(classList) ? classList : [classList]));
    container.dataset.youtubeId = key;
    container.title = "Hover and use Edit to change YouTube URL";
    return container;
  };

  const createEditButton = (onClick: () => void) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "media-edit-button";
    button.title = "Edit YouTube URL";
    button.setAttribute("aria-label", "Edit YouTube URL");
    button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h4L18.5 9.5a2.828 2.828 0 1 0-4-4L4 16zm9.5-13.5l4 4"/></svg>
    `;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  };

  const renderError = (container: YouTubeContainer, message: string) => {
    container.replaceChildren();
    container.classList.add("youtube-container--error");

    const text = document.createElement("p");
    text.className = "youtube-error";
    text.textContent = message;
    container.appendChild(text);
  };

  const renderEmbed = (container: YouTubeContainer, rawUrl: string, onEdit: () => void) => {
    const normalized = normalizeYouTubeEmbedUrl(rawUrl);
    if (!normalized) {
      renderError(
        container,
        "Invalid YouTube URL or video id. Use youtube.com, youtu.be, shorts, or a 11-char video id.",
      );
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.className = "youtube-embed";
    iframe.src = `${normalized.embedUrl}?rel=0`;
    iframe.width = "100%";
    iframe.height = "352";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("allowfullscreen", "");

    const editButton = createEditButton(onEdit);

    container.replaceChildren();
    container.classList.remove("youtube-container--error");
    container.appendChild(iframe);
    container.appendChild(editButton);
  };

  const buildDecorations = (doc: any, editingId: string | null) => {
    const decorations: Decoration[] = [];
    const liveIds = new Set<string>();

    positionByKey.clear();

    doc.descendants((node: any, pos: number) => {
      if (!isYouTubeNode(node.type.name, node.attrs?.language, name)) {
        return;
      }

      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const key = getYouTubeBlockKey(id, pos);
      const source = node.textContent.trim();
      if (!source) {
        return;
      }

      liveIds.add(key);
      positionByKey.set(key, pos);

      const isEditing = editingId === key && !!activeView?.hasFocus();
      const container = containers.get(key) ?? createContainer(key);
      containers.set(key, container);

      container.classList.toggle("is-editing", isEditing);

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
          .setMeta(YOUTUBE_PLUGIN_KEY, { editingId: key })
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
          class: isEditing
            ? "youtube-source youtube-source--editing"
            : "youtube-source youtube-source--hidden",
        }),
      );

      decorations.push(
        Decoration.widget(pos + node.nodeSize, container, {
          side: 1,
        }),
      );

      if (sourceCache.get(key) !== source) {
        sourceCache.set(key, source);
        renderEmbed(container, source, openEditor);
      }
    });

    for (const id of Array.from(containers.keys())) {
      if (liveIds.has(id)) {
        continue;
      }

      containers.delete(id);
      sourceCache.delete(id);
      positionByKey.delete(id);
    }

    return DecorationSet.create(doc, decorations);
  };

  return new Plugin<YouTubePluginState>({
    key: YOUTUBE_PLUGIN_KEY,
    state: {
      init: (_, state) => {
        const editingId = getSelectionYouTubeId(state);

        return {
          editingId,
          decorations: buildDecorations(state.doc, editingId),
        };
      },
      apply: (tr, pluginState, _oldState, newState) => {
        const meta = tr.getMeta(YOUTUBE_PLUGIN_KEY) as { editingId?: string | null } | undefined;
        const editingId =
          meta?.editingId !== undefined ? meta.editingId : getSelectionYouTubeId(newState);

        if (!tr.docChanged && !tr.selectionSet && meta?.editingId === undefined) {
          return pluginState;
        }

        return {
          editingId,
          decorations: buildDecorations(newState.doc, editingId),
        };
      },
    },
    props: {
      decorations: (state) => YOUTUBE_PLUGIN_KEY.getState(state)?.decorations ?? null,
    },
    view: (view) => {
      activeView = view;
      return {
        update: (nextView) => {
          activeView = nextView;
        },
        destroy: () => {
          activeView = null;
        },
      };
    },
  });
};

export const CodeBlockLowlightYouTube = CodeBlockLowlight.extend<CodeBlockLowlightYouTubeOptions>({
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
      classList: "youtube-container",
    };
  },
  addAttributes() {
    const parentAttrs = this.parent?.() ?? {};

    return {
      ...parentAttrs,
      id: {
        default: () => `y${crypto.randomUUID().slice(0, 8)}`,
        parseHTML: (element) =>
          element.getAttribute("data-id") || `y${crypto.randomUUID().slice(0, 8)}`,
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
      createYouTubePlugin({
        name: this.name,
        classList: this.options.classList,
      }),
    ];
  },
});
