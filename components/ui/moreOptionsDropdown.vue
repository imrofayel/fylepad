<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger>
      <button 
        class=" p-1 transition-colors"
        title="More Options"
      >
        <svg 
          aria-hidden="true" 
          role="graphics-symbol" 
          viewBox="0 0 20 20" 
          class="ellipsis" 
          style="width: 22px; display: block; flex-shrink: 0;"
        >
          <path d="M4 11.375a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75m6 0a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75m6 0a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75"></path>
        </svg>
      </button>
    </UiDropdownMenuTrigger>
    
    <UiDropdownMenuContent class="flex flex-col gap-1 px-1 py-1 border dark:bg-[#404040] dark:border-[#525252] dark:text-white opacity-100 border-[#c6c6c4] bg-white text-black drop-shadow-sm shadow-none rounded-2xl min-w-[200px] mr-2">
      
      <!-- Export Markdown -->
      <UiDropdownMenuItem>
        <button 
          @click="$emit('exportMarkdown')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="arrowLineDown" style="width: 23px; display: block; flex-shrink: 0;">
            <path d="M10 2.4c.345 0 .625.28.625.625v9.966l3.333-3.333a.625.625 0 1 1 .884.884l-4.4 4.4a.625.625 0 0 1-.884 0l-4.4-4.4a.625.625 0 0 1 .884-.884l3.333 3.333V3.025c0-.345.28-.625.625-.625M4.15 16.35a.625.625 0 1 0 0 1.25h11.7a.625.625 0 0 0 0-1.25z"></path>
          </svg>
          <span>Export Markdown</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Import Markdown -->
      <UiDropdownMenuItem>
        <button 
          @click="$emit('importMarkdown')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="arrowLineUp" style="width: 23px; display: block; flex-shrink: 0;">
            <path d="M15.85 3.65a.625.625 0 1 0 0-1.25H4.15a.625.625 0 1 0 0 1.25zm-1.008 6.692a.625.625 0 0 1-.884 0l-3.333-3.333v9.966a.625.625 0 1 1-1.25 0V7.009l-3.333 3.333a.625.625 0 1 1-.884-.884l4.4-4.4a.625.625 0 0 1 .884 0l4.4 4.4a.625.625 0 0 1 0 .884"></path>
          </svg>
          <span>Import Markdown</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Light Mode (shown when in dark mode) -->
      <UiDropdownMenuItem v-if="colorMode?.value === 'dark'">
        <button 
          @click="$emit('toggleTheme', 'light')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="23px" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707"/>
            </g>
          </svg>
          <span>Light Mode</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Dark Mode (shown when in light mode) -->
      <UiDropdownMenuItem v-if="colorMode?.value === 'light'">
        <button 
          @click="$emit('toggleTheme', 'dark')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
          </svg>
          <span>Dark Mode</span>
        </button>
      </UiDropdownMenuItem>

      <!-- About -->
      <UiDropdownMenuItem>
        <button 
          @click="$emit('openAbout')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="questionMarkCircle" style="width: 23px; display: block; flex-shrink: 0;">
            <path d="M9.978 7.154c-.804 0-1.333.456-1.438.874a.625.625 0 0 1-1.213-.303c.28-1.121 1.44-1.82 2.65-1.82 1.365 0 2.714.905 2.714 2.298 0 .812-.49 1.477-1.13 1.872l-.755.516a.84.84 0 0 0-.381.677.625.625 0 1 1-1.25 0c0-.688.36-1.318.921-1.706l.003-.002.784-.535.014-.008c.374-.228.544-.537.544-.814 0-.459-.517-1.049-1.463-1.049m.662 6.336a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0"></path>
            <path d="M2.375 10a7.625 7.625 0 1 1 15.25 0 7.625 7.625 0 0 1-15.25 0M10 3.625a6.375 6.375 0 1 0 0 12.75 6.375 6.375 0 0 0 0-12.75"></path>
          </svg>
          <span>About</span>
        </button>
      </UiDropdownMenuItem>

    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script setup lang="ts">
interface Props {
  colorMode?: { value: 'light' | 'dark' }
}

defineProps<Props>()

defineEmits<{
  exportMarkdown: []
  importMarkdown: []
  toggleTheme: [theme: 'light' | 'dark']
  openAbout: []
}>()
</script>
