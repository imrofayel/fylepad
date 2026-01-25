<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger>
      <button 
        class="p-1 transition-colors dark:text-gray-50"
        title="More Options"
      >
        <svg 
          aria-hidden="true" 
          fill="currentColor"
          role="graphics-symbol" 
          viewBox="0 0 20 20" 
          class="ellipsis" 
          style="width: 22px; display: block; flex-shrink: 0;"
        >
          <path d="M4 11.375a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75m6 0a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75m6 0a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75"></path>
        </svg>
      </button>
    </UiDropdownMenuTrigger>
    
    <UiDropdownMenuContent class="flex flex-col gap-1 px-0 py-0.5 border dark:bg-[#404040] dark:border-[#525252] dark:text-white opacity-100 border-[#c6c6c4] bg-white text-black drop-shadow-sm shadow-none rounded-2xl min-w-[200px] mr-2">
      
      <!-- Export Markdown -->
      <UiDropdownMenuItem>
        <button 
          @click="$emit('exportMarkdown')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22"viewBox="0 0 32 32"><!-- Icon from Pixel free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ --><path fill="currentColor" d="M28.955 22.85h-25.9V7.62h-1.53V25.9h1.53v1.53h9.14v1.52h1.52v-1.52h4.57v1.52h1.53v-1.52h9.14V25.9h1.52V7.62h-1.52zm-7.62-16.76h7.62v1.53h-7.62Zm-9.14 24.38v-1.52h-1.52V32h10.66v-3.05h-1.52v1.52zm1.52-27.42h4.57v1.52h-4.57Zm0-3.05h4.57v1.52h-4.57Z"/><path fill="currentColor" d="M16.765 19.81v-1.53h1.52v-1.52h1.53v-1.52h1.52v-1.53h-3.05V6.09h-4.57v7.62h-3.04v1.53h1.52v1.52h1.52v1.52h1.53v1.53zM3.055 6.09h7.62v1.53h-7.62Z"/></svg>
          <span>Export Markdown</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Import Markdown -->
      <UiDropdownMenuItem>
        <button 
          @click="$emit('importMarkdown')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 32 32"><path fill="currentColor" d="M30.472 3.045h-1.52v-1.52h-1.52v-1.53H6.092v12.2h-4.57v1.52h7.62v-1.52h-1.52V1.525h16.76v6.09h6.09v15.24h-1.52v3.05h1.52v4.57h1.53v-25.9h-1.53zm-22.85 27.43h22.85v1.52H7.622Z"/><path fill="currentColor" d="M27.432 19.805h1.52v3.05h-1.52Zm-1.53-3.04h1.53v3.04h-1.53Zm-15.23-1.53h15.23v1.53h-15.23Zm9.14-7.62h1.52v1.53h-1.52Zm-4.57 3.05h4.57v1.53h-4.57Zm-1.53-3.05h1.53v1.53h-1.53Zm-4.57 6.1h1.53v1.52h-1.53Zm-3.05 13.71h1.53v3.05h-1.53Zm-1.52-3.04h1.52v3.04h-1.52Zm-1.52-3.05h1.52v3.05h-1.52Zm-1.53-3.05h1.53v3.05h-1.53Zm-1.52-4.57h1.52v4.57H.002Z"/></svg>
          <span>Import Markdown</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Light Mode (shown when in dark mode) -->
      <UiDropdownMenuItem v-if="colorMode?.value === 'dark'">
        <button 
          @click="$emit('toggleTheme', 'light')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 32 32"><!-- Icon from Pixel free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ --><path fill="currentColor" d="M29.71 11.43h-1.52v1.52h-1.52v1.53h1.52V16h1.52v-1.52h1.53v-1.53h-1.53zM28.19 22.1h1.52v1.52h-1.52ZM26.67.76v1.53h-1.53v1.52h1.53v1.52h1.52V3.81h1.52V2.29h-1.52V.76zm-1.53 7.62h1.53v1.53h-1.53Zm0 18.29h-1.52v1.52h-1.53v1.53h1.53v1.52h1.52v-1.52h1.53v-1.53h-1.53zm-1.52-7.62h1.52v1.52h-1.52Zm-1.53 3.05h-9.14v1.52h7.62v1.52h1.52zM12.95 8.38v1.53h9.14V6.86h-1.52v1.52zm4.57 16.76h3.05v1.53h-3.05Zm1.53-6.09v-1.52h1.52V16h-1.52v-1.52h-1.53V16H16v1.53h1.52v1.52zM17.52 5.33h3.05v1.53h-3.05ZM9.9 26.67h7.62v1.52H9.9Zm1.53-6.1h1.52v1.53h-1.52Zm0-10.66h1.52v1.52h-1.52ZM9.9 3.81h7.62v1.52H9.9Zm0 7.62h1.53v9.14H9.9ZM6.86 25.14H9.9v1.53H6.86Zm0-19.81H9.9v1.53H6.86ZM5.33 23.62h1.53v1.52H5.33Zm0-16.76h1.53v1.52H5.33ZM3.81 20.57h1.52v3.05H3.81Zm0-12.19h1.52v3.05H3.81ZM2.29 29.72h1.52v1.52H2.29Zm0-18.29h1.52v9.14H2.29ZM.76 3.81h1.53v1.52H.76Z"/></svg>
          <span>Light Mode</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Dark Mode (shown when in light mode) -->
      <UiDropdownMenuItem v-if="colorMode?.value === 'light'">
        <button 
          @click="$emit('toggleTheme', 'dark')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="23.5" viewBox="0 0 32 32"><!-- Icon from Pixel free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ --><path fill="currentColor" d="M30.47 19.055H32v6.09h-1.53Zm-1.52-7.62H32v1.52h-3.05Zm0 13.71h1.52v1.53h-1.52Zm0-7.62h1.52v1.53h-1.52Zm0-13.71h1.52v1.52h-1.52Zm-1.52 22.86h1.52v1.52h-1.52Zm0-10.67h1.52v1.52h-1.52Zm0-10.67h1.52v1.53h-1.52ZM3.05 28.195h24.38v1.52H3.05Zm18.28-12.19h1.52v1.52h-1.52Zm0-13.72h1.52v3.05h-1.52Zm-1.52 15.24h1.52v1.53h-1.52Zm-4.57-12.19h1.52v1.53h-1.52Zm-1.53-1.52h1.53v1.52h-1.53Zm0 6.09h4.57v1.53h3.05v1.52h1.52v3.05h4.58v-6.1H25.9v-1.52h-1.52v-1.52h-4.57v1.52h-7.62v1.52h-1.53v1.53h3.05zm-3.05 9.15h1.53v1.52h-1.53Zm-1.52-1.53h1.52v1.53H9.14Zm0-6.09h1.52v1.52H9.14Zm0 6.09v-4.57H7.62v3.05H3.05v1.52zm-7.62 9.15h1.53v1.52H1.52Zm0-9.15h1.53v1.53H1.52ZM0 19.055h1.52v7.62H0Z"/></svg>
          <span>Dark Mode</span>
        </button>
      </UiDropdownMenuItem>

      <!-- About -->
      <UiDropdownMenuItem>
        <button 
          @click="$emit('openAbout')" 
          class="w-full flex items-center gap-3 p-2 pr-6 rounded-xl hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors text-[16px] text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 32 32"><!-- Icon from Pixel free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ --><path fill="currentColor" d="M.76 22.09v4.58h3.05v-1.53H2.29v-1.52h1.52v1.52h3.05v1.53h3.05v1.52h1.52v1.52H9.91v1.53h4.57v-1.53h-1.52v-1.52h1.52v-1.52h3.05v-1.53h3.04v-1.52h3.05v-1.53h3.05v-1.52h3.05v1.52h1.52v-4.57h-1.52V16h-3.05v-3.05h1.52V6.86h-1.52v1.52h-1.52V9.9h1.52v1.53h-1.52v1.52H22.1v1.53h-3.05V16H16v1.52h-3.04v1.53h-1.53v-1.53H9.91V16H6.86v-1.52H3.81v-1.53H2.29v-1.52h1.52v1.52h3.05v1.53h3.05V16H16v-1.52h3.05v-1.53h3.05v-1.52h3.05V9.9h-4.58v1.53h-3.04v1.52h-3.05v1.53h-3.05v-1.53H8.38v-1.52H5.34V9.9H2.29V8.38H.76v6.1h1.53V16H.76v4.57h1.53v1.52Zm1.53-4.57h1.52V16h1.53v1.52h3.04v1.53h1.53v1.52h4.57v-1.52h3.05v-1.53h3.04V16h3.05v-1.52h1.53v3.04H22.1v1.53h-3.05v1.52H16v1.52h-3.04v1.53H9.91v-1.53H6.86v-1.52H3.81v-1.52H2.29Z"/><path fill="currentColor" d="M26.67 22.09h3.05v1.53h-3.05Zm-3.05 1.53h3.05v1.52h-3.05Zm0-18.29h3.05v1.53h-3.05Zm-3.05 19.81h3.05v1.53h-3.05Zm0-21.33h3.05v1.52h-3.05Zm-3.04 22.86h3.04v1.52h-3.04Zm0-24.39h3.04v1.53h-3.04ZM14.48.76h3.05v1.52h-3.05Zm0 27.43h3.05v1.52h-3.05ZM11.43 2.28h3.05v1.53h-3.05ZM8.38 3.81h3.05v1.52H8.38ZM6.86 28.19h3.05v1.52H6.86Zm3.05-16.76H16V9.9h3.05V8.38h3.05V6.86h-4.57V5.33h-4.57v1.53H9.91v1.52H6.86V9.9h3.05zm-4.57-6.1h3.04v1.53H5.34ZM3.81 26.67h3.05v1.52H3.81ZM2.29 6.86h3.05v1.52H2.29Z"/></svg>
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
