import { Editor, type Range } from "@tiptap/core";
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import tippy, { type Instance, type Props } from "tippy.js";

export type BlockMenuViewItem = "|" | {
  id: string;
  name: string;
  icon?: string;
  shortcut?: string;
  action: (editor: Editor) => void;
};

export interface BlockMenuViewOptions {
  editor: Editor;
  tippy?: Partial<Props>;
  onInit?: (props: { editor: Editor; view: BlockMenuView; range: Range; root: HTMLElement }) => void;
  onMount?: (props: { editor: Editor; view: BlockMenuView; range: Range; root: HTMLElement }) => void;
  onUpdate?: (props: { editor: Editor; view: BlockMenuView; range: Range; root: HTMLElement }) => void;
  onDestroy?: (props: { editor: Editor; view: BlockMenuView; range: Range; root: HTMLElement }) => void;
  classes?: Array<string>;
  attributes?: Record<string, string>;
  dictionary?: { empty?: string };
}

export class BlockMenuView implements ReturnType<NonNullable<SuggestionOptions["render"]>> {
  private readonly editor: Editor;
  private readonly options: BlockMenuViewOptions;

  private _popover: Instance | undefined;
  private _element: HTMLElement | undefined;
  private _index: number | undefined;
  private _nodes: Array<HTMLElement> | undefined;
  private _items: Array<BlockMenuViewItem> | undefined;

  public static create(options: BlockMenuViewOptions) {
    return () => new BlockMenuView(options);
  }

  constructor(options: BlockMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
  }

  public onStart(props: SuggestionProps) {
    // Reset
    this._index = 0;
    this._nodes = [];
    this._items = [];

    // Create root element
    this._element = document.createElement("div");
    this._element.classList.add("ProseMirror-bm");
    for (const clazz of this.options.classes ?? []) {
      this._element.classList.add(clazz);
    }
    for (const [key, val] of Object.entries(this.options.attributes ?? {})) {
      this._element.setAttribute(key, val);
    }

    // On init
    if (this.options.onInit) {
      this.options.onInit({
        view: this,
        root: this._element,
        range: props.range,
        editor: this.editor,
      });
    }

    // Create popover instance
    this._popover = tippy(document.body, {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this._element,
      arrow: false,
      interactive: true,
      theme: "ProseMirror",
      animation: "shift-away",
      trigger: "manual",
      placement: "top-start",
      maxWidth: "none",
      ...this.options.tippy,
      onMount: (i) => {
        if (this.options.tippy?.onMount) {
          this.options.tippy.onMount(i);
        }
        if (this._element && this.options.onMount) {
          this.options.onMount({
            view: this,
            root: this._element,
            range: props.range,
            editor: this.editor,
          });
        }
      },
    });
    this.onUpdate(props);
  }

  public onUpdate(props: SuggestionProps) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._nodes === undefined || this._items === undefined) {
      return;
    }

    // Reset
    this._items = props.items;

    // On update
    if (this.options.onUpdate) {
      this.options.onUpdate({
        view: this,
        root: this._element,
        range: props.range,
        editor: this.editor,
      });
    }

    // Render items
    this._render();

    // Set client rect
    // @ts-expect-error
    this._popover.setProps({ getReferenceClientRect: props.clientRect });
  }

  public onKeyDown(props: SuggestionKeyDownProps) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._nodes === undefined || this._items === undefined) {
      return false;
    }

    if (props.event.key === "Escape") {
      if (this._popover) {
        this._popover.hide();
      }
      return true;
    }
    if (props.event.key === "Enter") {
      const item = this._items[this._index];
      const node = this._nodes[this._index];
      if (item && node && typeof item !== "string" && item.action) {
        item.action(this.editor);
      }
      return true;
    }
    if (props.event.key === "ArrowUp") {
      const prev = this._index - 1;
      const index = this._items[prev] && typeof this._items[prev] === "string" ? prev - 1 : prev;
      this._select(index < 0 ? this._items.length - 1 : index, true);
      return true;
    }
    if (props.event.key === "ArrowDown") {
      const next = this._index + 1;
      const index = this._items[next] && typeof this._items[next] === "string" ? next + 1 : next;
      this._select(index >= this._items.length ? 0 : index, true);
      return true;
    }
    return false;
  }

  public onExit(props: SuggestionProps) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._nodes === undefined || this._items === undefined) {
      return;
    }

    this._popover.hide();
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        root: this._element,
        range: props.range,
        editor: this.editor,
      });
    }

    this._popover.destroy();
    this._element.remove();
    this._index = undefined;
    this._items = undefined;
    this._element = undefined;
    this._popover = undefined;
  }

  private _select(index: number, scroll?: boolean) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._nodes === undefined || this._items === undefined) {
      return;
    }

    // Ensure index available
    this._index = index;
    this._index = Math.max(this._index, 0);
    this._index = Math.min(this._index, Math.max(0, this._items.length - 1));

    for (let i = 0; i < this._nodes.length; i++) {
      if (i === this._index) {
        this._nodes[i].setAttribute("data-active", "true");
      } else {
        this._nodes[i].removeAttribute("data-active");
      }
    }

    if (scroll) {
      // noinspection JSIgnoredPromiseFromCall
      scrollIntoView(this._nodes[this._index], {
        block: "center",
        scrollMode: "if-needed",
        boundary: parent => parent !== this._element,
      });
    }
  }

  private _render() {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._nodes === undefined || this._items === undefined) {
      return;
    }

    // Remove previous elements
    while (this._element.firstChild) {
      this._element.removeChild(this._element.firstChild);
    }

    // Ensure index available
    this._index = Math.max(this._index, 0);
    this._index = Math.min(this._index, Math.max(0, this._items.length - 1));

    // Make new elements
    if (this._items.length) {
      this._nodes = [];
      for (let i = 0; i < this._items.length; i++) {
        const item = this._items[i];
        if (item === "|") {
          const root = document.createElement("span");
          root.classList.add("ProseMirror-bm-divider");
          this._nodes.push(root);
        } else {
          const root = document.createElement("button");
          root.name = item.id;
          root.classList.add("ProseMirror-bm-button");
          // icon
          if (item.icon) {
            const icon = document.createElement("div");
            icon.classList.add("ProseMirror-bm-button-icon");
            icon.innerHTML = item.icon;
            root.append(icon);
          }
          // name
          const name = document.createElement("div");
          name.classList.add("ProseMirror-bm-button-name");
          name.textContent = item.name;
          root.append(name);
          // shortcut
          if (item.shortcut) {
            const shortcut = document.createElement("div");
            shortcut.classList.add("ProseMirror-bm-button-shortcut");
            shortcut.textContent = item.shortcut
              .replace(/mod/i, navigator.userAgent.includes("Mac") ? "⌘" : "⌃")
              .replace(/ctrl|control/i, "⌃")
              .replace(/cmd|command/i, "⌘")
              .replace(/shift/i, "⇧")
              .replace(/alt|option/i, "⌥")
              .replace(/[-\s]+/g, "");
            root.append(shortcut);
          }
          if (i === this._index) {
            root.setAttribute("data-active", "true");
          }
          root.addEventListener("click", () => {
            if (this._element) {
              item.action(this.editor);
            }
          });
          root.addEventListener("mouseover", () => {
            if (this._element && this._index !== i) {
              this._select(i);
            }
          });
          this._nodes.push(root);
        }
      }
      this._element.append(...this._nodes);
      // noinspection JSIgnoredPromiseFromCall
      scrollIntoView(this._nodes[this._index], {
        block: "center",
        scrollMode: "if-needed",
        boundary: parent => parent !== this._element,
      });
    } else {
      const view = document.createElement("div");
      view.classList.add("ProseMirror-bm-empty");
      view.textContent = this.options.dictionary?.empty || "No results found";
      this._element.append(view);
    }
    this._popover.show();
  }
}