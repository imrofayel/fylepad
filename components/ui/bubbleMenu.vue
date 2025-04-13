<template>
      <bubble-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50  bg-white border border-gray-200 rounded-xl text-black drop-shadow-cool dark:text-white/85">
          <button @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('bold') }"
            class="rounded-l-lg hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200/50 dark:bg-[#171717]': editor.isActive('italic') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 4h-9m4 16H5M15 4L9 20" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('strike') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">


            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6m-2-8h16" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('highlight') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2 rounded-r-lg">
            <div class="w-5 h-5 bg-yellow-400 dark:bg-yellow-500 rounded-full border dark:border-none border-black/50">
            </div>
          </button>
        </div>
      </bubble-menu>
</template>

<script lang="ts" setup>

import { BubbleMenu } from '@tiptap/vue-3';

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

</script>

<style>

</style>