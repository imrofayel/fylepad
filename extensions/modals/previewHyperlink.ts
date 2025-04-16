import { Editor } from "@tiptap/core";
import { editHyperlinkHandler } from "./editeHyperlink";
import { Copy, LinkSlash, Pencil } from "./icons";
import Tooltip from "../helpers/tippyHelper";

export type THyperlinkPreviewModalOptions = {
  editor: Editor;
  validate?: (url: string) => boolean;
  link: HTMLAnchorElement;
  node?: any;
  nodePos: number;
  tippy: Tooltip;
};

export function previewHyperlinkModal(options: THyperlinkPreviewModalOptions): HTMLElement {
  const href = options.link.href;

  const hyperlinkModal = document.createElement("div");
  const removeButton = document.createElement("button");
  const copyButton = document.createElement("button");
  const editButton = document.createElement("button");

  const newBubble = document.createElement("div");
  newBubble.classList.add("hyperlink-preview-modal__metadata");

  const hrefTitle = document.createElement("a");
  hrefTitle.setAttribute("target", "_blank");
  hrefTitle.setAttribute("rel", "noreferrer");
  hrefTitle.setAttribute("href", href);
  hrefTitle.innerText = href;

  newBubble.append(hrefTitle);

  fetch("/api/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: href }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Create a new bubble with the title
      hrefTitle.setAttribute("href", href);

      hrefTitle.innerText = data.title || data["og:title"] || href;
      newBubble.replaceChildren(hrefTitle);

      // Create an image element if image exists in metadata
      if (data.icon || data.image || data["og:image"]) {
        const img = document.createElement("img");
        img.src = data.icon || data.image || data["og:image"];
        img.alt = data.title || data["og:title"] || "hyperlink image";
        newBubble.appendChild(img);
      }
    })
    .catch((error) => {
      console.error("Error fetching metadata:", error);
    });

  hyperlinkModal.classList.add("hyperlink-preview-modal");

  removeButton.classList.add("hyperlink-preview-modal__remove-button");
  removeButton.innerHTML = LinkSlash();

  editButton.classList.add("hyperlink-preview-modal__edit-button");
  editButton.innerHTML = Pencil();

  copyButton.classList.add("hyperlink-preview-modal__copy-button");
  copyButton.innerHTML = Copy();

  removeButton.addEventListener("click", () => {
    options.tippy.hide();
    return options.editor.chain().focus().unsetHyperlink().run();
  });

  editButton.addEventListener("click", () => editHyperlinkHandler({ ...options, hyperlinkModal }));

  copyButton.addEventListener("click", () => {
    options.tippy.hide();
    navigator.clipboard.writeText(href);
  });

  hyperlinkModal.append(newBubble, copyButton, editButton, removeButton);

  return hyperlinkModal;
}
