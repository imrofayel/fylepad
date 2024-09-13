<template>
  <div class="container">
    <!-- Bubble Menu for text formatting -->
    <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
      <div class="flex overflow-hidden bg-[#f6f6f670] border backdrop-blur-xl rounded-xl text-black/70">
        <!-- Bold Button -->
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-100': editor.isActive('bold') }" class="rounded-l-lg hover:bg-gray-100 p-1 px-2">
          <Icon name="lucide:bold" size="22" class="relative top-0.5"></Icon>
        </button>
        <!-- Italic Button -->
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200/50': editor.isActive('italic') }" class="hover:bg-gray-100 p-1 px-2">
          <Icon name="lucide:italic" size="22" class="relative top-0.5"></Icon>
        </button>
        <!-- Strikethrough Button -->
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-gray-100': editor.isActive('strike') }" class="hover:bg-gray-100 p-1 px-2">
          <Icon name="lucide:strikethrough" size="22" class="relative top-0.5"></Icon>
        </button>
        <!-- Highlight Button -->
        <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ 'bg-gray-100': editor.isActive('highlight') }" class="hover:bg-gray-100 p-1 px-2 rounded-r-lg">
          <div class="w-5 h-5 bg-yellow-400 rounded-full border border-black/50"></div>
        </button>
      </div>
    </bubble-menu>

    <!-- Editor content -->
    <div v-if="editor">
      <EditorContent :editor="editor" />
    </div>

    <!-- Export and Import Buttons -->
    <div class="mt-4 flex space-x-4">
      <button @click="exportContent" class="px-4 py-2 bg-blue-500 text-white rounded-lg">
        Export Content as JSON
      </button>
      <label class="cursor-pointer px-4 py-2 bg-green-500 text-white rounded-lg">
        Import JSON
        <input type="file" accept=".json" @change="importContent" class="hidden">
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
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

// Define the props for the component
const props = withDefaults(
  defineProps<{
    modelType?: "html" | "json";
    contentJson?: any; // JSON content to be passed as prop
    class?: string;
  }>(),
  {
    modelType: "json", // Default to JSON mode
    contentJson: null, // Default is no content
  }
);

// Create the editor instance
const editor = useEditor({
  content: props.contentJson ? props.contentJson : "",
  editorProps: {
    attributes: {
      class:
        'max-h-[250px] opacity-90 p-8 py-2 text-black/80 text-[22px] min-h-[150px] w-full overflow-auto border-none border-b-0 border-input bg-transparent ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    },
  },
  onUpdate(val) {
    // Update model based on content
    model.value = JSON.stringify(val.editor.getJSON());
  },
  extensions: [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({}),
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

// Use ref for the model to hold editor content
const model = ref<string>("");

// Function to export the content as a JSON file
const exportContent = () => {
  const content = editor.value?.getJSON();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "editor-content.json");
  downloadAnchor.click();
};

// Function to import JSON content into the editor
const importContent = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const jsonContent = JSON.parse(reader.result as string);
    editor.value?.commands.setContent(jsonContent);
  };
  reader.readAsText(file);
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
