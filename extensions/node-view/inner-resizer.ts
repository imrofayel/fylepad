import { Editor, mergeAttributes, type NodeViewRendererProps } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import type { NodeView } from "@tiptap/pm/view";
import { setAttributes } from "../../utils/editor";

export interface InnerResizerViewOptions extends NodeViewRendererProps {
  id?: string;
  tag?: keyof HTMLElementTagNameMap;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  resize?: Array<"width" | "height">;
  onRender?: (props: { view: InnerResizerView; editor: Editor; $root: HTMLElement }) => void;
  onInit?: (props: { view: InnerResizerView; editor: Editor; $root: HTMLElement }) => void;
  onUpdate?: (props: { view: InnerResizerView; editor: Editor; $root: HTMLElement }) => void;
  onDestroy?: (props: { view: InnerResizerView; editor: Editor; $root: HTMLElement }) => void;
}

export class InnerResizerView implements NodeView {
  private readonly editor: Editor;
  private readonly options: InnerResizerViewOptions;

  private _node: Node;
  private _root: HTMLElement;

  public static create(options: Partial<Omit<InnerResizerViewOptions, keyof Omit<NodeViewRendererProps, "HTMLAttributes">>>) {
    return (_options: NodeViewRendererProps) => new InnerResizerView({
      ...options,
      ..._options,
      HTMLAttributes: options.HTMLAttributes ?? {},
    });
  }

  constructor(options: InnerResizerViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this._node = options.node;
    this._root = document.createElement(options.tag ?? "div");
    this._root.classList.add("ProseMirror-inner-resizer");
    this._root.setAttribute("data-type", this._node.type.name);
    if (this.options.id) {
      this._root.setAttribute("name", this.options.id);
    }
    if (this.options.class) {
      for (const item of Array.isArray(this.options.class) ? this.options.class : [this.options.class]) {
        this._root.classList.add(item);
      }
    }
    if (this.options.style) {
      for (const item of Array.isArray(this.options.style) ? this.options.style : [this.options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          this._root.style[key] = val;
        }
      }
    }
    for (const [key, value] of Object.entries(mergeAttributes(this.options.HTMLAttributes))) {
      if (value !== undefined && value !== null) {
        this._root.setAttribute(key, value);
      }
    }
    this._root.style.width = this._node.attrs.width ? `${this._node.attrs.width}px` : "";
    this._root.style.height = this._node.attrs.height ? `${this._node.attrs.height}px` : "";
    if (this._node.attrs.align === "left" || this._node.attrs.align === "start") {
      this._root.style.alignSelf = "flex-start";
    }
    if (this._node.attrs.align === "center" || this._node.attrs.align === "start") {
      this._root.style.alignSelf = "center";
    }
    if (this._node.attrs.align === "right" || this._node.attrs.align === "end") {
      this._root.style.alignSelf = "flex-end";
    }
    if (this.options.onInit) {
      this.options.onInit({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    if (this.options.onRender) {
      this.options.onRender({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    if (!this.options.resize || this.options.resize.includes("width")) {
      this._resizer("left");
      this._resizer("right");
    }
    if (!this.options.resize || this.options.resize.includes("height")) {
      this._resizer("bottom");
    }
  }

  public get dom() {
    return this._root;
  }

  public get node() {
    return this._node;
  }

  public get getPos() {
    return this.options.getPos;
  }

  public get HTMLAttributes() {
    return this.options.HTMLAttributes;
  }

  public get $root() {
    return this._root;
  }

  public update(node: Node) {
    if (node.type !== this.options.node.type) {
      return false;
    }
    this._node = node;
    const width = this._node.attrs.width ? `${this._node.attrs.width}px` : "";
    if (this._root.style.width !== width) {
      this._root.style.width = width;
    }
    const height = this._node.attrs.height ? `${this._node.attrs.height}px` : "";
    if (this._root.style.height !== height) {
      this._root.style.height = height;
    }
    if (this._node.attrs.align === "left" || this._node.attrs.align === "start") {
      if (this._root.style.alignSelf !== "flex-start") {
        this._root.style.alignSelf = "flex-start";
      }
    }
    if (this._node.attrs.align === "center" || this._node.attrs.align === "start") {
      if (this._root.style.alignSelf !== "center") {
        this._root.style.alignSelf = "center";
      }
    }
    if (this._node.attrs.align === "right" || this._node.attrs.align === "end") {
      if (this._root.style.alignSelf !== "flex-end") {
        this._root.style.alignSelf = "flex-end";
      }
    }
    if (this.options.onUpdate) {
      this.options.onUpdate({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    if (this.options.onRender) {
      this.options.onRender({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    return true;
  }

  public destroy() {
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    this.$root.remove();
  }

  private _resizer(direction: "left" | "right" | "bottom") {
    const store = { resizing: false, offset: 0, size: 0 };
    const resizer = document.createElement("div");
    const wrapper = document.createElement("div");

    wrapper.style.display = "none";
    wrapper.style.userSelect = "unset";
    if (direction === "left") {
      resizer.classList.add("ProseMirror-lresizer");
    } else if (direction === "right") {
      resizer.classList.add("ProseMirror-rresizer");
    } else {
      resizer.classList.add("ProseMirror-bresizer");
    }

    resizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const rect = resizer.getBoundingClientRect();
      wrapper.style.display = "block";
      wrapper.style.userSelect = "none";
      store.resizing = true;
      if (direction === "left") {
        store.offset = rect.x;
        store.size = this._root.clientWidth;
      } else if (direction === "right") {
        store.offset = rect.x;
        store.size = this._root.clientWidth;
      } else {
        store.offset = rect.y;
        store.size = this._root.clientHeight;
      }
    });
    wrapper.addEventListener("mousemove", (e) => {
      if (!store.resizing) {
        return;
      }
      if (direction === "left") {
        const size = store.size + Math.round((e.clientX - store.offset) * (this._root.style.alignSelf === "center" ? 2 : 1));
        if (size >= 100) {
          this._root.style.width = `${size}px`;
        }
      } else if (direction === "right") {
        const size = store.size - Math.round((e.clientX - store.offset) * (this._root.style.alignSelf === "center" ? 2 : 1));
        if (size >= 100) {
          this._root.style.width = `${size}px`;
        }
      } else {
        const size = store.size + Math.round(e.clientY - store.offset);
        if (size >= 100) {
          this._root.style.height = `${size}px`;
        }
      }
    });
    wrapper.addEventListener("mouseup", () => {
      store.resizing = false;
      store.offset = 0;
      store.size = 0;
      wrapper.style.display = "none";
      wrapper.style.userSelect = "unset";
      if (direction === "left" || direction === "right") {
        setAttributes(this.editor, this.options.getPos, {
          ...this._node.attrs,
          width: this._root.clientWidth,
        });
      } else {
        setAttributes(this.editor, this.options.getPos, {
          ...this._node.attrs,
          height: this._root.clientHeight,
        });
      }
    });
    wrapper.addEventListener("mouseleave", () => {
      store.resizing = false;
      store.offset = 0;
      store.size = 0;
      wrapper.style.display = "none";
      wrapper.style.userSelect = "unset";
      if (direction === "left" || direction === "right") {
        setAttributes(this.editor, this.options.getPos, {
          ...this._node.attrs,
          width: this._root.clientWidth,
        });
      } else {
        setAttributes(this.editor, this.options.getPos, {
          ...this._node.attrs,
          height: this._root.clientHeight,
        });
      }
    });

    resizer.append(wrapper);
    this._root.append(resizer);
  }
}