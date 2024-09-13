<template>
  <div class="container">

    <div class="control-group">
      <label>
        <input type="checkbox" :checked="isEditable" @change="() => isEditable = !isEditable">
        Editable
      </label>
    </div>

    <bubble-menu
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      v-if="editor"
    >
      <div class="bubble-menu flex p-1 bg-white border border-gray-100 rounded-lg shadow">
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-purple-500 hover:bg-purple-700 text-white': editor.isActive('bold') }" class="hover:bg-gray-200 rounded-xl">
          Bold
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-purple-500 hover:bg-purple-700 text-white': editor.isActive('italic') }" class="hover:bg-gray-200">
          Italic
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-purple-500 hover:bg-purple-700 text-white': editor.isActive('strike') }" class="hover:bg-gray-200">
          Strike
        </button>
      </div>
    </bubble-menu>

    <div v-if="editor">
      <EditorContent :editor="editor"/>
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

  const model = defineModel<any>({ default: "" });

  const isEditable = ref(true)

  const toggleEditable = () => {
    isEditable.value = !isEditable.value
  }

  const props = withDefaults(
    defineProps<{
      modelType?: "html" | "json";
      class?: any;
    }>(),
    {
      modelType: "html",
    }
  );

  const editor = useEditor({
    content: model.value,

    editorProps: {
      attributes: {
        class:
          'max-h-[250px] text-black/70 text-[26px] min-h-[150px] w-full overflow-auto rounded-md rounded-bl-none rounded-br-none border-none border-b-0 border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    onUpdate(val) {
      if (props.modelType === "html") {
        model.value = val.editor.getHTML();
      } else if (props.modelType === "json") {
        model.value = JSON.stringify(val.editor.getJSON());
      }
    },
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({}),
      Table.configure({
        resizable: true,
      }),
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

  watch(isEditable, (value) => {
    if (editor.value) {
      editor.value.setEditable(value)
    }
  })
  
</script>