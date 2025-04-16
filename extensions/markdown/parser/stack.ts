import { Editor } from "@tiptap/core";
import { Mark, MarkType, Node, NodeType } from "@tiptap/pm/model";
import { Attrs } from "../types";

export class ParserStack {
  private editor: Editor;
  private marks: ReadonlyArray<Mark>;
  private nodes: Array<{ type: NodeType; attrs?: Attrs; content: Array<Node> }>;

  constructor(editor: Editor) {
    this.editor = editor;
    this.marks = Mark.none;
    this.nodes = [];
  }

  public addText(value?: string): void {
    const nodes = this.nodes[this.nodes.length - 1].content;
    const last = nodes[nodes.length - 1];
    const node = this.editor.schema.text(value ?? "", this.marks);
    const merged = last && this.maybeMerge(last, node);
    if (merged) {
      nodes[nodes.length - 1] = merged;
    } else {
      nodes.push(node);
    }
  }

  public openMark(type: MarkType, attrs?: Attrs): void {
    const mark = type.create(attrs);
    this.marks = mark.addToSet(this.marks);
  }

  public closeMark(type: MarkType) {
    this.marks = type.removeFromSet(this.marks);
  }

  public openNode(type: NodeType, attrs?: Attrs): void {
    this.nodes.push({
      type,
      attrs,
      content: [],
    });
  }

  public addNode(type: NodeType, attrs?: Attrs, content?: Node[]): Node | null {
    const node = type.createAndFill(attrs, content, this.marks);
    if (!node) {
      return null;
    }
    if (this.nodes.length) {
      this.nodes[this.nodes.length - 1].content.push(node);
    }
    return node;
  }

  public closeNode(): Node | null {
    this.marks = Mark.none;
    const node = this.nodes.pop();
    if (!node) {
      return null;
    }
    return this.addNode(node.type, node.attrs, node.content);
  }

  public parse() {
    let doc: Node | null = null;
    do {
      doc = this.closeNode();
    } while (this.nodes.length);
    return doc;
  }

  private maybeMerge(a: Node, b: Node) {
    if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks)) {
      // @ts-expect-error
      return this.editor.schema.text(a.text + b.text, a.marks);
    }
  }
}
