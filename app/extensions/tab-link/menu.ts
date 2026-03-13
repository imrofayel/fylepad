import type { Editor } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type { TabData } from "../../types/tab";

export interface TabLinkItem {
  id: string;
  name: string;
  color?: string;
  group?: string;
}

export interface TabLinkStorage {
  tabLinkMenu: {
    items: TabLinkItem[];
    triggerCharacter: string;
  };
}

export const TabLinkMenu = Extension.create<{
  tabData?: TabData[]
}, TabLinkStorage>({
  name: "tabLinkMenu",

  addOptions() {
    return {
      tabData: [],
      suggestion: {
        char: "[[",
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: TabLinkItem }) => {
          // Remove the trigger characters
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: "tabLink",
              attrs: {
                id: props.id,
                label: props.name,
                color: props.color,
                group: props.group,
              },
            })
            .run();
        },
      },
    };
  },

  addStorage() {
    return {
      tabLinkMenu: {
        items: [],
        triggerCharacter: "[[",
      },
    } satisfies TabLinkStorage;
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },

  onUpdate() {
    // Update items from extension options
    if (this.options.tabData) {
      this.storage.tabLinkMenu.items = this.options.tabData.map((tab: TabData) => ({
        id: tab.id,
        name: tab.title || "Untitled",
        color: tab.color,
        group: tab.group,
      }));
    }
  },
});

export default TabLinkMenu;
