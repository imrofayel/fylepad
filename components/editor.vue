<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between w-full p-5 py-4">
      <div class="flex space-x-2">
        <input 
          v-model="localTitle" 
          @input="$emit('update:title', localTitle)"
          placeholder="Untitled" 
          class="w-full border border-none ring-0 focus:border-none px-3 text-black/80 outline-none bg-transparent rounded flex text-[22px]" 
        />
      </div>
    </div>

    <div class="flex-grow">
      <floating-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
        <!-- Floating menu content (unchanged) -->
      </floating-menu>

      <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
        <!-- Bubble menu content (unchanged) -->
      </bubble-menu>

      <EditorContent :editor="editor" class="h-full" />
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
      class: 'opacity-90 p-8 py-2 text-black/80 text-[20px] min-h-[150px] w-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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

pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
  font-style: italic;
}

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