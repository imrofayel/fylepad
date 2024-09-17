<template>
  <div class="flex">
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton class="bg-gray-50 hover:bg-white hover:bg-white/80 dark:bg-[#2d3d33] dark:text-white/90 hover:dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl flex px-3 p-1 rounded-2xl justify-center items-center text-black/75 cursor-pointer"
      >
        
      <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>

      <span>Styles</span>
        
      </PopoverButton>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-1 opacity-0"
      >
        <!-- Positioning changes -->
        <PopoverPanel
          class="absolute z-10 mb-3 w-80 top-12 -translate-x-1/2 transform px-4 sm:px-0"
        >
          <div class="overflow-hidden rounded-xl">
            <div class="relative grid gap-8 bg-white p-7 lg:grid-cols-2">
              <button
                v-for="item in options"
                :key="item.name"
                @click="item.action"
                class="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50"
              >
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center text-white sm:h-12 sm:w-12"
                >
                  <div v-html="item.icon"></div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ item.description }}
                  </p>
                </div>
              </button>
            </div>
            <div class="bg-gray-50 p-4">
              <button
                @click="documentation"
                class="flow-root rounded-md px-2 py-2 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50"
              >
                <span class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">
                    Documentation
                  </span>
                </span>
                <span class="block text-sm text-gray-500">
                  Start exploring documentation
                </span>
              </button>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Editor } from '@tiptap/vue-3';

// Accepting Editor type as a prop
const props = defineProps({
  editor: {
    type: Editor,
    required: true
  }
})

// Options with buttons calling empty functions
const options = [
  {
    name: 'Save',
    description: 'Save your work',
    action: () => {
      // Save action goes here
    },
    icon: `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="#FFEDD5" />
        <path d="M24 11L35.2583 17.5V30.5L24 37L12.7417 30.5V17.5L24 11Z" stroke="#FB923C" stroke-width="2" />
      </svg>
    `,
  },
  {
    name: 'Edit',
    description: 'Edit the document',
    action: () => {
      // Edit action goes here
    },
    icon: `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="#FFEDD5" />
        <path d="M28.0413 20L23.9998 13L19.9585 20M32.0828 27.0001L36.1242 34H28.0415M19.9585 34H11.8755L15.9171 27" stroke="#FB923C" stroke-width="2" />
      </svg>
    `,
  },
  {
    name: 'Delete',
    description: 'Remove this note',
    action: () => {
      // Delete action goes here
    },
    icon: `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="#FFEDD5" />
        <rect x="13" y="32" width="2" height="4" fill="#FDBA74" />
      </svg>
    `,
  },
]

const documentation = () => {
  // Documentation function goes here
}
</script>
