<!-- <template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between w-full p-5 py-4 bg-white/10 backdrop-blur-lg z-10">
      <div class="flex space-x-2">
        <input 
          v-model="localTitle" 
          @input="$emit('update:title', localTitle)"
          placeholder="Untitled" 
          class="w-full border border-none ring-0 focus:border-none px-3 text-black/80 outline-none bg-transparent rounded flex text-[22px]" 
        />
      </div>

      <div class="flex space-x-3">
        <button @click="exportJson" class="bg-[#f6f6f670] border backdrop-blur-lg flex px-3 p-1 rounded-2xl justify-center items-center text-black/70">Export JSON</button>
        <button @click="triggerFileInput" class="bg-[#f6f6f670] border backdrop-blur-lg flex px-3 p-1 rounded-2xl justify-center items-center text-black/70">Import JSON</button>
        <input type="file" ref="fileInput" accept="application/json" @change="importJson" class="hidden" />
      </div>
    </div>

    <div class="flex-grow">
      <floating-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
        <div class="flex overflow-hidden bg-[#f6f6f670] border backdrop-blur-xl rounded-xl text-black/70">
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
            class="rounded-l-lg hover:bg-gray-100 p-1 px-2">
            <Icon name="lucide:bold" size="22" class="relative top-0.5"></Icon>
          </button>
          <button @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200/50': editor.isActive('italic') }" class="hover:bg-gray-100 p-1 px-2">
            <Icon name="lucide:italic" size="22" class="relative top-0.5"></Icon>
          </button>
          <button @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-100': editor.isActive('strike') }" class="hover:bg-gray-100 p-1 px-2">
            <Icon name="lucide:strikethrough" size="22" class="relative top-0.5"></Icon>
          </button>
          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100': editor.isActive('highlight') }" class="hover:bg-gray-100 p-1 px-2 rounded-r-lg">
            <div class="w-5 h-5 bg-yellow-400 rounded-full border border-black/50"></div>
          </button>
        </div>
      </bubble-menu>

      <EditorContent :editor="editor" class="h-full" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue';
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
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import ListKeymap from '@tiptap/extension-list-keymap'
import { BubbleMenu, EditorContent, useEditor, FloatingMenu } from "@tiptap/vue-3";

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
      class: 'opacity-90 p-8 py-2 text-black/90 text-[20px] min-h-[150px] w-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
});

const exportJson = () => {
  const exportData = {
    title: localTitle.value,
    content: editor.value?.getJSON(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(url);
};

const fileInput = ref<HTMLInputElement | null>(null);

const importJson = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (result) {
      const importedData = JSON.parse(result.toString());
      localTitle.value = importedData.title || '';
      emit('update:title', localTitle.value);
      editor.value?.commands.setContent(importedData.content);
    }
  };
  reader.readAsText(file);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style>
/* Styles unchanged */
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
</style> -->


<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between w-full p-5 py-4 bg-white/10 backdrop-blur-lg z-10">
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
/* Styles unchanged */
</style>