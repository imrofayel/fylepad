<template>
        <floating-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden bg-white dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 rounded-xl border text-black dark:text-white/85">
          <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('heading', { level: 1 }) }"
            class="rounded-l-lg hover:bg-gray-100 hover:dark:bg-[#171717] p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 12h8m-8 6V6m8 12V6m5 6l3-2v8" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('bulletList') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#171717]">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('orderedList') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6h11m-11 6h11m-11 6h11M4 6h1v4m-1 0h2m0 8H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleTaskList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('taskList', { level: 1 }) }"
            class="hover:bg-gray-100 hover:dark:bg-[#171717] p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
                <path d="M14 4h7m-7 5h7m-7 6h7m-7 5h7" />
              </g>
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleCode().run()"
            :class="{ 'dark:bg-[#171717] bg-gray-100': editor.isActive('code') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#171717]">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m16 18l6-6l-6-6M8 6l-6 6l6 6" />
            </svg>

          </button>
        </div>
      </floating-menu>
</template>

<script lang="ts" setup>

import { FloatingMenu } from '@tiptap/vue-3';

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

</script>