import { EditorSuggestionMenuItem, EditorToolbarItem } from "@nuxt/ui";
import { Editor } from "@tiptap/core";

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
      icon: "tabler:text-size",
    },
    {
      kind: "heading",
      level: 1,
      label: "Heading 1",
      icon: "tabler:h-1",
    },
    {
      kind: "heading",
      level: 2,
      label: "Heading 2",
      icon: "tabler:h-2",
    },
    {
      kind: "heading",
      level: 3,
      label: "Heading 3",
      icon: "tabler:h-3",
    },
  ],
  [
    {
      kind: "bulletList",
      label: "Bullet List",
      icon: "tabler:list",
    },
    {
      kind: "orderedList",
      label: "Numbered List",
      icon: "tabler:list-numbers",
    },
  ],
  [
    {
      kind: "blockquote",
      label: "Blockquote",
      icon: "tabler:blockquote",
    },
    {
      kind: "codeBlock",
      label: "Code Block",
      icon: "tabler:braces",
    },
    {
      kind: "imageUpload",
      label: "Image",
      icon: "tabler:photo",
    },
    {
      kind: "horizontalRule",
      label: "Divider",
      icon: "tabler:line-dashed",
    },
    {
      kind: "table",
      label: "Table",
      icon: "tabler:table-filled",
    },
    {
      kind: "math",
      label: "Math (LaTeX)",
      icon: "tabler:math-function",
    },
  ],
  [
    {
      kind: "mermaid",
      label: "Mermaid Diagram",
      icon: "vscode-icons:file-type-mermaid",
    },
    {
      kind: "plantuml",
      label: "PlantUML Diagram",
      icon: "vscode-icons:file-type-plantuml",
    },
    {
      kind: "spotify",
      label: "Spotify Embed",
      icon: "logos:spotify-icon",
    },
    {
      kind: "youtube",
      label: "YouTube Embed",
      icon: "logos:youtube-icon",
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
        icon: "tabler:bold",
        tooltip: { text: "Bold", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "italic",
        icon: "tabler:italic",
        tooltip: { text: "Italic", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "underline",
        icon: "tabler:underline",
        tooltip: { text: "Underline", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "strike",
        icon: "tabler:strikethrough",
        tooltip: { text: "Strikethrough", arrow: true },
      },
      {
        kind: "mark",
        size: "md",
        mark: "code",
        icon: "tabler:code",
        tooltip: { text: "Code", arrow: true },
      },
      {
        slot: "link" as const,
      },
    ],
    [
      {
        icon: "tabler:brush",
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
            icon: "tabler:trash-filled",
            color: "error",
          },
        ],
      },
    ],
    [
      {
        icon: "i-icons-ai",
        size: "md",
        loading: aiLoading,
        content: {
          align: "start",
        },
        tooltip: { text: "Assistant", arrow: true },
        items: [
          {
            kind: "aiFix",
            icon: "tabler:text-spellcheck",
            label: "Fix spelling & grammar",
          },
          {
            kind: "aiExtend",
            icon: "tabler:arrow-autofit-width",
            label: "Extend text",
          },
          {
            kind: "aiReduce",
            icon: "tabler:arrows-diagonal-minimize",
            label: "Reduce text",
          },
          {
            kind: "aiSimplify",
            icon: "tabler:bulb",
            label: "Simplify text",
          },
          {
            kind: "aiContinue",
            icon: "tabler:track-next",
            label: "Continue sentence",
          },
          {
            kind: "aiSummarize",
            icon: "tabler:menu",
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
      icon: "tabler:table-filled",
      label: "Table",
      content: {
        align: "start",
      },
      size: "md",
      items: [
        [
          {
            kind: "tableAddColumnBefore",
            icon: "tabler:table-column",
            label: "Insert column before",
          },
          {
            kind: "tableAddColumnAfter",
            icon: "tabler:box-align-right-filled",
            label: "Insert column after",
          },
          {
            kind: "tableDeleteColumn",
            icon: "tabler:column-remove",
            label: "Delete column",
          },
        ],
        [
          {
            kind: "tableAddRowBefore",
            icon: "tabler:table-row",
            label: "Insert row before",
          },
          {
            kind: "tableAddRowAfter",
            icon: "tabler:box-align-bottom-filled",
            label: "Insert row after",
          },
          {
            kind: "tableDeleteRow",
            icon: "tabler:row-remove",
            label: "Delete row",
          },
        ],
        [
          {
            kind: "tableToggleHeaderColumn",
            icon: "tabler:freeze-row-column",
            label: "Toggle header column",
          },
          {
            kind: "tableToggleHeaderRow",
            icon: "tabler:freeze-row",
            label: "Toggle header row",
          },
          {
            kind: "tableToggleHeaderCell",
            icon: "tabler:section-filled",
            label: "Toggle header cell",
          },
        ],
        [
          {
            kind: "tableMergeCells",
            icon: "tabler:border-outer",
            label: "Merge cells",
          },
          {
            kind: "tableSplitCell",
            icon: "tabler:border-sides",
            label: "Split cell",
          },
        ],
        [
          {
            kind: "tableDelete",
            icon: "tabler:trash-filled",
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
        icon: "tabler:file-download-filled",
        to: node?.attrs?.src,
        download: true,
        tooltip: { text: "Download" },
        size: "md",
      },
    ],
    [
      {
        icon: "tabler:trash-filled",
        tooltip: { text: "Delete" },
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

export { suggestionMenu, buildToolbarItems, tableItems, imageToolbar };
