import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const COPY_PLUGIN_KEY = new PluginKey("codeBlockCopy");

const COPY_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><g fill="currentColor"><path d="M216 40v128h-48V88H88V40Z" opacity=".2"/><path d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></g></svg>
`;

const COPY_SUCCESS_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><g fill="currentColor"><path d="M232 56v144a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h176a16 16 0 0 1 16 16" opacity=".2"/><path d="m205.66 85.66l-96 96a8 8 0 0 1-11.32 0l-40-40a8 8 0 0 1 11.32-11.32L104 164.69l90.34-90.35a8 8 0 0 1 11.32 11.32"/></g></svg>
`;

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const createCopyButton = (source: string) => {
  const button = document.createElement("button") as HTMLButtonElement & {
    __resetTimer?: number;
  };
  button.type = "button";
  button.className = "codeblock-copy-button";
  button.title = "Copy code";
  button.setAttribute("aria-label", "Copy code");
  button.innerHTML = COPY_ICON_SVG;

  button.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    button.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.88)" }, { transform: "scale(1)" }],
      {
        duration: 150,
        easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      },
    );

    if (button.__resetTimer) {
      window.clearTimeout(button.__resetTimer);
    }

    try {
      await copyToClipboard(source);
      button.dataset.state = "copied";
      button.title = "Copied";
      button.innerHTML = COPY_SUCCESS_ICON_SVG;
      button.__resetTimer = window.setTimeout(() => {
        button.dataset.state = "idle";
        button.title = "Copy code";
        button.innerHTML = COPY_ICON_SVG;
      }, 2000);
    } catch {
      button.dataset.state = "error";
      button.title = "Copy failed";
      button.__resetTimer = window.setTimeout(() => {
        button.dataset.state = "idle";
        button.title = "Copy code";
        button.innerHTML = COPY_ICON_SVG;
      }, 1200);
    }
  });

  return button;
};

export const CodeBlockCopyExtension = Extension.create({
  name: "codeBlockCopy",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: COPY_PLUGIN_KEY,
        state: {
          init: (_, state) => {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (node.type.name !== "codeBlock") {
                return;
              }

              const source = node.textContent;
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: "codeblock-with-copy",
                }),
              );

              decorations.push(
                Decoration.widget(pos + 1, () => createCopyButton(source), {
                  side: -1,
                }),
              );
            });

            return DecorationSet.create(state.doc, decorations);
          },
          apply: (tr, old, _oldState, newState) => {
            if (!tr.docChanged) {
              return old.map(tr.mapping, tr.doc);
            }

            const decorations: Decoration[] = [];

            newState.doc.descendants((node, pos) => {
              if (node.type.name !== "codeBlock") {
                return;
              }

              const source = node.textContent;
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: "codeblock-with-copy",
                }),
              );

              decorations.push(
                Decoration.widget(pos + 1, () => createCopyButton(source), {
                  side: -1,
                }),
              );
            });

            return DecorationSet.create(newState.doc, decorations);
          },
        },
        props: {
          decorations: (state) => COPY_PLUGIN_KEY.getState(state),
        },
      }),
    ];
  },
});
