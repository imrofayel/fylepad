import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const COPY_PLUGIN_KEY = new PluginKey("codeBlockCopy");

const COPY_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></g></svg>
`;

const COPY_SUCCESS_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M18.333 6A3.667 3.667 0 0 1 22 9.667v8.666A3.667 3.667 0 0 1 18.333 22H9.667A3.667 3.667 0 0 1 6 18.333V9.667A3.667 3.667 0 0 1 9.667 6zM15 2c1.094 0 1.828.533 2.374 1.514a1 1 0 1 1-1.748.972C15.405 4.088 15.284 4 15 4H5c-.548 0-1 .452-1 1v9.998c0 .32.154.618.407.805l.1.065a1 1 0 1 1-.99 1.738A3 3 0 0 1 2 15V5c0-1.652 1.348-3 3-3zm1.293 9.293L13 14.585l-1.293-1.292a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414"/></svg>
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
