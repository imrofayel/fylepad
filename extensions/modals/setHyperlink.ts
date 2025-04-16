import { Editor } from "@tiptap/core";
import Tooltip, { type TippyInitOptions } from "../helpers/tippyHelper";import { find } from "linkifyjs";

export type TSetHyperlinkModalOptions = {
  editor: Editor;
  validate?: (url: string) => boolean;
  extentionName: string;
  attributes?: { href: string; target?: string | null };
  Tooltip: new (options: TippyInitOptions) => Tooltip;
  roundArrow: string;
};

let tooltip: Tooltip | undefined = undefined;

export function setHyperlinkModal(options: TSetHyperlinkModalOptions): void {
  // Create the tooltip instance
  if (!tooltip) tooltip = new options.Tooltip(options);

  // Initialize the tooltip
  let { tippyModal } = tooltip.init();

  const hyperlinkModal = document.createElement("div");
  const buttonsWrapper = document.createElement("div");
  const inputsWrapper = document.createElement("div");

  hyperlinkModal.classList.add("hyperlink-set-modal");

  buttonsWrapper.classList.add("hyperlink-set-modal__buttons-wrapper");
  inputsWrapper.classList.add("hyperlink-set-modal__inputs-wrapper");

  // create a form that contain url input and a button for submit
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");

  input.setAttribute("type", "text");
  input.setAttribute("placeholder", "https://example.com");
  button.setAttribute("type", "submit");
  button.innerText = "Submit";

  inputsWrapper.append(input);
  buttonsWrapper.append(button);
  form.append(inputsWrapper, buttonsWrapper);

  hyperlinkModal.append(form);

  tippyModal.innerHTML = "";
  tippyModal.append(hyperlinkModal);
  tooltip.update(options.editor.view, {
    arrow: options.roundArrow,
  });

  // make sure
  setTimeout(() => {
    input.focus();
    input.style.outlineColor = " #dadce0";
  }, 100);

  input.addEventListener("keydown", () => {
    input.style.outlineColor = " #dadce0";
  });

  // event listenr for submit button
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const url = input.value;

    if (!url) {
      input.style.outlineColor = "red";
      return;
    }

    const sanitizeURL = find(url)
      .filter((link) => link.isLink)
      .filter((link) => {
        if (options.validate) {
          return options.validate(link.value);
        }
        return true;
      })
      .at(0);

    if (!sanitizeURL?.href) {
      input.style.outlineColor = "red";
      return;
    }

    tooltip?.hide();

    return options.editor
      .chain()
      .setMark(options.extentionName, { href: sanitizeURL.href })
      .setMeta("preventautohyperlink", true)
      .run();
  });
}
