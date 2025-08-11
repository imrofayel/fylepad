import { Editor, Extension, findParentNode } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Suggestion } from "@tiptap/suggestion";
import { TabLinkMenuView, type TabLinkMenuViewItem } from "./view";

export interface TabLinkMenuItem {
  id: string;
  title: string;
  color?: string;
  preview?: string;
  index: number;
}

export interface TabLinkMenuOptions {
  getTabs: () => any[];
  getCurrentTabIndex: () => number;
  onTabSelect: (tabIndex: number) => void;
  dictionary: {
    lineEmpty: string;
    queryEmpty: string;
  };
}

export const TabLinkMenu = Extension.create<TabLinkMenuOptions>({
  name: "tabLinkMenu",
  
  addOptions() {
    return {
      getTabs: () => [],
      getCurrentTabIndex: () => 0,
      onTabSelect: () => {},
      dictionary: {
        lineEmpty: "Type '[[' to link to a tab...",
        queryEmpty: "No tabs found",
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey(`${this.name}-suggestion`),
        char: "[[",
        items: ({ query }) => {
          const tabs = this.options.getTabs();
          const currentTabIndex = this.options.getCurrentTabIndex();
          
          const filtered: Array<TabLinkMenuViewItem> = [];
          
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            
            // Skip current tab
            if (i === currentTabIndex) continue;
            
            // Extract preview text from content
            let preview = '';
            if (tab.content && tab.content.content) {
              const textContent = this.extractTextFromContent(tab.content);
              preview = textContent.substring(0, 100);
            }
            
            const item: TabLinkMenuItem = {
              id: tab.id || i.toString(),
              title: tab.title || 'Untitled',
              color: tab.color,
              preview,
              index: i,
            };
            
            // Filter by query
            if (query !== "") {
              const q = query.toLowerCase();
              if (!item.title.toLowerCase().includes(q) && 
                  (!item.preview || !item.preview.toLowerCase().includes(q))) {
                continue;
              }
            }
            
            filtered.push({
              ...item,
              action: () => {
                // Insert tab link
                const { state, dispatch } = this.editor.view;
                const from = state.selection.$from;
                
                // Clear the [[ trigger
                const tr = state.tr.deleteRange(from.start(), from.pos);
                
                // Insert the tab link
                tr.insert(from.start(), state.schema.nodes.tabLink.create({
                  id: item.id,
                  label: item.title,
                }));
                
                dispatch(tr);
                this.editor.view.focus();
              },
            });
          }
          
          return filtered;
        },
        render: TabLinkMenuView.create({
          editor: this.editor,
          dictionary: {
            empty: this.options.dictionary.queryEmpty,
          },
        }),
      }),
    ];
  },

  addCommands() {
    return {};
  },

  // Helper method to extract text from Tiptap content
  extractTextFromContent(content: any): string {
    if (!content) return '';
    
    let text = '';
    
    const traverse = (node: any) => {
      if (node.type === 'text' && node.text) {
        text += node.text + ' ';
      } else if (node.content) {
        node.content.forEach(traverse);
      }
    };
    
    if (content.content) {
      content.content.forEach(traverse);
    }
    
    return text.trim();
  },
});
