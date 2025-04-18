<template>
<div v-if="open" 
           class="voice-settings-panel dark:!bg-[#404040] rounded-3xl border bg-white backdrop-blur-2xl dark:text-white dark:border-[#525252] text-black !z-[1100000]" 
           role="dialog" 
           aria-label="About Fylepad">

        <div class="fixed bg-red-600 rounded-full opacity-90 text-white right-0 -top-1 cursor-pointer" :onclick="close"><svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24"><path fill="currentColor" d="m12 13.4l-2.9 2.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l2.9-2.9l-2.9-2.875q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l2.9 2.9l2.875-2.9q.275-.275.7-.275t.7.275q.3.3.3.713t-.3.687L13.375 12l2.9 2.9q.275.275.275.7t-.275.7q-.3.3-.712.3t-.688-.3z"/></svg></div>

        <div class="flex items-center justify-between opacity-90">
          <span class="text-xl drop-shadow-sm opacity-95">fylepad</span>

          <span class="text-xl drop-shadow-sm opacity-95 tracking-tight" style="font-family: 'SpaceGrotesk';">v2.2</span>
        </div>

        <p class="text-lg mt-3">Your perfect note-taking app!</p>

        <p class="text-lg mt-4"><span class="bg-green-100 dark:!bg-white/5 p-1 rounded-xl px-2 hidden sm:block">Open Source</span> <span class="bg-blue-100 dark:!bg-white/5  p-1 rounded-xl px-2">Made by Adam Rofayel</span></p>

        <p class="text-lg mt-4 flex justify-between items-center"><span class="bg-purple-100 dark:!bg-white/5 p-1 rounded-xl px-2">Can you star us on GitHub?</span> <a href="https://github.com/imrofayel/fylepad" target="_blank" class="text-black dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
        </a></p>
      </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  close: {
    type: Function,
    required: true
  }
})

</script>

<style>

</style>