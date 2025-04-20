import { Editor } from "@tiptap/core";
import { find } from "linkifyjs";

type EditHyperlinkOptions = {
  editor: Editor;
  validate?: (url: string) => boolean;
  newURL?: string;
  newText?: string;
};

export default function editHyperlink(options: EditHyperlinkOptions) {
  const { state, dispatch } = options.editor.view;
  const { from, to } = state.selection;
  let link: HTMLAnchorElement | null = null;

  const selectedNode = options.editor.view.domAtPos(from - 1).node as HTMLElement;
  const nodeName = selectedNode?.nodeName;

  if (nodeName === "#text") {
    link = (selectedNode.parentNode as HTMLElement)?.closest("a");
  } else {
    link = selectedNode?.closest("a");
  }

  // If no link found and node is paragraph, try finding link in sibling/parent
  if (!link && options.editor.view.domAtPos(from).node.nodeName === "P" && selectedNode.nextSibling)
    link =
      (selectedNode.nextSibling as HTMLAnchorElement) ||
      (selectedNode.parentElement as HTMLAnchorElement);

  if (!link) return true;

  const text = options.newText || link?.innerText;
  // Get the position of the link in the editor view
  const nodePos = options.editor.view.posAtDOM(link, 0);

  const sanitizeURL = find(options.newURL || link.href)
    .filter((link) => link.isLink)
    .filter((link) => (options.validate ? options.validate(link.value) : true))
    .at(0);

  return options.editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.deleteRange(nodePos, nodePos + (link?.innerText || "")?.length).replaceWith(
        nodePos,
        nodePos,
        options.editor.schema.text(text, [
          options.editor.schema.marks.hyperlink.create({
            href: sanitizeURL?.href,
          }),
        ])
      );

      return true;
    })
    .run();
}
