<script setup lang="ts">
import { EditorSuggestionMenuItem, EditorToolbarItem, EditorCustomHandlers } from "@nuxt/ui";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Editor } from "@tiptap/vue-3";
import { ref, useTemplateRef } from "vue";
import EditorLinkPopover from "./EditorLinkPopover.vue";
import { ImageUpload } from "@lib/extentions/EditorImageUploadExtension";
import { useEditorCompletion } from "@/composables/useEditorCompletion";
import { CodeBlockLowlightMermaid } from "@lib/extentions/MermaidExtension";
import { CodeBlockLowlightPlantUml } from "@lib/extentions/PlantUmlExtension";
import { CodeBlockLowlightSpotify } from "@lib/extentions/SpotifyExtension";
import { CodeBlockLowlightYouTube } from "@lib/extentions/YouTubeExtension";
import { CodeBlockCopyExtension } from "@lib/extentions/CodeBlockCopyExtension";
import { TwoslashExtension } from "@lib/extentions/TwoslashExtension";
import mermaid from "mermaid";
import { createLowlight } from "lowlight";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";
import { Mathematics } from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import { TableOfContents, getHierarchicalIndexes } from "@tiptap/extension-table-of-contents";
import { ListKit } from "@tiptap/extension-list";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";

const editorRef = useTemplateRef("editorRef");

const {
  extension: completionExtension,
  handlers: aiHandlers,
  isLoading: aiLoading,
} = useEditorCompletion(editorRef, {
  api: "http://localhost:3008/ai",
  autoTrigger: false,
  debounce: 800,
  minAutoTriggerChars: 10,
  acceptOnTab: true,
  trapTab: true,
});

const value = ref("");

type TocAnchor = {
  id: string;
  level: number;
  itemIndex: number | string;
  textContent: string;
  isActive: boolean;
  isScrolledOver: boolean;
  dom: HTMLElement;
};

const tocAnchors = ref<TocAnchor[]>([]);

const updateTocAnchors = (anchors: TocAnchor[]) => {
  tocAnchors.value = anchors;
};

const goToTocAnchor = (anchor: TocAnchor) => {
  anchor.dom?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const mathPopoverOpen = ref(false);
const mathLatex = ref("");
const mathPos = ref<number | null>(null);
const mathKind = ref<"inline" | "block">("block");

const openMathPopover = (
  node: { attrs?: { latex?: string } },
  pos: number,
  kind: "inline" | "block",
) => {
  mathLatex.value = node.attrs?.latex || "";
  mathPos.value = pos;
  mathKind.value = kind;
  mathPopoverOpen.value = true;
};

const closeMathPopover = () => {
  mathPopoverOpen.value = false;
};

const getMathReference = (editor: Editor) => {
  if (mathPos.value === null) {
    return undefined;
  }

  const dom = editor.view.nodeDOM(mathPos.value);
  return dom instanceof HTMLElement ? dom : undefined;
};

const applyMathUpdate = (editor: Editor) => {
  const pos = mathPos.value;
  const latex = mathLatex.value.trim();

  if (pos === null || !latex) {
    return;
  }

  const chain = editor.chain().focus().setNodeSelection(pos);
  if (mathKind.value === "block") {
    chain.updateBlockMath({ latex, pos }).run();
  } else {
    chain.updateInlineMath({ latex, pos }).run();
  }

  closeMathPopover();
};

const createStarterMermaidDiagram = () => ({
  type: "codeBlock",
  attrs: {
    language: "mermaid",
  },
  content: [
    {
      type: "text",
      text: "flowchart TD\nA[Mermaid] --> B{You know syntax?}\nB -->|Yes| C[Cool!]\nB -->|No| D[Try it!]",
    },
  ],
});

const createStarterPlantUmlDiagram = () => ({
  type: "codeBlock",
  attrs: {
    language: "plantuml",
  },
  content: [
    {
      type: "text",
      text: "@startuml\nBob -> Alice : hello\n@enduml",
    },
  ],
});

const createStarterSpotifyEmbed = () => ({
  type: "codeBlock",
  attrs: {
    language: "spotify",
  },
  content: [
    {
      type: "text",
      text: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    },
  ],
});

const createStarterYouTubeEmbed = () => ({
  type: "codeBlock",
  attrs: {
    language: "youtube",
  },
  content: [
    {
      type: "text",
      text: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  ],
});

const starterMathLatex = String.raw`\sqrt{4} = 2`;

const customHandlers = {
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
} satisfies EditorCustomHandlers;

const items: EditorToolbarItem[][] = [
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
      icon: "i-icons-ai",
      size: "md",
      loading: aiLoading.value,
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

const shouldShowTextToolbar = ({ editor, state, view }: any) => {
  const { selection } = state;
  return view.hasFocus() && !selection.empty && !editor.isActive("table");
};

const shouldShowTableToolbar = ({ editor, view }: any) => {
  return view.hasFocus() && editor.isActive("table");
};

const suggestionMenu: EditorSuggestionMenuItem<typeof customHandlers>[][] = [
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

mermaid.initialize({ startOnLoad: false });

const lowlight = createLowlight();
</script>

<template>
  <div class="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_17rem]">
    <UEditor
      ref="editorRef"
      v-slot="{ editor }"
      v-model="value"
      placeholder="Write / for commands..."
      :handlers="customHandlers"
      :extensions="[
        ListKit,
        TableKit.configure({
          table: {
            resizable: true,
          },
        }),
        TableOfContents.configure({
          anchorTypes: ['heading'],
          getIndex: getHierarchicalIndexes,
          onUpdate: (anchors) => updateTocAnchors(anchors as TocAnchor[]),
        }),
        Mathematics.configure({
          inlineOptions: {
            onClick: (node, pos) => openMathPopover(node, pos, 'inline'),
          },
          blockOptions: {
            onClick: (node, pos) => openMathPopover(node, pos, 'block'),
          },
          katexOptions: {
            throwOnError: false,
          },
        }),
        CodeBlockShiki.configure({
          defaultTheme: 'tokyo-night',
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        }),
        TwoslashExtension,
        CodeBlockCopyExtension,
        CodeBlockLowlightMermaid.configure({
          lowlight,
          classList: 'mermaid-container',
          debounce: 400,
          mermaidConfig: {
            theme: 'neutral',
          },
        }),
        CodeBlockLowlightPlantUml.configure({
          lowlight,
          classList: 'plantuml-container',
          debounce: 400,
        }),
        CodeBlockLowlightSpotify.configure({
          lowlight,
          classList: 'spotify-container',
        }),
        CodeBlockLowlightYouTube.configure({
          lowlight,
          classList: 'youtube-container',
        }),
        completionExtension,
        ImageUpload,
        Emoji.configure({
          emojis: gitHubEmojis,
          enableEmoticons: true,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ]"
      class="py-2 mt-2 min-h-21"
      :ui="{
        base: 'sm:px-0! text-[16.5px] w-full px-0! [&_p]:leading-normal',
      }"
    >
      <UEditorToolbar
        :editor="editor"
        :items="items"
        layout="bubble"
        :should-show="shouldShowTextToolbar"
        :ui="{
          root: 'z-130!',
          base: 'p-0.5',
        }"
      >
        <template #link>
          <EditorLinkPopover :editor="editor" auto-open />
        </template>
      </UEditorToolbar>

      <UEditorToolbar
        :editor="editor"
        :items="[...tableItems, ...items]"
        layout="bubble"
        :should-show="shouldShowTableToolbar"
        :ui="{
          root: 'z-120!',
          base: 'p-1',
        }"
      >
        <template #link>
          <EditorLinkPopover :editor="editor" auto-open />
        </template>
      </UEditorToolbar>

      <UPopover
        :open="mathPopoverOpen"
        :reference="getMathReference(editor)"
        :content="{ side: 'top', align: 'start', sideOffset: 8 }"
        :ui="{ content: 'p-0.5 dark:bg-neutral-800! w-84 z-120' }"
        @update:open="(value) => (mathPopoverOpen = value)"
      >
        <span class="sr-only" />

        <template #content>
          <div class="p-1.5 w-full flex flex-col space-y-2">
            <UInput
              v-model="mathLatex"
              autofocus
              placeholder="Edit LaTeX"
              :ui="{
                base: 'w-full font-mono leading-6 bg-transparent ring- 0 focus-visible:ring-0! p-0',
              }"
              @keydown="
                (event: KeyboardEvent) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault();
                    applyMathUpdate(editor);
                  }
                }
              "
            />

            <div class="flex items-center justify-end gap-1">
              <UButton
                icon="tabler:circle-check-filled"
                color="primary"
                size="sm"
                :disabled="!mathLatex.trim()"
                @click="applyMathUpdate(editor)"
                label="Update"
              />
            </div>
          </div>
        </template>
      </UPopover>

      <UEditorSuggestionMenu :editor="editor" :items="suggestionMenu" />
    </UEditor>

    <aside class="hidden xl:block mr-4" v-if="tocAnchors.length !== 0">
      <div class="sticky top-18 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
        <div class="px-2 dark:text-neutral-300 text-neutral-600 flex gap-1 items-center">
          <UIcon name="tabler:align-left" class="text-xl" />On this page
        </div>
        <nav class="py-2" aria-label="Table of contents">
          <UButton
            v-for="anchor in tocAnchors"
            :key="anchor.id"
            variant="link"
            color="neutral"
            size="lg"
            class="w-full transition-colors"
            :ui="{
              base: 'text-left py-1.5 text-[16.5px]',
            }"
            :class="[anchor.isActive && 'dark:text-neutral-300 text-neutral-600']"
            :style="{ paddingLeft: `${Math.max(anchor.level - 1, 0) * 0.8 + 0.5}rem` }"
            @click="goToTocAnchor(anchor)"
          >
            {{ anchor.textContent || "Untitled heading" }}
          </UButton>
        </nav>
      </div>
    </aside>
  </div>
</template>
