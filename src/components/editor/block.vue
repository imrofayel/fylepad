<script setup lang="ts">
import { EditorSuggestionMenuItem, EditorToolbarItem, EditorCustomHandlers } from "@nuxt/ui";
import { Emoji } from "@tiptap/extension-emoji";
import { TextAlign } from "@tiptap/extension-text-align";
import { ref } from "vue";
import EditorLinkPopover from "./EditorLinkPopover.vue";
import { ImageUpload } from "@lib/extentions/EditorImageUploadExtension";

const value = ref("");

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor: Editor) => editor.isActive("imageUpload"),
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
  ],
];
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="value"
    placeholder="Start writing..."
    :handlers="customHandlers"
    :extensions="[
      ImageUpload,
      Emoji,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ]"
    class="py-2 mt-4 min-h-21"
    :ui="{
      base: 'sm:px-0! w-full px-0! [&_p]:leading-2.5!',
    }"
  >
    <UEditorToolbar
      :editor="editor"
      :items="items"
      layout="bubble"
      :ui="{
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
