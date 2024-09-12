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
      <div class="bg-[#f6f6f680] border border-[#ececec] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.05)] rounded-xl">
        
        <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" class="p-2">
          <Icon name="lucide:bold"></Icon>
        </button>

        <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
          Italic
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
          Strike
        </button>
      </div>
    </bubble-menu>

  <div v-if="editor">
    <EditorContent :editor="editor" />
  </div></div>
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
          'max-h-[250px] min-h-[150px] w-full overflow-auto rounded-md rounded-bl-none rounded-br-none border-none border-b-0 border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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

<style>

.bubble-menu {
  background-color: var(--white);
  border: 1px solid var(--gray-1);
  border-radius: 0.7rem;
  box-shadow: var(--shadow);
  display: flex;
  padding: 0.2rem;

  button {
    background-color: unset;

    &:hover {
      background-color: var(--gray-3);
    }

    &.is-active {
      background-color: var(--purple);

      &:hover {
        background-color: var(--purple-contrast);
      }
    }
  }
}

</style>