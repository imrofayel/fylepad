import { EditorSuggestionMenuItem, EditorToolbarItem } from "@nuxt/ui";
import { Editor } from "@tiptap/core";
import { ICONS } from "./constants/icons";

const highlightPalette = [
  {
    label: "Default Yellow",
    class: "highlight-option highlight-option-yellow",
  },
  {
    label: "Ocean Blue",
    class: "highlight-option highlight-option-blue",
    color: "var(--highlight-blue)",
  },
  {
    label: "Mint Green",
    class: "highlight-option highlight-option-green",
    color: "var(--highlight-green)",
  },
  {
    label: "Sunset Orange",
    class: "highlight-option highlight-option-orange",
    color: "var(--highlight-orange)",
  },
  {
    label: "Rose Pink",
    class: "highlight-option highlight-option-pink",
    color: "var(--highlight-pink)",
  },
  {
    label: "Lavender",
    class: "highlight-option highlight-option-purple",
    color: "var(--highlight-purple)",
  },
];

const suggestionMenu: EditorSuggestionMenuItem[][] = [
  [
    {
      kind: "paragraph",
      label: "Paragraph",
      icon: ICONS.textSize,
    },
    {
      kind: "heading",
      level: 1,
      label: "Heading 1",
      icon: ICONS.heading1,
    },
    {
      kind: "heading",
      level: 2,
      label: "Heading 2",
      icon: ICONS.heading2,
    },
    {
      kind: "heading",
      level: 3,
      label: "Heading 3",
      icon: ICONS.heading3,
    },
  ],
  [
    {
      kind: "bulletList",
      label: "Bullet List",
      icon: ICONS.bulletList,
    },
    {
      kind: "orderedList",
      label: "Numbered List",
      icon: ICONS.orderedList,
    },
  ],
  [
    {
      kind: "blockquote",
      label: "Blockquote",
      icon: ICONS.blockquote,
    },
    {
      kind: "codeBlock",
      label: "Code Block",
      icon: ICONS.codeBlock,
    },
    {
      kind: "imageUpload",
      label: "Image",
      icon: ICONS.photo,
    },
    {
      kind: "horizontalRule",
      label: "Divider",
      icon: ICONS.horizontalRule,
    },
    {
      kind: "table",
      label: "Table",
      icon: ICONS.table,
    },
    {
      kind: "math",
      label: "Math (LaTeX)",
      icon: ICONS.math,
    },
  ],
  [
    {
      kind: "mermaid",
      label: "Mermaid Diagram",
      icon: ICONS.mermaid,
    },
    {
      kind: "plantuml",
      label: "PlantUML Diagram",
      icon: ICONS.plantuml,
    },
    {
      kind: "spotify",
      label: "Spotify Embed",
      icon: ICONS.spotify,
    },
    {
      kind: "youtube",
      label: "YouTube Embed",
      icon: ICONS.youtube,
    },
  ],
];

const buildToolbarItems = (aiLoading: boolean | undefined): EditorToolbarItem[][] => {
  return [
    [
      {
        kind: "mark",
        size: "md",
        mark: "bold",
        icon: ICONS.bold,
        tooltip: { text: "Bold", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "italic",
        icon: ICONS.italic,
        tooltip: { text: "Italic", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "underline",
        icon: ICONS.underline,
        tooltip: { text: "Underline", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "strike",
        icon: ICONS.strikethrough,
        tooltip: { text: "Strikethrough", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "code",
        icon: ICONS.code,
        tooltip: { text: "Code", arrow: true },
      },
      {
        slot: "link" as const,
      },
    ],
    [
      {
        icon: ICONS.alignLeft,
        size: "md",
        tooltip: { text: "Align", arrow: true },
        content: {
          align: "start",
        },
        items: [
          {
            kind: "textAlign",
            align: "left",
            label: "Left",
            icon: ICONS.alignLeft,
          },
          {
            kind: "textAlign",
            align: "center",
            label: "Center",
            icon: ICONS.alignCenter,
          },
          {
            kind: "textAlign",
            align: "right",
            label: "Right",
            icon: ICONS.alignRight,
          },
          {
            kind: "textAlign",
            align: "justify",
            label: "Justify",
            icon: ICONS.justified,
          },
        ],
      },
    ],
    [
      {
        icon: ICONS.style,
        size: "md",
        tooltip: { text: "Highlight", arrow: true },
        content: {
          align: "start",
        },
        items: [
          ...highlightPalette.map((item) => ({
            kind: "highlightColor",
            label: item.label,
            class: item.class,
            ...(item.color ? { highlightColor: item.color } : {}),
          })),
          {
            type: "separator" as const,
          },
          {
            kind: "highlightClear",
            label: "Clear highlight",
            icon: ICONS.trashFilled,
            color: "error",
          },
        ],
      },
    ],
    [
      {
        icon: ICONS.ai,
        size: "md",
        loading: aiLoading,
        content: {
          align: "start",
        },
        tooltip: { text: "Assistant", arrow: true },
        items: [
          {
            kind: "aiFix",
            icon: ICONS.aiSpellcheck,
            label: "Fix spelling & grammar",
          },
          {
            kind: "aiExtend",
            icon: ICONS.arrowAutofitWidth,
            label: "Extend text",
          },
          {
            kind: "aiReduce",
            icon: ICONS.arrowsDiagonalMinimize,
            label: "Reduce text",
          },
          {
            kind: "aiSimplify",
            icon: ICONS.bulb,
            label: "Simplify text",
          },
          {
            kind: "aiContinue",
            icon: ICONS.trackNext,
            label: "Continue sentence",
          },
          {
            kind: "aiSummarize",
            icon: ICONS.menu,
            label: "Summarize",
          },
        ],
      },
    ],
  ];
};

const tableItems: EditorToolbarItem[][] = [
  [
    {
      icon: ICONS.table,
      label: "Table",
      content: {
        align: "start",
      },
      size: "md",
      items: [
        [
          {
            kind: "tableAddColumnBefore",
            icon: ICONS.tableColumn,
            label: "Insert column before",
          },
          {
            kind: "tableAddColumnAfter",
            icon: ICONS.boxAlignRightFilled,
            label: "Insert column after",
          },
          {
            kind: "tableDeleteColumn",
            icon: ICONS.columnRemove,
            label: "Delete column",
          },
        ],
        [
          {
            kind: "tableAddRowBefore",
            icon: ICONS.tableRow,
            label: "Insert row before",
          },
          {
            kind: "tableAddRowAfter",
            icon: ICONS.boxAlignBottomFilled,
            label: "Insert row after",
          },
          {
            kind: "tableDeleteRow",
            icon: ICONS.rowRemove,
            label: "Delete row",
          },
        ],
        [
          {
            kind: "tableToggleHeaderColumn",
            icon: ICONS.freezeRowColumn,
            label: "Toggle header column",
          },
          {
            kind: "tableToggleHeaderRow",
            icon: ICONS.freezeRow,
            label: "Toggle header row",
          },
          {
            kind: "tableToggleHeaderCell",
            icon: ICONS.sectionFilled,
            label: "Toggle header cell",
          },
        ],
        [
          {
            kind: "tableMergeCells",
            icon: ICONS.borderOuter,
            label: "Merge cells",
          },
          {
            kind: "tableSplitCell",
            icon: ICONS.borderSides,
            label: "Split cell",
          },
        ],
        [
          {
            kind: "tableDelete",
            icon: ICONS.trashFilled,
            label: "Delete table",
            color: "error",
          },
        ],
      ],
    },
  ],
];

const imageToolbar = (editor: Editor): EditorToolbarItem[][] => {
  const node = editor.state.doc.nodeAt(editor.state.selection.from);

  return [
    [
      {
        icon: ICONS.fileDownloadFilled,
        to: node?.attrs?.src,
        download: true,
        tooltip: { text: "Download", arrow: true },
        size: "md",
      },
    ],
    [
      {
        icon: ICONS.trashFilled,
        tooltip: { text: "Delete", arrow: true },
        color: "error",
        size: "md",
        onClick: () => {
          const { state } = editor;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === "image") {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .run();
          }
        },
      },
    ],
  ];
};

const codeToolbar = (_editor: Editor): EditorToolbarItem[][] => {
  return [
    [
      {
        slot: "codeLanguage" as const,
      },
    ],
  ];
};

export { suggestionMenu, buildToolbarItems, tableItems, imageToolbar, codeToolbar };
