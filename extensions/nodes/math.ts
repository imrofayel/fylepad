import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";
import katex from "katex";
import remarkMath from "remark-math";
import type { BlockMenuItemStorage } from "../block-menu/menu";
import type { NodeMarkdownStorage } from "../markdown";
import { InnerEditorView } from "../node-view/inner-editor";
import { icon } from "@/utils/icon";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (code: string) => ReturnType;
    };
  }
}

export interface MathBlockOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    inputMath: string;
    inputHelp: string;
  };
}

export const MathBlock = Node.create<MathBlockOptions>({
  name: "mathBlock",
  group: "block",
  marks: "",
  content: "text*",
  atom: true,
  code: true,
  defining: true,
  isolating: true,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Math Block",
        inputMath: "Enter or paste the equation",
        inputHelp: "Help",
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        parser: {
          match: node => node.type === "math",
          apply: (state, node, type) => {
            const code = node.value as string;
            state.openNode(type).addText(code).closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.addNode({
              type: "math",
              value: node.textContent,
            });
          },
        },
        hooks: {
          beforeInit: processor => processor.use(remarkMath),
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("math"),
            keywords: "mathblock,sxgs,gsk",
            action: editor => editor.chain().setMathBlock("E = mc^2").focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
        preserveWhitespace: "full",
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      node.textContent,
    ];
  },
  addNodeView() {
    return InnerEditorView.create({
      HTMLAttributes: this.options.HTMLAttributes,
      onRender: ({ view }) => {
        try {
          if (!view.node.textContent) {
            view.$preview.classList.remove("ProseMirror-error");
            view.$preview.classList.add("ProseMirror-info");
            view.$preview.innerHTML = this.options.dictionary.inputMath;
          } else {
            view.$preview.classList.remove("ProseMirror-error");
            view.$preview.classList.remove("ProseMirror-info");
            katex.render(view.node.textContent, view.$preview);
          }
        } catch (e) {
          view.$preview.classList.remove("ProseMirror-info");
          view.$preview.classList.add("ProseMirror-error");
          view.$preview.innerHTML = (e as Error).message;
        }
      },
    });
  },
  addCommands() {
    return {
      setMathBlock: (code) => {
        return ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: code,
              },
            ],
          });
      },
    };
  },
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^\$\$\s$/,
        type: this.type,
      }),
      textblockTypeInputRule({
        find: /^:::math$/,
        type: this.type,
      }),
    ];
  },
});