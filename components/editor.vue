<template>
  <div class="h-full flex flex-col">

    <div class="flex fixed right-0 top-1 z-10 p-3 py-2" :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">
      <Menu as="div" class="relative inline-block text-left">
        <MenuButton
          class="bg-gray-50 dark:text-white/90 dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </g>
          </svg>
        </MenuButton>

        <transition enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <MenuItems
            class="absolute right-0 mt-2 origin-top-right divide-y divide-gray-100 rounded-xl dark:text-white/90 dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-none bg-gray-50 border border-gray-100 overflow-hidden">
            <div>
              <MenuItem v-slot="{ active }">
              <button @click="exportMarkdown" :class="[
                active ? 'bg-white/80 dark:bg-[#1f2920] text-black' : 'text-black',
                'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-gray-50'
              ]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M7 7h10v10M7 17L17 7" />
                </svg>Save
              </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
              <button @click="importMarkdownOrText" :class="[
                active ? 'bg-white dark:bg-[#1f2920] text-black' : 'text-black',
                'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-gray-50'
              ]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M17 7L7 17m10 0H7V7" />
                </svg>Open
              </button>
              </MenuItem>

              <MenuItem v-slot="{ active }" v-if="colorMode.value === 'dark'">
              <button @click="onClick('light')" :class="[
                active ? 'bg-white dark:bg-[#1f2920] text-black' : 'text-black',
                'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-gray-50'
              ]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20">
                  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <circle cx="12" cy="12" r="4" />
                    <path
                      d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
                  </g>
                </svg>Light
              </button>
              </MenuItem>

              <MenuItem v-slot="{ active }" v-if="colorMode.value === 'light'">
              <button @click="onClick('dark')" :class="[
                active ? 'bg-white dark:bg-[#1f2920] text-black' : 'text-black',
                'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-gray-50'
              ]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9" />
                </svg>Dark
              </button>
              </MenuItem>

            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>

    <div class="flex justify-between w-full p-2 py-2">

      <div class="flex w-full justify-between items-center space-x-2">
        <input v-model="localTitle" @input="$emit('update:title', localTitle)" placeholder="Untitled"
          class="w-full border border-none ring-0 focus:border-none px-3 dark:text-white text-black/90 outline-none bg-transparent rounded flex text-[24px]" />


        <UiPopover :editor="editor as any" :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'"/>

        <button @click="handleExportPDF"
          class="bg-gray-50 hover:bg-white hover:bg-white/80 dark:bg-[#2d3d33] dark:text-white/90 hover:dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl flex px-3 p-1 rounded-2xl justify-center items-center text-black/75 cursor-pointer" :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">

          <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
          PDF
        </button>
      </div>
    </div>

    <div class="flex-grow">

      <floating-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden bg-white/60 dark:bg-[#2d3d33] dark:border-none backdrop-blur-xl rounded-xl border text-black/70 dark:text-white/85 relative left-[5rem]">
          <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('heading', { level: 1 }) }"
            class="rounded-l-lg hover:bg-gray-100 hover:dark:bg-[#1f2920] p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 12h8m-8 6V6m8 12V6m5 6l3-2v8" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('bulletList') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#1f2920]">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('orderedList') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6h11m-11 6h11m-11 6h11M4 6h1v4m-1 0h2m0 8H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleTaskList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('taskList', { level: 1 }) }"
            class="hover:bg-gray-100 hover:dark:bg-[#1f2920] p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
                <path d="M14 4h7m-7 5h7m-7 6h7m-7 5h7" />
              </g>
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleCode().run()"
            :class="{ 'dark:bg-[#1f2920] bg-gray-100': editor.isActive('code') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#1f2920]">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m16 18l6-6l-6-6M8 6l-6 6l6 6" />
            </svg>

          </button>
        </div>
      </floating-menu>

      <bubble-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden dark:bg-[#2d3d33] dark:border-none bg-white/60 border backdrop-blur-xl rounded-xl text-black/70 dark:text-white/85">
          <button @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('bold') }"
            class="rounded-l-lg hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200/50 dark:bg-[#1f2920]': editor.isActive('italic') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 4h-9m4 16H5M15 4L9 20" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('strike') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">


            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6m-2-8h16" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('highlight') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2 rounded-r-lg">
            <div class="w-5 h-5 bg-yellow-400 dark:bg-yellow-500 rounded-full border dark:border-none border-black/50">
            </div>
          </button>
        </div>
      </bubble-menu>

      <EditorContent :editor="editor as any" class="h-full mb-10" />

      <div
        class="bg-gray-50 dark:bg-[#2d3d33] dark:text-white/40 text-black/30 p-1.5 px-3 flex justify-between items-center fixed bottom-0 w-full select-none"
        v-if="editor" :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">
        <div class="flex space-x-4">

          <div class="flex space-x-4" v-if="!editor.can().deleteTable()">
            <div
              class="text-base bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-xl justify-center items-center text-white/90  cursor-pointer border-gray-100 border">
              Text align
            </div>

            <button @click="editor.chain().focus().setTextAlign('left').run()"
              :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'left' }) }"><svg
                xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 6H3m12 6H3m14 6H3" />
              </svg></button>

            <button @click="editor.chain().focus().setTextAlign('center').run()"
              :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'center' }) }"><svg
                xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 6H3m14 6H7m12 6H5" />
              </svg></button>

            <button @click="editor.chain().focus().setTextAlign('right').run()"
              :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'right' }) }"><svg
                xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 6H3m18 6H9m12 6H7" />
              </svg></button>

            <button @click="editor.chain().focus().setTextAlign('justify').run()"
              :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'justify' }) }"> <svg
                xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 6h18M3 12h18M3 18h18" />
              </svg></button>

            <div @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
              class="text-base bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-xl justify-center items-center text-white/90  cursor-pointer border-gray-100 border">
              Insert Table
            </div>

          </div>

          <!-- Row Manipulation -->

          <div class="flex space-x-2" v-if="editor.can().deleteTable()">

            <div
              class="bg-[#ffffff] text-base dark:bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-xl justify-center items-center dark:text-white/90 border-gray-100 border text-black/80 cursor-pointer space-x-2">

              <button @click="editor.chain().focus().deleteRow().run()" :disabled="!editor.can().deleteRow()">

                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="text-red-600">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14" />
                </svg>

              </button>

              <span class="inline">Row</span>

              <button @click="editor.chain().focus().addRowAfter().run()" :disabled="!editor.can().addRowAfter()">

                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14m-7-7v14" />
                </svg>

              </button>

            </div>

            <!-- Column Manipulation -->

            <div class="flex space-x-2" v-if="editor.can().deleteTable()">

              <div
                class="bg-[#ffffff] text-base dark:bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-xl justify-center items-center border-gray-100 border dark:text-white/90 text-black/80 cursor-pointer space-x-2">

                <button @click="editor.chain().focus().deleteColumn().run()" :disabled="!editor.can().deleteColumn()">

                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="text-red-600">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14" />
                  </svg>

                </button>

                <span class="inline">Column</span>


                <button @click="editor.chain().focus().addColumnAfter().run()"
                  :disabled="!editor.can().addColumnAfter()">

                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14m-7-7v14" />
                  </svg>

                </button>

              </div>
            </div>

            <div @click="editor.chain().focus().toggleHeaderCell().run()" :disabled="!editor.can().toggleHeaderCell()"
              class="bg-[#ffffff] text-base dark:bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-xl justify-center items-center dark:text-white/90 border-gray-100 border text-black/80 cursor-pointer space-x-2">
              Header Cell</div>

            <div @click="editor.chain().focus().deleteTable().run()"
              class="text-base hover:bg-[#a61111] bg-[#b91010] dark:hover:bg-[#c10c0cd0] dark:bg-[#860d0dcd] dark:border-transparent border-gray-100 border backdrop-blur-xl flex px-3 p-1 rounded-xl justify-center items-center text-white cursor-pointer">
              Delete</div>

          </div>

        </div>
        <div class="sm:hidden md:flex items-center space-x-3 hidden dark:text-white/80 text-black/80 relative right-8">
          <div>{{ characterCount }} characters</div>
          <span class="text-sm opacity-20">|</span>
          <div>{{ wordCount }} words</div>
          <span class="text-sm opacity-20">|</span>
          <div>UTF8</div>

        </div>
      </div>

      <button class="fixed bottom-3.5 text-black/80 dark:text-white/90 right-3" title="Focus Mode" @click="focus"><svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></button>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Editor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3';
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
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import FontFamily from '@tiptap/extension-font-family'

import { Markdown } from 'tiptap-markdown';

import { ColorHighlighter } from '../extensions/ColorHighlighter.ts'

import { SmilieReplacer } from '../extensions/SmilieReplacer.ts'

import { md2pdf } from '../utils/exportPDF';

// load all languages with "all" or common languages with "common"
import { all, createLowlight } from 'lowlight'

const colorMode = useColorMode()

function onClick(val: string) {
  colorMode.preference = val
}

const focusMode = ref(false);

function focus() {
  if (focusMode.value == true) {
    focusMode.value = false,
    editor.value?.setEditable(true)
  }
  else{
    focusMode.value = true,
    editor.value?.setEditable(false)

  }
}

// create a lowlight instance
const lowlight = createLowlight(all)

const editor = ref<Editor | null>(null);

const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

const props = defineProps<{
  title: string;
  content: any;
}>();

const emit = defineEmits(['update:title', 'update:content']);

const localTitle = ref(props.title);

onMounted(() => {
  editor.value = new Editor({
    content: props.content,

    editable: true,

    editorProps: {
      attributes: {
        class: 'dark:text-white/90 p-6 leading-loose py-2 text-black/80 text-[19px] min-h-[150px] w-full h-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    extensions: [
      CustomTaskItem,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle,
      Table.configure({ resizable: true }),
      Superscript,
      SubScript,
      Link,
      Typography,
      TableRow,
      TableHeader,
      TableCell,
      ListKeymap,
      StarterKit,
      Highlight,
      TaskList,
      FontFamily,

      CodeBlockLowlight.configure({
        lowlight,
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskItem.configure({
        nested: true,
      }),
      Markdown,
      SmilieReplacer,
      ColorHighlighter,
      CharacterCount.configure({
        limit: Infinity,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'heading'
          }
          if (node.type.name === 'paragraph') {
            return 'Begin!'
          }
          return ''
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      emit('update:content', editor.getJSON());
    },
  });
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

const exportMarkdown = () => {
  if (editor.value) {
    const markdownContent = editor.value.storage.markdown.getMarkdown();
    console.log('Markdown Content:', markdownContent);

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${localTitle.value || 'untitled'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    console.error('Editor instance is not available.');
  }
};

const importMarkdownOrText = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.txt';

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string' && editor.value) {
          editor.value.commands.setContent(content);
          console.log('Content imported successfully');

          // Update the title based on the file name (optional)
          const fileName = file.name.replace(/\.(md|txt)$/, '');
          if (localTitle && typeof localTitle.value === 'string') {
            localTitle.value = fileName;

            // Update the title using the file name
            emit('update:title', localTitle.value);
          }
        } else {
          console.error('Failed to import content: Invalid content or editor not available');
        }
      };

      reader.onerror = (e: ProgressEvent<FileReader>) => {
        console.error('Error reading file:', e);
      };

      reader.readAsText(file);
    } else {
      console.error('No file selected');
    }
  };

  input.click();
};

const handleExportPDF = () => {
  if (editor.value) {
    const htmlContent = editor.value.getHTML();
    md2pdf(htmlContent, localTitle.value);
  } else {
    console.error('Editor instance is not available.');
  }
};

const characterCount = computed(() => editor.value?.storage.characterCount.characters() ?? 0);
const wordCount = computed(() => editor.value?.storage.characterCount.words() ?? 0);

</script>

<style>
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  pre {
    border-radius: 0.8rem;
    font-family: 'Roboto Mono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;
    @apply bg-gray-50 dark:bg-[#2d3d33] inline-block px-8 pl-5;

    ::spelling-error {
      text-decoration: none;
    }

    ::grammar-error {
      text-decoration: none;
    }



    code {
      background: none;
      color: inherit;
      font-size: 1.1rem;
      padding: 0;
      font-family: 'Roboto Mono', monospace;
    }

    /* Code styling */
    .hljs-comment,
    .hljs-quote {
      @apply text-[#616161] dark:text-[#616161];
      /* Same color for both themes */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      @apply text-[#d32f2f] dark:text-[#f98181];
      /* Darker red for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      @apply text-[#e65100] dark:text-[#fbbc88];
      /* Darker orange for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      @apply text-[#33691e] dark:text-[#b9f18d];
      /* Darker green for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-title,
    .hljs-section {
      @apply text-[#f9a825] dark:text-[#faf594];
      /* Slightly darker yellow for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      @apply text-[#0277bd] dark:text-[#70cff8];
      /* Darker blue for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-emphasis {
      font-style: italic;
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-strong {
      font-weight: 700;
      font-family: 'Roboto Mono', monospace;
    }
  }
}

/* Basic editor styles */
.tiptap {

  /* First child margin */
  :first-child {
    margin-top: 0;
  }

  /* Table-specific styling */
  table {
    @apply border-collapse w-full table-fixed overflow-hidden m-0;

    td,
    th {
      @apply border box-border min-w-[1em] p-2 align-top relative;

      /* Adding transparent borders */
      @apply border-black/10 dark:border-white/20;

      /* Ensure child elements have no bottom margin */
      >* {
        @apply mb-0;
      }
    }

    th {
      @apply font-normal text-left;

      /* Light and dark mode for table header */
      @apply bg-gray-50 dark:bg-[#1f2920];
    }

    /* Selected cell styling */
    .selectedCell:after {
      content: "";
      @apply absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none;

      /* Light and dark mode for selected cell */
      @apply bg-gray-100 dark:bg-[#182021];
    }

  }

  /* Table wrapper for horizontal scroll */
  .tableWrapper {
    @apply my-6 overflow-x-auto border-opacity-60;
  }

  /* Resize cursor */
  &.resize-cursor {
    @apply cursor-ew-resize;
  }
}


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
  @apply bg-[#fcfada] text-amber-400 dark:bg-[#757142] dark:text-amber-100;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
}

code {
  font-family: 'Roboto Mono';
  font-size: 18px;
  border-radius: 0.6rem;
  padding: 0.1rem 0.3rem;

  @apply bg-gray-200/70 dark:bg-[#516b53] dark:text-white/80 text-black/80
}

/* Color swatches */
.tiptap .color {
  white-space: nowrap;
}

.tiptap .color::before {
  background-color: var(--color);
  /* border: 1px solid rgba(128, 128, 128, 0.3); */
  border-radius: 8px;
  content: " ";
  display: inline-block;
  height: 1em;
  margin-bottom: 0.15em;
  margin-right: 0.3em;
  vertical-align: middle;
  width: 1em;
}

.tiptap p.is-editor-empty:first-child::before {
  color: #cdcdcd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  font-size: x-large;
  position: relative;
  top: -6px;
}

/* Task list specific styles */
ul[data-type="taskList"] {
  list-style: none;
  margin-left: 14px;
  padding: 0;
}

ul[data-type="taskList"] li {
  align-items: center;
  display: flex;
  margin-bottom: 0.5rem;
  /* Optional: Add space between tasks */
}

ul[data-type="taskList"] li>label {
  display: flex;
  align-items: center;
  user-select: none;
}

ul[data-type="taskList"] label>input[type="checkbox"] {
  cursor: pointer;
  appearance: none;
  /* Remove default appearance */
  width: 20px;
  height: 20px;
  border: 2px solid #eaeaea;
  /* Border to match background */
  border-radius: 8px;
  /* Rounded corners */
  margin-right: 0.5rem;
  /* Space between checkbox and text */
  position: relative;
}

ul[data-type="taskList"] label>input[type="checkbox"]:checked {
  background-color: #00bcf0;
  border-color: #00bcf0;
}

ul[data-type="taskList"] label>input[type="checkbox"]:checked::after {
  content: '✔';
  /* Checkmark symbol */
  color: white;
  font-size: 14px;
  display: block;
  text-align: center;
  line-height: 18px;
}

ul[data-type="taskList"] label>div {
  flex: 1 1 auto;
}
</style>