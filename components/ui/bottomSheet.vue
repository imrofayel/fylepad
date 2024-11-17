<template>
  <div>
    <transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 bg-opaque rounded-t-3xl"
        :style="{ maxHeight: '70%', overflowY: 'auto' }"
      >
        <div class="flex justify-end items-center px-4 py-3 dark:border-[#2a3828]">
          <button @click="closeSheet"
          class="bg-primaryContainer/50 text-onPrimaryContainer hover:bg-primaryContainer/80 backdrop-blur-xl flex px-3 p-3 rounded-2xl justify-center items-center cursor-pointer tab-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="19" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        </div>
        <div class="px-4 pb-4">
          <Menu as="div" class="relative text-left">
            <div>
              <MenuButton
                class=" bg-primaryContainer/50 text-onPrimaryContainer hover:bg-primaryContainer/80 flex px-3 p-3 rounded-2xl justify-center items-center cursor-pointer tab-item"
              >
                <span class="mr-2" :style="{ fontFamily: selectedFont }" >{{ selectedFont || 'Select Font' }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" class="opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="m6 9l6 6l6-6" />
                </svg>
              </MenuButton>
            </div>

            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems
                class="z-10 dropdown-menu right-0  mt-4 origin-top-right divide-y rounded-2xl bg-primaryContainer/50 text-onPrimaryContainer overflow-hidden max-h-60 overflow-y-auto inline-block"
              >
                <div class="p-2 flex space-x-2">
                  <input
                    v-model="searchQuery"
                    placeholder="Search"
                    class="flex-1 placeholder:text-onPrimaryContainer outline-none p-2 px-4 bg-white/40 focus:ring-2 ring-primaryContainer backdrop-blur-xl rounded-xl"
                  />
                  <button
                    title="Reset Font"
                    @click="resetFont"
                    class="bg-white/30 text-onPrimaryContainer hover:bg-white/60 backdrop-blur-xl flex px-3 p-3 rounded-2xl justify-center items-center cursor-pointer"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                <div v-if="filteredFonts.length === 0" class="p-4 text-onPrimaryContainer">
                  No fonts found
                </div>
                <div v-else class="p-2 flex flex-col space-y-2 text-onPrimaryContainer">
                  <MenuItem v-for="font in filteredFonts" :key="font" v-slot="{ active }">
                    <button
                      :class="[
                        'block w-full px-4 bg-white/30 rounded-xl text-xl py-2 text-left transition-colors hover:bg-white/60',
                      ]"
                      :style="{ fontFamily: font }"
                      @click="selectFont(font)"
                    >
                      {{ font }}
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>

          <div class="flex my-3 space-x-4 items-center">
            <div
              class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
              Color</div>
            <input 
              ref="colorPicker" 
              type="color" 
              :value="editor.getAttributes('textStyle').color"
              @input="updateColor"
              class="color-picker" 
            />
            <button
              class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75"
              @click="resetColor"
            >
              Reset
            </button>
          </div>

          <div class="flex space-x-4">
            <div class="flex space-x-4 dark:text-white/40 text-black/30">
              <div
                class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
                Text align
              </div>

              <button 
                @click="setTextAlign('left')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('left') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M21 6H3m12 6H3m14 6H3" />
                </svg>
              </button>

              <button 
                @click="setTextAlign('center')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('center') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M21 6H3m14 6H7m12 6H5" />
                </svg>
              </button>

              <button 
                @click="setTextAlign('right')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('right') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M21 6H3m18 6H9m12 6H7" />
                </svg>
              </button>

              <button 
                @click="setTextAlign('justify')"
                :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('justify') }"
                class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3828] rounded-lg transition-colors"
              >
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

.dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.dropdown-menu::-webkit-scrollbar {
  width: 4px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background-color: transparent;
}

.color-picker {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background-color: transparent;
}

.color-picker::-webkit-color-swatch {
  border: 2px solid rgb(229 231 235);
  border-radius: 8px;
  padding: 0;
}

.color-picker::-moz-color-swatch {
  border: 2px solid rgb(229 231 235);
  border-radius: 8px;
  padding: 0;
}

/* Dark mode styles for color picker */
:global(.dark) .color-picker::-webkit-color-swatch {
  border-color: #2a3828;
}

:global(.dark) .color-picker::-moz-color-swatch {
  border-color: #2a3828;
}

.color-picker:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>