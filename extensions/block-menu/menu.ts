import { Editor, Extension, findParentNode } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Suggestion } from "@tiptap/suggestion";
import { BlockMenuView, type BlockMenuViewItem } from "./view";

export interface BlockMenuItem {
  id: string;
  name: string;
  icon: string;
  keywords: string;
  shortcut?: string;
  action: (editor: Editor) => void;
}

export interface BlockMenuItemStorage {
  blockMenu: {
    hide?: boolean;
    items: BlockMenuItem | Array<BlockMenuItem>;
  };
}

export interface BlockMenuOptions {
  items: Array<string>;
  dictionary: {
    lineEmpty: string;
    lineSlash: string;
    queryEmpty: string;
  };
}

export const BlockMenu = Extension.create<BlockMenuOptions>({
  name: "blockMenu",
  addOptions() {
    return {
      items: [
        "heading1",
        "heading2",
        "heading3",
        "|",
        "orderedList",
        "bulletList",
        "taskList",
        "|",
        "image",
        "audio",
        "video",
        "|",
        "blockquote",
        "codeBlock",
        "mathBlock",
        "mermaid",
        "plantuml",
        "|",
        "horizontalRule",
        "table",
        "details",
        "embed",
      ],
      dictionary: {
        lineEmpty: "Enter '/' to insert block...",
        lineSlash: "Continue typing to filter...",
        queryEmpty: "No results found",
      },
    };
  },
  addProseMirrorPlugins() {
    const mappings = new Map<string, BlockMenuItem>();
    for (const storage of Object.values(this.editor.storage as Record<string, BlockMenuItemStorage>)) {
      if (storage?.blockMenu) {
        if (storage.blockMenu.items) {
          const menus = Array.isArray(storage.blockMenu.items) ? storage.blockMenu.items : [storage.blockMenu.items];
          for (const menu of menus) {
            mappings.set(menu.id, menu);
          }
        }
      }
    }
    if (!mappings.size || !this.options.items.length) {
      return [];
    }
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey(`${this.name}-suggestion`),
        char: "/",
        items: ({ query }) => {
          const filtered: Array<BlockMenuViewItem> = [];
          for (const name of this.options.items) {
            if (name === "|") {
              filtered.push(name);
              continue;
            }
            const item = mappings.get(name);
            if (!item) {
              continue;
            }
            if (query !== "") {
              const q = query.toLowerCase();
              if (!item.name.toLowerCase().includes(q) && !item.keywords.toLowerCase().includes(q)) {
                continue;
              }
            }
            filtered.push({
              id: name,
              name: item.name,
              icon: item.icon,
              shortcut: item.shortcut,
              action: (editor) => {
                // clear search
                const { state, dispatch } = editor.view;
                const from = state.selection.$from;
                const tr = state.tr.deleteRange(from.start(), from.pos);
                dispatch(tr);
                // command
                item.action(editor);
                // focus
                editor.view.focus();
              },
            });
          }
          const items: Array<BlockMenuViewItem> = [];
          for (let i = 0; i < filtered.length; i++) {
            const item = filtered[i];
            if (item === "|") {
              if (i === 0 || i === filtered.length - 1) {
                continue;
              }
              if (filtered[i + 1] === "|") {
                continue;
              }
              if (items.length === 0) {
                continue;
              }
              if (items[items.length - 1] === "|") {
                continue;
              }
            }
            items.push(item);
          }
          return items;
        },
        render: BlockMenuView.create({
          editor: this.editor,
          dictionary: {
            empty: this.options.dictionary.queryEmpty,
          },
        }),
      }),
      new Plugin({
        key: new PluginKey(`${this.name}-placeholder`),
        props: {
          decorations: (state) => {
            const parent = findParentNode(node => node.type.name === "paragraph")(state.selection);
            if (!parent) {
              return;
            }

            const decorations: Array<Decoration> = [];
            const isEmpty = parent && parent.node.content.size === 0;
            const isSlash = parent && parent.node.textContent === "/";
            const isTopLevel = state.selection.$from.depth === 1;

            if (isTopLevel) {
              if (isEmpty) {
                decorations.push(Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                  "class": "ProseMirror-bm-placeholder",
                  "data-empty": this.options.dictionary.lineEmpty,
                }));
              }
              if (isSlash) {
                decorations.push(Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                  "class": "ProseMirror-bm-placeholder",
                  "data-empty": ` ${this.options.dictionary.lineSlash}`,
                }));
              }
              return DecorationSet.create(state.doc, decorations);
            }

            return null;
          },
        },
      }),
    ];
  },
});