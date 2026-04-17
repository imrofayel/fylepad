<script setup lang="ts">
import { EditorSuggestionMenuItem, EditorToolbarItem } from "@nuxt/ui";
import { Emoji } from "@tiptap/extension-emoji";
import { TextAlign } from "@tiptap/extension-text-align";
import { ref } from "vue";

const value = ref("");

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
  ],
];

const suggestionMenu: EditorSuggestionMenuItem[][] = [
  [
    {
      kind: "paragraph",
      label: "Paragraph",
      icon: "i-lucide-type",
    },
    {
      kind: "heading",
      level: 1,
      label: "Heading 1",
      icon: "i-lucide-heading-1",
    },
    {
      kind: "heading",
      level: 2,
      label: "Heading 2",
      icon: "i-lucide-heading-2",
    },
    {
      kind: "heading",
      level: 3,
      label: "Heading 3",
      icon: "i-lucide-heading-3",
    },
  ],
  [
    {
      kind: "bulletList",
      label: "Bullet List",
      icon: "i-lucide-list",
    },
    {
      kind: "orderedList",
      label: "Numbered List",
      icon: "i-lucide-list-ordered",
    },
  ],
  [
    {
      kind: "blockquote",
      label: "Blockquote",
      icon: "i-lucide-text-quote",
    },
    {
      kind: "codeBlock",
      label: "Code Block",
      icon: "i-lucide-square-code",
    },
    {
      kind: "horizontalRule",
      label: "Divider",
      icon: "i-lucide-separator-horizontal",
    },
  ],
];
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="value"
    placeholder="Start writing..."
    :extensions="[
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
        base: 'p-0.5',
      }"
    />
    <UEditorSuggestionMenu :editor="editor" :items="suggestionMenu" />
  </UEditor>
</template>
