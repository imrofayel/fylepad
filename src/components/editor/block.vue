<script setup lang="ts">
import { EditorSuggestionMenuItem, EditorToolbarItem, EditorCustomHandlers } from "@nuxt/ui";
import { Emoji } from "@tiptap/extension-emoji";
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
import mermaid from "mermaid";
import { createLowlight } from "lowlight";
import CodeBlockShiki from "tiptap-extension-code-block-shiki";

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
      icon: "i-lucide-sparkles",
      label: "Improve",
      variant: "soft",
      loading: aiLoading.value,
      content: {
        align: "start",
      },
      items: [
        {
          kind: "aiFix",
          icon: "i-lucide-spell-check",
          label: "Fix spelling & grammar",
        },
        {
          kind: "aiExtend",
          icon: "i-lucide-unfold-vertical",
          label: "Extend text",
        },
        {
          kind: "aiReduce",
          icon: "i-lucide-fold-vertical",
          label: "Reduce text",
        },
        {
          kind: "aiSimplify",
          icon: "i-lucide-lightbulb",
          label: "Simplify text",
        },
        {
          kind: "aiContinue",
          icon: "i-lucide-text",
          label: "Continue sentence",
        },
        {
          kind: "aiSummarize",
          icon: "i-lucide-list",
          label: "Summarize",
        },
        {
          icon: "i-lucide-languages",
          label: "Translate",
          children: [
            {
              kind: "aiTranslate",
              language: "English",
              label: "English",
            },
            {
              kind: "aiTranslate",
              language: "French",
              label: "French",
            },
            {
              kind: "aiTranslate",
              language: "Spanish",
              label: "Spanish",
            },
            {
              kind: "aiTranslate",
              language: "German",
              label: "German",
            },
          ],
        },
      ],
    },
  ],
];

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
  <UEditor
    ref="editorRef"
    v-slot="{ editor }"
    v-model="value"
    placeholder="Start writing..."
    :handlers="customHandlers"
    :extensions="[
      CodeBlockShiki.configure({
        defaultTheme: 'tokyo-night',
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
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
      Emoji,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ]"
    class="py-2 mt-2 min-h-21"
    :ui="{
      base: 'sm:px-0! w-full px-0! [&_p]:leading-normal',
    }"
  >
    <UEditorToolbar
      :editor="editor"
      :items="items"
      layout="bubble"
      :ui="{
        root: 'z-100!',
        base: 'p-px',
      }"
    >
      <template #link>
        <EditorLinkPopover :editor="editor" auto-open />
      </template>
    </UEditorToolbar>
    <UEditorSuggestionMenu :editor="editor" :items="suggestionMenu" />
  </UEditor>
</template>
