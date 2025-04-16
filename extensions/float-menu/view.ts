import { Editor, isNodeSelection, posToDOMRect, type Range } from "@tiptap/core";
import { EditorState, type PluginView } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import tippy, { type Instance, type Props } from "tippy.js";

export interface FloatMenuInputViewOptions {
  id: string;
  name: string;
  type?: string;
  value?: string;
  classes?: Array<string>;
  attributes?: Record<string, string>;
  onEnter?: (value: string, root: HTMLInputElement, event: KeyboardEvent) => void;
  onInput?: (value: string, root: HTMLInputElement, event: Event) => void;
  onChange?: (value: string, root: HTMLInputElement, event: Event) => void;
  onKey?: (key: Pick<KeyboardEvent, "key" | "ctrlKey" | "altKey" | "metaKey" | "shiftKey">, root: HTMLInputElement, event: KeyboardEvent) => void;
  onBoundary?: (boundary: "left" | "right", value: string, root: HTMLInputElement, event: KeyboardEvent) => void;
}

export interface FloatMenuTextareaViewOptions {
  id: string;
  name: string;
  value?: string;
  classes?: Array<string>;
  attributes?: Record<string, string>;
  onEnter?: (value: string, root: HTMLTextAreaElement, event: KeyboardEvent) => void;
  onInput?: (value: string, root: HTMLTextAreaElement, event: Event) => void;
  onChange?: (value: string, root: HTMLTextAreaElement, event: Event) => void;
  onKey?: (key: Pick<KeyboardEvent, "key" | "ctrlKey" | "altKey" | "metaKey" | "shiftKey">, root: HTMLTextAreaElement, event: KeyboardEvent) => void;
  onBoundary?: (boundary: "left" | "right", value: string, root: HTMLTextAreaElement, event: KeyboardEvent) => void;
}

export interface FloatMenuButtonViewOptions {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  classes?: Array<string>;
  attributes?: Record<string, string>;
  onClick?: (root: HTMLButtonElement, event: MouseEvent) => void;
  onHover?: (root: HTMLButtonElement, event: MouseEvent) => void;
}

export interface FloatMenuUploadViewOptions extends Omit<FloatMenuButtonViewOptions, "onClick"> {
  accept?: string;
  onUpload?: (root: HTMLInputElement) => void;
}

export interface FloatMenuViewOptions {
  editor: Editor;
  tippy?: Partial<Props>;
  show?: (props: { view: FloatMenuView; editor: Editor }) => boolean;
  rect?: (props: { view: FloatMenuView; editor: Editor }) => DOMRect;
  onInit?: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
  onMount?: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
  onUpdate?: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
  onDestroy?: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
  classes?: Array<string>;
  attributes?: Record<string, string>;
}

export class FloatMenuView implements PluginView {
  private readonly editor: Editor;
  private readonly popover: Instance;
  private readonly element: HTMLElement;
  private readonly options: FloatMenuViewOptions;

  public static create(options: FloatMenuViewOptions) {
    return () => new FloatMenuView(options);
  }

  constructor(options: FloatMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this.element = this._element();
    this.popover = this._popover();
  }

  public show() {
    this.popover.show();
  }

  public hide() {
    this.popover.hide();
  }

  public update(view: EditorView, prevState?: EditorState) {
    const state = view.state;

    // Skip render
    if (view.composing || (prevState && prevState.doc.eq(state.doc) && prevState.selection.eq(state.selection))) {
      return;
    }

    // Check should show
    if (!this.options.show?.({ view: this, editor: this.editor })) {
      this.hide();
      return;
    }

    // On update
    if (this.options.onUpdate) {
      this.options.onUpdate({
        view: this,
        root: this.element,
        editor: this.editor,
        range: {
          from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
          to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
        },
      });
    }

    // Reset client rect
    this.popover.setProps({ getReferenceClientRect: () => this._rect() });

    // Switch to show
    this.show();
  }

  public destroy() {
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        root: this.element,
        editor: this.editor,
        range: {
          from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
          to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
        },
      });
    }
    this.popover.destroy();
    this.element.remove();
  }

  public createInput(options: FloatMenuInputViewOptions) {
    const root = document.createElement("div");
    root.classList.add("ProseMirror-fm-input");
    for (const clazz of options.classes ?? []) {
      root.classList.add(clazz);
    }
    for (const [key, val] of Object.entries(options.attributes ?? {})) {
      root.setAttribute(key, val);
    }

    const label = document.createElement("label");
    label.htmlFor = options.id;
    label.textContent = options.name;

    const input = document.createElement("input");
    input.name = options.id;
    input.placeholder = options.name;
    if (options.type) {
      input.type = options.type;
    }
    if (options.value) {
      input.value = options.value;
    }
    if (options.onEnter) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && options.onEnter) {
          options.onEnter(input.value, input, e);
        }
        if (e.key === "Enter" && options.onEnter) {
          options.onEnter(input.value, input, e);
        }
      });
    }
    if (options.onInput) {
      input.addEventListener("input", (e) => {
        if (options.onInput) {
          options.onInput(input.value, input, e);
        }
      });
    }
    if (options.onChange) {
      input.addEventListener("change", (e) => {
        if (options.onChange) {
          options.onChange(input.value, input, e);
        }
      });
    }
    if (options.onKey) {
      input.addEventListener("keydown", (e) => {
        if (options.onKey) {
          options.onKey(e, input, e);
        }
      });
    }
    if (options.onBoundary) {
      let pos = -1;
      input.addEventListener("mouseup", () => {
        if (input.selectionStart === null) {
          return;
        }
        if (input.selectionStart !== input.selectionEnd) {
          return;
        }
        pos = input.selectionStart;
      });
      input.addEventListener("keyup", (e) => {
        if (input.selectionStart === null) {
          return;
        }
        if (input.selectionStart !== input.selectionEnd) {
          return;
        }
        if (options.onBoundary && e.key === "ArrowLeft" && pos === 0) {
          options.onBoundary("left", input.value, input, e);
        }
        if (options.onBoundary && e.key === "ArrowRight" && (pos === -1 || pos === input.value.length)) {
          options.onBoundary("right", input.value, input, e);
        }
        pos = input.selectionStart;
      });
    }

    root.append(label);
    root.append(input);
    return root;
  }

  public createTextarea(options: FloatMenuTextareaViewOptions) {
    const root = document.createElement("textarea");
    root.name = options.id;
    root.placeholder = options.name;
    root.classList.add("ProseMirror-fm-textarea");
    for (const clazz of options.classes ?? []) {
      root.classList.add(clazz);
    }
    for (const [key, val] of Object.entries(options.attributes ?? {})) {
      root.setAttribute(key, val);
    }
    if (options.value) {
      root.value = options.value;
    }
    if (options.onEnter) {
      root.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && options.onEnter) {
          options.onEnter(root.value, root, e);
        }
        if (e.key === "Enter" && e.ctrlKey && options.onEnter) {
          options.onEnter(root.value, root, e);
        }
      });
    }
    if (options.onInput) {
      root.addEventListener("input", (e) => {
        root.style.height = `auto`;
        root.style.height = `${root.scrollHeight}px`;
        if (options.onInput) {
          options.onInput(root.value, root, e);
        }
      });
    }
    if (options.onChange) {
      root.addEventListener("change", (e) => {
        if (options.onChange) {
          options.onChange(root.value, root, e);
        }
      });
    }
    if (options.onKey) {
      root.addEventListener("keydown", (e) => {
        if (options.onKey) {
          options.onKey(e, root, e);
        }
      });
    }
    if (options.onBoundary) {
      let pos = -1;
      root.addEventListener("mouseup", () => {
        if (root.selectionStart === null) {
          return;
        }
        if (root.selectionStart !== root.selectionEnd) {
          return;
        }
        pos = root.selectionStart;
      });
      root.addEventListener("keyup", (e) => {
        if (root.selectionStart === null) {
          return;
        }
        if (root.selectionStart !== root.selectionEnd) {
          return;
        }
        if (options.onBoundary && e.key === "ArrowLeft" && pos === 0) {
          options.onBoundary("left", root.value, root, e);
        }
        if (options.onBoundary && e.key === "ArrowRight" && (pos === -1 || pos === root.value.length)) {
          options.onBoundary("right", root.value, root, e);
        }
        pos = root.selectionStart;
      });
    }
    return root;
  }

  public createButton(options: FloatMenuButtonViewOptions) {
    const root = document.createElement("button");
    for (const clazz of options.classes ?? []) {
      root.classList.add(clazz);
    }
    for (const [key, val] of Object.entries(options.attributes ?? {})) {
      root.setAttribute(key, val);
    }
    root.name = options.id;
    root.innerHTML = options.icon;
    root.classList.add("ProseMirror-fm-button");
    if (options.onClick) {
      root.addEventListener("click", (e) => {
        if (options.onClick) {
          options.onClick(root, e);
        }
      });
    }
    if (options.onHover) {
      root.addEventListener("mouseover", (e) => {
        if (options.onHover) {
          options.onHover(root, e);
        }
      });
    }

    const popover = document.createElement("div");
    popover.classList.add("ProseMirror-fm-button-popover");
    popover.innerHTML = options.name;
    if (options.shortcut) {
      popover.innerHTML += "&nbsp;·&nbsp;";
      const shortcut = document.createElement("div");
      shortcut.classList.add("ProseMirror-fm-button-shortcut");
      shortcut.textContent = options.shortcut
        .replace(/mod/i, navigator.userAgent.includes("Mac") ? "⌘" : "⌃")
        .replace(/ctrl|control/i, "⌃")
        .replace(/cmd|command/i, "⌘")
        .replace(/shift/i, "⇧")
        .replace(/alt|option/i, "⌥")
        .replace(/[-\s]+/g, "");
      popover.append(shortcut);
    }
    tippy(root, {
      content: popover,
      arrow: false,
      inertia: true,
      hideOnClick: false,
      trigger: "mouseenter",
      theme: "ProseMirror-dark",
      placement: "top",
      animation: "shift-away",
      duration: [200, 150],
      appendTo: () => document.body,
    });

    return root;
  }

  public createUpload(options: FloatMenuUploadViewOptions) {
    const file = document.createElement("input");
    file.type = "file";
    if (options.accept) {
      file.accept = options.accept;
    }
    file.addEventListener("change", () => {
      if (options.onUpload) {
        options.onUpload(file);
      }
    });
    return this.createButton({ ...options, onClick: () => file.click() });
  }

  public createForm() {
    const root = document.createElement("div");
    root.classList.add("ProseMirror-fm-form");
    return root;
  }

  public createAction() {
    const root = document.createElement("div");
    root.classList.add("ProseMirror-fm-action");
    return root;
  }

  public createDivider() {
    const root = document.createElement("span");
    root.classList.add("ProseMirror-fm-divider");
    return root;
  }

  private _rect() {
    if (this.options.rect) {
      return this.options.rect({ view: this, editor: this.editor });
    }
    const { view, state } = this.editor;
    if (isNodeSelection(state.selection)) {
      const node = view.nodeDOM(state.selection.from) as HTMLElement;
      if (node) {
        return node.getBoundingClientRect();
      }
    }
    return posToDOMRect(view, state.selection.from, state.selection.to);
  }

  private _element() {
    const element = document.createElement("div");
    for (const clazz of this.options.classes ?? []) {
      element.classList.add(clazz);
    }
    for (const [key, val] of Object.entries(this.options.attributes ?? {})) {
      element.setAttribute(key, val);
    }
    element.classList.add("ProseMirror-fm");
    if (this.options.onInit) {
      this.options.onInit({
        view: this,
        root: element,
        editor: this.editor,
        range: {
          from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
          to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
        },
      });
    }
    return element;
  }

  private _popover() {
    return tippy(document.body, {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this.element,
      arrow: false,
      interactive: true,
      theme: "ProseMirror",
      animation: "shift-away",
      trigger: "manual",
      placement: "top",
      maxWidth: "none",
      ...this.options.tippy,
      onMount: (i) => {
        if (this.options.tippy?.onMount) {
          this.options.tippy.onMount(i);
        }
        if (this.element && this.options.onMount) {
          this.options.onMount({
            view: this,
            root: this.element,
            editor: this.editor,
            range: {
              from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
              to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
            },
          });
        }
      },
    });
  }
}