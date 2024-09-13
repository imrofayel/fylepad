<!-- <template>
  <div class="container w-full h-full">
    <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
      <div class="flex overflow-hidden bg-[#f6f6f670] border backdrop-blur-xl rounded-xl text-black/70">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-100': editor.isActive('bold') }" class="rounded-l-lg hover:bg-gray-100 p-1 px-2">
          <Icon name="lucide:bold" size="22" class="relative top-0.5"></Icon>
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200/50': editor.isActive('italic') }" class="hover:bg-gray-100 p-1 px-2">
          <Icon name="lucide:italic" size="22" class="relative top-0.5"></Icon>
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-gray-100': editor.isActive('strike') }" class="hover:bg-gray-100 p-1 px-2">
          <Icon name="lucide:strikethrough" size="22" class="relative top-0.5"></Icon>
        </button>
        <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ 'bg-gray-100': editor.isActive('highlight') }" class="hover:bg-gray-100 p-1 px-2 rounded-r-lg">
          <div class="w-5 h-5 bg-yellow-400 rounded-full border border-black/50"></div>
        </button>
      </div>
    </bubble-menu>

    <div v-if="editor">
      <EditorContent :editor="editor" />
    </div>

    <div class="flex space-x-4 mt-4">
      <button @click="exportJson" class="p-2 bg-blue-500 text-white rounded">Export JSON</button>
      <button @click="triggerFileInput" class="p-2 bg-green-500 text-white rounded">Import JSON</button>
<input type="file" ref="fileInput" accept="application/json" @change="importJson" class="hidden" />
    </div>
  </div>

</template>

<script lang="ts" setup>
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/vue-3";

// Reference for editor content
const contentJson = ref(null); // This can be set to an initial JSON content if desired

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

// Editor setup
const editor = useEditor({
  content: contentJson.value ? JSON.stringify(contentJson.value) : "",
  editorProps: {
    attributes: {
      class: 'max-h-[250px] opacity-90 p-8 py-2 text-black/80 text-[22px] min-h-[150px] w-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    },
  },
  extensions: [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle,
    Table.configure({ resizable: true }),
    Superscript,
    SubScript,
    Link,
    Typography,
    Highlight,
    TableRow,
    TableHeader,
    StarterKit,
    TableCell,
  ],
});

// Function to export editor content as JSON
const exportJson = () => {
  const content = editor.value?.getJSON();
  const dataStr = JSON.stringify(content, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "editor_content.json";
  link.click();
  URL.revokeObjectURL(url);
};

// Function to import JSON content into the editor
const importJson = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = JSON.parse(e.target?.result as string);
      editor.value?.commands.setContent(content);
    };
    reader.readAsText(file);
  }
};

</script>

<style>
mark {
  background-color: #FAF594;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}

code {
  font-family: 'JetBrains Mono';
  font-size: 20px;
  background-color: #f6f6f6;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}

</style> -->

<template>
  <div class="h-screen flex flex-col">
    <!-- Title and Tag Inputs -->
    <div class="p-4 bg-gray-100">
      <input v-model="title" placeholder="Enter title" class="w-full p-2 mb-2 border border-gray-300 rounded" />
      <input v-model="tag" placeholder="Enter tag" class="w-full p-2 mb-2 border border-gray-300 rounded" />
      <p class="text-gray-600">Date: {{ date }}</p>
    </div>

    <!-- Editor container, takes up full available space and scrolls if needed -->
    <div class="flex-1 overflow-auto">
      <EditorContent :editor="editor" class="h-full" />
    </div>

    <!-- Buttons at the bottom -->
    <div class="p-4 bg-gray-100 flex justify-end space-x-2">
      <button @click="exportJson" class="p-2 bg-blue-500 text-white rounded">Export JSON</button>
      <button @click="triggerFileInput" class="p-2 bg-green-500 text-white rounded">Import JSON</button>
      <input type="file" ref="fileInput" accept="application/json" @change="importJson" class="hidden" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/vue-3";

// State for title, tag, and date
const title = ref('');
const tag = ref('');
const date = ref(new Date().toLocaleDateString());

// Reference for file input
const fileInput = ref<HTMLInputElement | null>(null);

// Editor setup
const editor = useEditor({
  content: '',
  editorProps: {
    attributes: {
      class: 'max-h-[250px] opacity-90 p-8 py-2 text-black/80 text-[22px] min-h-[150px] w-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    },
  },
  extensions: [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle,
    Table.configure({ resizable: true }),
    Superscript,
    SubScript,
    Link,
    Typography,
    Highlight,
    TableRow,
    TableHeader,
    StarterKit,
    TableCell,
  ],
});

// Function to export editor content along with title, tag, and date
const exportJson = () => {
  const exportData = {
    title: title.value,
    tag: tag.value,
    date: date.value,
    content: editor.value?.getJSON(), // Editor content
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(url);
};

// Function to import JSON content into the editor
const importJson = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (result) {
      const importedData = JSON.parse(result.toString());
      // Set title, tag, and date
      title.value = importedData.title || '';
      tag.value = importedData.tag || '';
      date.value = importedData.date || new Date().toLocaleDateString();

      // Set content to the editor
      editor.value?.commands.setContent(importedData.content);
    }
  };
  reader.readAsText(file);
};

// Function to trigger file input programmatically
const triggerFileInput = () => {
  fileInput.value?.click();
};

</script>

<style>
mark {
  background-color: #FAF594;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}

code {
  font-family: 'JetBrains Mono';
  font-size: 20px;
  background-color: #f6f6f6;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}
</style>
