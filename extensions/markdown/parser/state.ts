import { Editor } from "@tiptap/core";
import { MarkType, Node, NodeType } from "@tiptap/pm/model";
import { Processor } from "unified";
import { Attrs, MarkdownNode, MarkMarkdownStorage, NodeMarkdownStorage } from "../types";
import { ParserStack } from "./stack";

export class ParserState {
  public readonly editor: Editor;
  public readonly processor: Processor;
  private readonly stack: ParserStack;

  constructor(editor: Editor, processor: Processor) {
    this.stack = new ParserStack(editor);
    this.editor = editor;
    this.processor = processor;
  }

  public parse(markdown: string) {
    for (const storage of Object.values(this.editor.storage as Record<string, NodeMarkdownStorage | MarkMarkdownStorage>)) {
      if (storage?.markdown?.hooks?.beforeParse) {
        markdown = storage.markdown.hooks.beforeParse(markdown);
      }
    }
    let root = this.processor.runSync(this.processor.parse(markdown));
    for (const storage of Object.values(this.editor.storage as Record<string, NodeMarkdownStorage | MarkMarkdownStorage>)) {
      if (storage?.markdown?.hooks?.afterParse) {
        root = storage.markdown.hooks.afterParse(root);
      }
    }
    this.next(root);
    return this.stack.parse();
  }

  public next(nodes: MarkdownNode | MarkdownNode[] = []) {
    for (const node of [nodes].flat()) {
      this.runNode(node);
    }
    return this;
  }

  public addText(value?: string) {
    this.stack.addText(value);
    return this;
  }

  public addNode(type: NodeType, attrs?: Attrs, content?: Node[]) {
    this.stack.addNode(type, attrs, content);
    return this;
  }

  public openNode(type: NodeType, attrs?: Attrs) {
    this.stack.openNode(type, attrs);
    return this;
  }

  public closeNode() {
    this.stack.closeNode();
    return this;
  }

  public openMark(type: MarkType, attrs?: Attrs) {
    this.stack.openMark(type, attrs);
    return this;
  }

  public closeMark(type: MarkType) {
    this.stack.closeMark(type);
    return this;
  }

  private runNode(node: MarkdownNode) {
    const extension = this.matchNode(node);
    if (extension) {
      const name = extension.name;
      const type = this.editor.schema[extension.type === "node" ? "nodes" : "marks"][name] as MarkType & NodeType;
      const storage = extension.storage as MarkMarkdownStorage | NodeMarkdownStorage | undefined;
      storage?.markdown?.parser?.apply(this, node, type);
    }
  }

  private matchNode(node: MarkdownNode) {
    const extension = this.editor.extensionManager.extensions.find((e) => {
      const name = e.name;
      const storage = e.storage as MarkMarkdownStorage | NodeMarkdownStorage | undefined;
      return name !== "markdown" && storage?.markdown?.parser?.match(node);
    });
    if (!extension) {
      console.warn(`No parser match ${node.type}`);
      return undefined;
    }
    return extension;
  }
}
