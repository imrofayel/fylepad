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

          <button @click="setLink"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('link') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">


            <svg width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 14.5L14.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M16.8463 14.6095L19.4558 12C21.5147 9.94112 21.5147 6.60302 19.4558 4.54415C17.397 2.48528 14.0589 2.48528 12 4.54415L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39045"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
        </svg>

          </button>

          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('highlight') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">
            <div class="w-5 h-5 bg-yellow-400 dark:bg-yellow-500 rounded-full border dark:border-none border-black/50">
            </div>
          </button>

          <button @click="readSelectedText"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2 border-l border-gray-200 dark:border-[#525252]">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>
        </div>
      </bubble-menu>
</template>

<script lang="ts" setup>

import { BubbleMenu } from '@tiptap/vue-3';
import { ref } from 'vue';

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

const isReading = ref(false);

const setLink = () => {
  if (!props.editor) return;

  const previousUrl = props.editor.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  // update link
  try {
    props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  } catch (e: any) {
    alert(e.message);
  }
};

const readSelectedText = () => {
  if (!props.editor) return;
  
  const selectedText = props.editor.state.selection.content().content.firstChild?.textContent;
  if (!selectedText) return;

  if (isReading.value) {
    window.speechSynthesis.cancel();
    isReading.value = false;
    return;
  }

  isReading.value = true;
  const utterance = new SpeechSynthesisUtterance(selectedText);
  
  utterance.onend = () => {
    isReading.value = false;
  };

  window.speechSynthesis.speak(utterance);
};

</script>

<style>
/* Add animation for the speaker button when reading */
button:has(svg) {
  transition: all 0.3s ease;
}

button:has(svg):hover {
  transform: scale(1.1);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

button:has(svg).reading {
  animation: pulse 1s infinite;
}
</style>