import CodeBlockLowlight, {
  type CodeBlockLowlightOptions,
} from "@tiptap/extension-code-block-lowlight";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

type SpotifyContainer = HTMLElement & { __bound?: boolean };

const SPOTIFY_LANG_RE = /^spotify$/i;
const SPOTIFY_PLUGIN_KEY = new PluginKey<SpotifyPluginState>("spotify");

interface SpotifyPluginState {
  decorations: DecorationSet;
  editingId: string | null;
}

const getSpotifyBlockKey = (id: string, pos: number) => `${id || "spotify"}@${pos}`;

interface CodeBlockLowlightSpotifyOptions extends CodeBlockLowlightOptions {
  classList: string[] | string;
}

const isSpotifyNode = (nodeName: string, language: unknown, expectedName: string) =>
  nodeName === expectedName && typeof language === "string" && SPOTIFY_LANG_RE.test(language);

const getSelectionSpotifyId = (viewState: {
  selection: {
    $from: { depth: number; node: (depth: number) => any; before: (depth: number) => number };
  };
}) => {
  const { $from } = viewState.selection;
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);
    if (SPOTIFY_LANG_RE.test(node.attrs?.language || "")) {
      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const pos = depth > 0 ? $from.before(depth) : 0;
      return getSpotifyBlockKey(id, pos);
    }
  }

  return null;
};

const normalizeSpotifyEmbedUrl = (rawUrl: string) => {
  const source = rawUrl.trim();
  if (!source) {
    return null;
  }

  const spotifyUriMatch = source.match(
    /^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)$/i,
  );
  if (spotifyUriMatch) {
    const [, type, id] = spotifyUriMatch;
    return {
      embedUrl: `https://open.spotify.com/embed/${type.toLowerCase()}/${id}`,
      type: type.toLowerCase(),
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.endsWith("spotify.com")) {
    return null;
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  let type = parts[0]?.toLowerCase();
  let id = parts[1];

  if (type === "embed") {
    type = parts[1]?.toLowerCase();
    id = parts[2];
  }

  if (!type || !id) {
    return null;
  }

  const allowedTypes = new Set(["track", "album", "playlist", "artist", "episode", "show"]);
  if (!allowedTypes.has(type)) {
    return null;
  }

  return {
    embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
    type,
  };
};

const spotifyEmbedHeight = (type: string) => {
  if (type === "track" || type === "episode") {
    return 152;
  }

  return 352;
};

const createSpotifyPlugin = ({
  name,
  classList,
}: {
  name: string;
  classList: string[] | string;
}) => {
  const sourceCache = new Map<string, string>();
  const containers = new Map<string, SpotifyContainer>();
  const positionByKey = new Map<string, number>();

  let activeView: EditorView | null = null;

  const createContainer = (key: string) => {
    const container = document.createElement("div") as SpotifyContainer;
    container.classList.add(...(Array.isArray(classList) ? classList : [classList]));
    container.dataset.spotifyId = key;
    container.title = "Hover and use Edit to change Spotify URL";
    return container;
  };

  const createEditButton = (onClick: () => void) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "media-edit-button";
    button.title = "Edit Spotify URL";
    button.setAttribute("aria-label", "Edit Spotify URL");
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

  const renderError = (container: SpotifyContainer, message: string) => {
    container.replaceChildren();
    container.classList.add("spotify-container--error");

    const text = document.createElement("p");
    text.className = "spotify-error";
    text.textContent = message;
    container.appendChild(text);
  };

  const renderEmbed = (container: SpotifyContainer, rawUrl: string, onEdit: () => void) => {
    const normalized = normalizeSpotifyEmbedUrl(rawUrl);
    if (!normalized) {
      renderError(container, "Invalid Spotify URL. Use open.spotify.com links or spotify: URI.");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.className = "spotify-embed";
    iframe.src = normalized.embedUrl;
    iframe.width = "100%";
    iframe.height = String(spotifyEmbedHeight(normalized.type));
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("allowfullscreen", "");

    const editButton = createEditButton(onEdit);

    container.replaceChildren();
    container.classList.remove("spotify-container--error");
    container.appendChild(iframe);
    container.appendChild(editButton);
  };

  const buildDecorations = (doc: any, editingId: string | null) => {
    const decorations: Decoration[] = [];
    const liveIds = new Set<string>();

    positionByKey.clear();

    doc.descendants((node: any, pos: number) => {
      if (!isSpotifyNode(node.type.name, node.attrs?.language, name)) {
        return;
      }

      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const key = getSpotifyBlockKey(id, pos);
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
          .setMeta(SPOTIFY_PLUGIN_KEY, { editingId: key })
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
            ? "spotify-source spotify-source--editing"
            : "spotify-source spotify-source--hidden",
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

  return new Plugin<SpotifyPluginState>({
    key: SPOTIFY_PLUGIN_KEY,
    state: {
      init: (_, state) => {
        const editingId = getSelectionSpotifyId(state);

        return {
          editingId,
          decorations: buildDecorations(state.doc, editingId),
        };
      },
      apply: (tr, pluginState, _oldState, newState) => {
        const meta = tr.getMeta(SPOTIFY_PLUGIN_KEY) as { editingId?: string | null } | undefined;
        const editingId =
          meta?.editingId !== undefined ? meta.editingId : getSelectionSpotifyId(newState);

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
      decorations: (state) => SPOTIFY_PLUGIN_KEY.getState(state)?.decorations ?? null,
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

export const CodeBlockLowlightSpotify = CodeBlockLowlight.extend<CodeBlockLowlightSpotifyOptions>({
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
      classList: "spotify-container",
    };
  },
  addAttributes() {
    const parentAttrs = this.parent?.() ?? {};

    return {
      ...parentAttrs,
      id: {
        default: () => `s${crypto.randomUUID().slice(0, 8)}`,
        parseHTML: (element) =>
          element.getAttribute("data-id") || `s${crypto.randomUUID().slice(0, 8)}`,
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
      createSpotifyPlugin({
        name: this.name,
        classList: this.options.classList,
      }),
    ];
  },
});
