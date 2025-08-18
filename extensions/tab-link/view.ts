import type { Editor } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import type { Range } from "@tiptap/core";
import { VueRenderer } from "@tiptap/vue-3";
import tippy, { type Instance } from "tippy.js";
import TabLinkMenu from "~/components/tabLinkMenu.vue";

export interface TabLinkItem {
  id: string;
  name: string;
  color?: string;
  group?: string;
}

export interface TabLinkProps {
  editor: Editor;
  range: Range;
  query: string;
  clientRect?: (() => DOMRect | null) | null;
}

export class TabLinkView {
  public editor: Editor;
  public range: Range;
  public query: string;
  public component: VueRenderer;
  public popup: Instance | undefined;

  constructor({ editor, range, query, clientRect }: TabLinkProps) {
    this.editor = editor;
    this.range = range;
    this.query = query;

    this.component = new VueRenderer(TabLinkMenu, {
      props: {
        items: this.getFilteredItems(),
        query: this.query,
        onSelect: this.selectItem.bind(this),
      },
      editor: this.editor,
    });

    if (!clientRect) {
      return;
    }

    this.popup = tippy(document.body as Element, {
      getReferenceClientRect: null,
      appendTo: () => document.body,
      content: this.component.element,
      showOnCreate: true,
      interactive: true,
      trigger: "manual",
      placement: "bottom-start",
      theme: "tab-link-menu",
    });

    // @ts-expect-error
    this.popup.setProps({ getReferenceClientRect: clientRect });
  }

  getFilteredItems(): TabLinkItem[] {
    const storage = this.editor.extensionManager.extensions.find(
      ext => ext.name === "tabLinkSuggestion"
    )?.storage;

    if (!storage?.items) {
      return [];
    }

    const items: TabLinkItem[] = storage.items;
    
    if (!this.query) {
      return items;
    }

    const query = this.query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.group?.toLowerCase().includes(query)
    );
  }

  selectItem(item: TabLinkItem) {
    // Remove the trigger characters and any query text
    const { from } = this.range;
    const to = this.editor.state.selection.from;
    
    this.editor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent({
        type: "tabLink",
        attrs: {
          id: item.id,
          label: item.name,
          color: item.color,
          group: item.group,
        },
      })
      .run();

    this.destroy();
  }

  update(props: Partial<TabLinkProps>) {
    if (props.query !== undefined) {
      this.query = props.query;
      this.component.updateProps({
        items: this.getFilteredItems(),
        query: this.query,
      });
    }

    if (props.range) {
      this.range = props.range;
    }
  }

  destroy() {
    this.popup?.destroy();
    this.component?.destroy();
  }
}

export default TabLinkView;
