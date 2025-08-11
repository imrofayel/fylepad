import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { TabLinkView, type TabLinkProps } from "./view";

export interface TabLinkItem {
  id: string;
  name: string;
  color?: string;
  group?: string;
}

export interface TabLinkSuggestionOptions {
  tabData?: TabLinkItem[];
}

export const TabLinkSuggestion = Extension.create<TabLinkSuggestionOptions>({
  name: "tabLinkSuggestion",

  addOptions() {
    return {
      tabData: [],
    };
  },

  addStorage() {
    return {
      items: this.options.tabData || [],
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "[[",
        allowSpaces: true,
        pluginKey: new PluginKey("tabLinkSuggestion"),
        command: ({ editor, range, props }: { 
          editor: any; 
          range: any; 
          props: TabLinkItem 
        }) => {
          // Remove the trigger characters and insert tab link
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
        allow: ({ editor, range }) => {
          return true;
        },
        startOfLine: false,
        render: () => {
          let view: TabLinkView | null = null;

          return {
            onStart: (props: TabLinkProps) => {
              view = new TabLinkView(props);
            },
            onUpdate: (props: TabLinkProps) => {
              view?.update(props);
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (!view?.component?.ref) return false;

              const { event } = props;
              const menuComponent = view.component.ref;

              if (event.key === "ArrowUp") {
                menuComponent.previousItem?.();
                return true;
              }

              if (event.key === "ArrowDown") {
                menuComponent.nextItem?.();
                return true;
              }

              if (event.key === "Enter" || event.key === "Tab") {
                menuComponent.selectCurrentItem?.();
                return true;
              }

              if (event.key === "Escape") {
                view.destroy();
                return true;
              }

              return false;
            },
            onExit: () => {
              view?.destroy();
              view = null;
            },
          };
        },
      }),
    ];
  },

  onUpdate() {
    // Update storage items when options change
    if (this.options.tabData) {
      this.storage.items = this.options.tabData;
    }
  },
});

export default TabLinkSuggestion;
