import type { EditorCustomHandlers } from "@nuxt/ui";
import type { Editor } from "@tiptap/vue-3";
import {
  createStarterMermaidDiagram,
  createStarterPlantUmlDiagram,
  createStarterSpotifyEmbed,
  createStarterYouTubeEmbed,
} from "@/lib/createStarter";

const starterMathLatex = String.raw`\sqrt{4} = 2`;

export const createEditorCustomHandlers = (
  aiHandlers: EditorCustomHandlers,
): EditorCustomHandlers => ({
  ...aiHandlers,
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor: Editor) => editor.isActive("imageUpload"),
    isDisabled: undefined,
  },
  mermaid: {
    canExecute: (editor: Editor) => editor.can().insertContent(createStarterMermaidDiagram()),
    execute: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertContent(createStarterMermaidDiagram())
        .insertContent({ type: "paragraph" })
        .run(),
    isActive: (editor: Editor) =>
      editor.isActive("codeBlock", {
        language: "mermaid",
      }),
    isDisabled: undefined,
  },
  plantuml: {
    canExecute: (editor: Editor) => editor.can().insertContent(createStarterPlantUmlDiagram()),
    execute: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertContent(createStarterPlantUmlDiagram())
        .insertContent({ type: "paragraph" })
        .run(),
    isActive: (editor: Editor) =>
      editor.isActive("codeBlock", {
        language: "plantuml",
      }),
    isDisabled: undefined,
  },
  spotify: {
    canExecute: (editor: Editor) => editor.can().insertContent(createStarterSpotifyEmbed()),
    execute: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertContent(createStarterSpotifyEmbed())
        .insertContent({ type: "paragraph" })
        .run(),
    isActive: (editor: Editor) =>
      editor.isActive("codeBlock", {
        language: "spotify",
      }),
    isDisabled: undefined,
  },
  youtube: {
    canExecute: (editor: Editor) => editor.can().insertContent(createStarterYouTubeEmbed()),
    execute: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertContent(createStarterYouTubeEmbed())
        .insertContent({ type: "paragraph" })
        .run(),
    isActive: (editor: Editor) =>
      editor.isActive("codeBlock", {
        language: "youtube",
      }),
    isDisabled: undefined,
  },
  math: {
    canExecute: (editor: Editor) =>
      (editor.can().insertInlineMath?.({ latex: starterMathLatex }) ?? false) ||
      editor.can().insertBlockMath({ latex: starterMathLatex }),
    execute: (editor: Editor) => {
      const chain = editor.chain().focus();

      if (editor.can().insertInlineMath?.({ latex: starterMathLatex })) {
        return chain.insertInlineMath({ latex: starterMathLatex }).run();
      }

      return chain
        .insertBlockMath({ latex: starterMathLatex })
        .insertContent({ type: "paragraph" })
        .run();
    },
    isActive: (editor: Editor) => editor.isActive("blockMath") || editor.isActive("inlineMath"),
    isDisabled: (editor: Editor) => !editor.isEditable,
  },
  table: {
    canExecute: (editor: Editor) =>
      editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    execute: (editor: Editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    isActive: (editor: Editor) => editor.isActive("table"),
    isDisabled: undefined,
  },
  tableDeleteRow: {
    canExecute: (editor: Editor) => editor.can().deleteRow(),
    execute: (editor: Editor) => editor.chain().focus().deleteRow().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableAddRowBefore: {
    canExecute: (editor: Editor) => editor.can().addRowBefore(),
    execute: (editor: Editor) => editor.chain().focus().addRowBefore().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableAddRowAfter: {
    canExecute: (editor: Editor) => editor.can().addRowAfter(),
    execute: (editor: Editor) => editor.chain().focus().addRowAfter().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableAddColumnBefore: {
    canExecute: (editor: Editor) => editor.can().addColumnBefore(),
    execute: (editor: Editor) => editor.chain().focus().addColumnBefore().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableDeleteColumn: {
    canExecute: (editor: Editor) => editor.can().deleteColumn(),
    execute: (editor: Editor) => editor.chain().focus().deleteColumn().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableAddColumnAfter: {
    canExecute: (editor: Editor) => editor.can().addColumnAfter(),
    execute: (editor: Editor) => editor.chain().focus().addColumnAfter().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableMergeCells: {
    canExecute: (editor: Editor) => editor.can().mergeCells(),
    execute: (editor: Editor) => editor.chain().focus().mergeCells().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableSplitCell: {
    canExecute: (editor: Editor) => editor.can().splitCell(),
    execute: (editor: Editor) => editor.chain().focus().splitCell().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableToggleHeaderColumn: {
    canExecute: (editor: Editor) => editor.can().toggleHeaderColumn(),
    execute: (editor: Editor) => editor.chain().focus().toggleHeaderColumn().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableToggleHeaderRow: {
    canExecute: (editor: Editor) => editor.can().toggleHeaderRow(),
    execute: (editor: Editor) => editor.chain().focus().toggleHeaderRow().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
  tableToggleHeaderCell: {
    canExecute: (editor: Editor) => editor.can().toggleHeaderCell(),
    execute: (editor: Editor) => editor.chain().focus().toggleHeaderCell().run(),
    isActive: (editor: Editor) => editor.isActive("tableHeader"),
    isDisabled: undefined,
  },
  tableDelete: {
    canExecute: (editor: Editor) => editor.can().deleteTable(),
    execute: (editor: Editor) => editor.chain().focus().deleteTable().run(),
    isActive: () => false,
    isDisabled: undefined,
  },
});
