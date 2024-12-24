<template>
  <div>
    <transition name="slide-up">
      <div v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white border border-b-0 drop-shadow-cooltop border-gray-200 rounded-t-3xl"
        :style="{ maxHeight: '70%', overflowY: 'auto' }">
        <div class="flex justify-end items-center px-4 py-3 dark:border-[#2a3828]">
          <button @click="closeSheet"
            class="bg-white border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-2 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool tab-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24" class="drop-shadow-sm">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 5L5 19M5 5l14 14" color="currentColor" />
            </svg>
          </button>
        </div>
        <div class="px-4 pb-4">
          <Menu as="div" class="relative text-left">
            <div>
              <MenuButton
                class="bg-white border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-3 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool">
                <span class="mr-2 text-xl" :style="{ fontFamily: selectedFont }">{{ selectedFont || 'Select Font'
                  }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" class="opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="m6 9l6 6l6-6" />
                </svg>
              </MenuButton>
            </div>

            <transition enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0">
              <MenuItems
                class="z-10 right-0 mt-4 origin-top-right divide-y rounded-2xl text-onPrimaryContainer overflow-hidden max-h-60 overflow-y-auto inline-block bg-white border !border-gray-200 backdrop-blur-xl justify-center items-center cursor-pointer drop-shadow-cool">
                <div class="p-2 inline-flex space-x-2">
                  <input v-model="searchQuery" placeholder="Search"
                    class="placeholder:text-gray-400 dark:placeholder:text-gray-200/80 bg-transparent outline-none mt-1 p-2 px-3 bg-white border dark:border-none border-gray-200 rounded-xl dark:bg-[#171f18] drop-shadow-cool text-black dark:text-white/90 flex justify-center" />
                  <button title="Reset Font" @click="resetFont"
                    class="border border-gray-200 bg-white/80 text-gray-800/90 !px-[8px]  rounded-xl justify-center items-center cursor-pointer  inline-block drop-shadow-cool">
                    <svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 24 24" class="drop-shadow-sm">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="1.5"
                        d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5"
                        color="currentColor" />
                    </svg>
                  </button>
                </div>
                <div v-if="filteredFonts.length === 0" class="p-4 text-onPrimaryContainer drop-shadow-sm">
                  No fonts found.
                </div>
                <div v-else class="p-2 flex flex-col space-y-2 text-onPrimaryContainer">
                  <MenuItem v-for="font in filteredFonts" :key="font" v-slot="{ active }">
                  <button :class="[
                    'block w-full px-4 hover:border rounded-xl !text-xl py-2 text-left hover:bg-gray-50', active ? 'bg-gray-50' : ''
                  ]" :style="{ fontFamily: font }" @click="selectFont(font)">
                    {{ font }}
                  </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>

          <div class="flex my-3 space-x-4 items-center">
            <div
              class="bg-white border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-3 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool space-x-2 text-xl">
              <span>Color</span> <input ref="colorPicker" type="color" :value="editor.getAttributes('textStyle').color"
                @input="updateColor" class="color-picker" />
            </div>

            <button
              class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75"
              @click="resetColor">
              Reset
            </button>
          </div>

          <div class="flex space-x-4">
            <div class="flex space-x-4 dark:text-white/40 text-black/30">
              <div
                class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
                Text align
              </div>

              <button @click="setTextAlign('left')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('left') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M21 6H3m12 6H3m14 6H3" />
                </svg>
              </button>

              <button @click="setTextAlign('center')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('center') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M21 6H3m14 6H7m12 6H5" />
                </svg>
              </button>

              <button @click="setTextAlign('right')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('right') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M21 6H3m18 6H9m12 6H7" />
                </svg>
              </button>

              <button @click="setTextAlign('justify')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('justify') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  editor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const selectedFont = ref('')
const searchQuery = ref('')
const colorPicker = ref(null)

const fonts = [
  'Geist',
  'Anton',
  'Arial',
  'Amiri Arabic',
  'Bahnschrift',
  'Bangers',
  'Bebas Neue',
  'Cairo Arabic',
  'Cambria Math',
  'Comic Sans MS',
  'Consolas',
  'Courier New',
  'Dancing Script',
  'Franklin Gothic',
  'Georgia',
  'Gulzar Urdu',
  'Helvetica Now',
  'Impact',
  'Ink Free',
  'Inter',
  'Libre Baskerville',
  'Outfit',
  'Pacifico',
  'Permanent Marker',
  'Playfair Display',
  'Playpen Sans',
  'Prata',
  'Roboto Mono',
  'SpaceGrotesk',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana'
]

const filteredFonts = computed(() => {
  return fonts.filter(font =>
    font.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectFont = (font) => {
  selectedFont.value = font
  if (props.editor) {
    props.editor.chain().focus().setFontFamily(font).run()
  }
}

const resetFont = () => {
  if (props.editor) {
    props.editor.chain().focus().unsetFontFamily().run()
  }
  selectedFont.value = ''
}

const updateColor = (event) => {
  props.editor.chain().focus().setColor(event.target.value).run()
}

const resetColor = () => {
  props.editor.chain().focus().unsetColor().run()
}

const setTextAlign = (alignment) => {
  props.editor.chain().focus().setTextAlign(alignment).run()
}

const isActiveAlign = (alignment) => {
  return props.editor.isActive({ textAlign: alignment })
}

const closeSheet = () => {
  emit('close')
}
</script>

<style scoped>
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.2s ease-in;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>