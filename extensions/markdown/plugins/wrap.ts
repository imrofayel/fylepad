import { Paragraph, RootContent } from "mdast";
import { SKIP, visit, Visitor } from "unist-util-visit";
import { MarkdownNode } from "../types";

export function wrap(root: MarkdownNode, match: (node: MarkdownNode) => boolean) {
  const visitor: Visitor<MarkdownNode> = (node, index, parent) => {
    if (!parent || typeof index !== "number") {
      return;
    }
    if (match(node)) {
      if (parent.type !== "paragraph") {
        parent.children.splice(index, 1, { type: "paragraph", children: [node] } as Paragraph);
        return [SKIP, index];
      }
    }
  };

  visit(root, visitor);
  return root;
}

export function unwrap(root: MarkdownNode, match: (node: MarkdownNode) => boolean) {
  const visitor: Visitor<Paragraph> = (node, index, parent) => {
    if (!parent || typeof index !== "number") {
      return;
    }
    const items: Array<any> = [];
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (match(child)) {
        items.push(child);
      } else {
        const last = items[items.length - 1];
        if (Array.isArray(last)) {
          last.push(child);
        } else {
          items.push([child]);
        }
      }
    }
    parent.children.splice(index, 1, ...items.map<RootContent>((i) => {
      if (Array.isArray(i)) {
        return { type: "paragraph", children: i };
      } else {
        return i;
      }
    }));
    return index + items.length;
  };

  visit(root, "paragraph", visitor);
  return root;
}
