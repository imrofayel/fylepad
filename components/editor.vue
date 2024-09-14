<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between w-full p-5 py-2 blur-[0.24px]">
      <div class="flex space-x-2">
        <input v-model="localTitle" @input="$emit('update:title', localTitle)" placeholder="Untitled"
          class="w-full border border-none ring-0 focus:border-none px-3 text-black/90 outline-none bg-transparent rounded flex text-[24px]" />
      </div>
    </div>

    <div class="flex-grow">

      <floating-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
        <div class="flex overflow-hidden bg-[#f6f6f670] border backdrop-blur-xl rounded-xl text-black/80 blur-[0.24px]">
          <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'bg-gray-100': editor.isActive('heading', { level: 1 }) }"
            class="rounded-l-lg hover:bg-gray-100 p-1 px-2">
            <Icon name="lucide:heading-1" size="22" class="relative top-0.5"></Icon>
          </button>

          <button @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-gray-200/50': editor.isActive('bulletList') }" class="hover:bg-gray-100 p-1 px-2">
            <Icon name="lucide:list" size="22" class="relative top-0.5"></Icon>
          </button>

          <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-100': editor.isActive('orderedList') }" class="hover:bg-gray-100 p-1 px-2 rounded-r-lg">
            <Icon name="lucide:list-ordered" size="20" class="relative top-0.5"></Icon>
          </button>

          <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'bg-gray-100': editor.isActive('code') }"
            class="hover:bg-gray-100 p-1 px-2">
            <Icon name="lucide:code" size="20" class="relative top-0.5"></Icon>
          </button>
        </div>
      </floating-menu>

      <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
        <div class="flex overflow-hidden bg-[#f6f6f670] border backdrop-blur-xl rounded-xl text-black/70">
          <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-100': editor.isActive('bold') }"
            class="rounded-l-lg hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200/50': editor.isActive('italic') }" class="hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 4h-9m4 16H5M15 4L9 20" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-100': editor.isActive('strike') }" class="hover:bg-gray-100 p-2 px-2">


            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6m-2-8h16" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100': editor.isActive('highlight') }" class="hover:bg-gray-100 p-2 px-2 rounded-r-lg">
            <div class="w-5 h-5 bg-yellow-400 rounded-full border border-black/50"></div>
          </button>
        </div>
      </bubble-menu>


      <EditorContent :editor="editor" class="h-full blur-[0.24px]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3';
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Color } from "@tiptap/extension-color";
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
import ListKeymap from '@tiptap/extension-list-keymap'

const props = defineProps<{
  title: string;
  content: any;
}>();

const emit = defineEmits(['update:title', 'update:content']);

const localTitle = ref(props.title);

const editor = useEditor({
  content: props.content,
  editorProps: {
    attributes: {
      class: 'opacity-90 p-8 leading-loose py-2 text-black text-[19px] min-h-[150px] w-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
    TableCell,
    ListKeymap,
    StarterKit,
    Highlight,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:content', editor.getJSON());
  },
});

watch(() => props.title, (newTitle) => {
  localTitle.value = newTitle;
});

watch(() => props.content, (newContent) => {
  if (editor.value && JSON.stringify(newContent) !== JSON.stringify(editor.value.getJSON())) {
    editor.value.commands.setContent(newContent);
  }
}, { deep: true });

onBeforeUnmount(() => {
  editor.value?.destroy();
});


</script>

<style>
h1 {
  font-size: 2rem;
  margin: 1rem 0;
}

h2 {
  font-size: 1.75rem;
  margin: 0.75rem 0;
}

h3 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

h4 {
  font-size: 1.25rem;
  margin: 0.25rem 0;
}

ul,
ol {
  margin-left: 1.5rem;
  padding-left: 1rem;
}

ul {
  list-style-type: disc;
}

ol {
  list-style-type: decimal;
}

li {
  margin: 0.5rem 0;
}

.task-list-item {
  display: flex;
  align-items: center;
}

.task-list-item input {
  margin-right: 0.5rem;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}

mark {
  background-color: #FAF594;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}

code {
  font-family: 'Roboto Mono';
  font-size: 18px;
  background-color: #F9FAFB;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}

</style>