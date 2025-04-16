import { Editor } from "@tiptap/core";
import { Mark } from "@tiptap/pm/model";
import { Root } from "mdast";
import { MarkdownNode } from "../types";

export class SerializerStack {
  // @ts-expect-error
  private editor: Editor;
  private marks: ReadonlyArray<Mark>;
  private nodes: Array<MarkdownNode>;

  constructor(editor: Editor) {
    this.editor = editor;
    this.marks = Mark.none;
    this.nodes = [];
  }

  public openMark(mark: Mark, node: MarkdownNode): void {
    const isIn = mark.isInSet(this.marks);
    if (isIn) {
      return;
    }
    this.marks = mark.addToSet(this.marks);
    this.openNode(node);
  }

  public closeMark(mark: Mark): void {
    if (!mark.isInSet(this.marks)) {
      return;
    }
    this.marks = mark.type.removeFromSet(this.marks);
    this.closeNode();
  }

  public openNode(node: MarkdownNode): void {
    this.nodes.push(node);
  }

  public addNode(node: MarkdownNode): MarkdownNode | null {
    if (this.nodes.length) {
      const top = this.nodes[this.nodes.length - 1];
      if (!top.children) {
        top.children = [];
      }
      top.children.push(node);
    }
    return node;
  }

  public closeNode(): MarkdownNode | null {
    const node = this.nodes.pop();
    if (!node) {
      return null;
    }
    return this.addNode(node);
  }

  public serialize() {
    let doc: Root | null = null;
    do {
      doc = this.closeNode() as Root;
    } while (this.nodes.length);
    return doc;
  }
}
