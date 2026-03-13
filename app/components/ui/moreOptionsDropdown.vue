<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger>
      <button class="p-1 transition-colors dark:text-gray-50" title="More Options">
        <svg
          aria-hidden="true"
          fill="currentColor"
          role="graphics-symbol"
          viewBox="0 0 20 20"
          class="ellipsis"
          style="width: 22px; display: block; flex-shrink: 0"
        >
          <path
            d="M4 11.375a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75m6 0a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75m6 0a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75"
          />
        </svg>
      </button>
    </UiDropdownMenuTrigger>

    <UiDropdownMenuContent
      class="mr-2 flex min-w-[200px] flex-col gap-1 rounded-2xl border border-[#c6c6c4] bg-white px-0 py-0.5 text-black opacity-100 shadow-none drop-shadow-sm dark:border-[#525252] dark:bg-[#404040] dark:text-white"
    >
      <!-- Export Markdown -->
      <UiDropdownMenuItem>
        <button
          class="flex w-full items-center gap-2 rounded-xl p-2 pr-6 text-left text-[16px] transition-colors hover:bg-gray-100 dark:hover:bg-[#333333]"
          @click="$emit('exportMarkdown')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 16 16">
            <g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
              <path
                d="M5 1a2 2 0 0 0-2 2v4h1V3a1 1 0 0 1 1-1h3v2.5A1.5 1.5 0 0 0 9.5 6H12v7a1 1 0 0 1-1 1H9v1h2a2 2 0 0 0 2-2V5.414a1.5 1.5 0 0 0-.44-1.06L9.647 1.439A1.5 1.5 0 0 0 8.586 1zm6.793 4H9.5a.5.5 0 0 1-.5-.5V2.207z"
              />
              <path
                d="M2 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zm0 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-1.793l-2.146 2.147a.5.5 0 0 1-.708-.707L4.293 11H2.5a.5.5 0 0 1-.5-.5"
              />
            </g>
          </svg>
          <span>Export Markdown</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Import Markdown -->
      <UiDropdownMenuItem>
        <button
          class="flex w-full items-center gap-2 rounded-xl p-2 pr-6 text-left text-[16px] transition-colors hover:bg-gray-100 dark:hover:bg-[#333333]"
          @click="$emit('importMarkdown')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 16 16">
            <!-- Icon from Codicons by Microsoft Corporation - https://github.com/microsoft/vscode-codicons/blob/main/LICENSE -->
            <path
              fill="currentColor"
              d="M2 4.5v4.6l.924-1.6A3 3 0 0 1 5.522 6h6.393A1.5 1.5 0 0 0 10.5 5H7a.5.5 0 0 1-.354-.146L4.94 3.146A.5.5 0 0 0 4.586 3H3.5A1.5 1.5 0 0 0 2 4.5m5.069 9.495L7 14H3.5A2.5 2.5 0 0 1 1 11.5v-7A2.5 2.5 0 0 1 3.5 2h1.086a1.5 1.5 0 0 1 1.06.44L7.207 4H10.5a2.5 2.5 0 0 1 2.458 2.041c1.647.3 2.586 2.18 1.704 3.709l-1.585 2.745a3 3 0 0 1-2.598 1.5zM5.522 7A2 2 0 0 0 3.79 8l-1.585 2.745a1.5 1.5 0 0 0 1.299 2.25h6.975a2 2 0 0 0 1.732-1l1.585-2.745a1.5 1.5 0 0 0-1.3-2.25z"
            />
          </svg>
          <span>Import Markdown</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Light Mode (shown when in dark mode) -->
      <UiDropdownMenuItem v-if="colorMode?.value === 'dark'">
        <button
          class="flex w-full items-center gap-3 rounded-xl p-2 pr-6 text-left text-[16px] transition-colors hover:bg-gray-100 dark:hover:bg-[#333333]"
          @click="$emit('toggleTheme', 'light')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 16 16">
            <!-- Icon from Codicons by Microsoft Corporation - https://github.com/microsoft/vscode-codicons/blob/main/LICENSE -->
            <path
              fill="currentColor"
              d="M8 1.002a7 7 0 1 0 0 14a7 7 0 0 0 0-14m0 13v-12a6 6 0 1 1 0 12"
            />
          </svg>
          <span>Light Mode</span>
        </button>
      </UiDropdownMenuItem>

      <!-- Dark Mode (shown when in light mode) -->
      <UiDropdownMenuItem v-if="colorMode?.value === 'light'">
        <button
          class="flex w-full items-center gap-2 rounded-xl p-2 pr-6 text-left text-[16px] transition-colors hover:bg-gray-100 dark:hover:bg-[#333333]"
          @click="$emit('toggleTheme', 'dark')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="rotate-[180deg]"
            width="21"
            viewBox="0 0 16 16"
          >
            <!-- Icon from Codicons by Microsoft Corporation - https://github.com/microsoft/vscode-codicons/blob/main/LICENSE -->
            <path
              fill="currentColor"
              d="M8 1.002a7 7 0 1 0 0 14a7 7 0 0 0 0-14m0 13v-12a6 6 0 1 1 0 12"
            />
          </svg>
          <span>Dark Mode</span>
        </button>
      </UiDropdownMenuItem>

      <!-- About -->
      <UiDropdownMenuItem>
        <button
          class="flex w-full items-center gap-2 rounded-xl p-2 pr-6 text-left text-[16px] transition-colors hover:bg-gray-100 dark:hover:bg-[#333333]"
          @click="$emit('openAbout')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 16 16">
            <!-- Icon from Codicons by Microsoft Corporation - https://github.com/microsoft/vscode-codicons/blob/main/LICENSE -->
            <path
              fill="currentColor"
              d="M8.499 7.5a.5.5 0 1 0-1 0v3a.5.5 0 0 0 1 0zm.25-2a.749.749 0 1 1-1.499 0a.749.749 0 0 1 1.498 0M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8"
            />
          </svg>
          <span>About</span>
        </button>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script setup lang="ts">
interface Props {
  colorMode?: { value: "light" | "dark" };
}

defineProps<Props>();

defineEmits<{
  exportMarkdown: [];
  importMarkdown: [];
  toggleTheme: [theme: "light" | "dark"];
  openAbout: [];
}>();
</script>
