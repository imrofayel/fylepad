<template>
  <div>
    <transition name="slide-up">
      <div v-if="isOpen" class="fixed bottom-0 left-0 right-0 z-50 bg-opaque border-gray-300 border-t rounded-t-[10px]":style="{ maxHeight: '70%', overflowY: 'auto' }">
        <div class="flex justify-end items-center px-4 py-3 dark:border-[#2a3828]">
          <button @click="closeSheet" class="hover:bg-primaryContainer backdrop-blur-xl flex p-[3px] rounded-[6px] justify-center items-center cursor-pointer tab-item">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.22 8.47a.75.75 0 0 1 1.06 0L12 15.19l6.72-6.72a.75.75 0 1 1 1.06 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L4.22 9.53a.75.75 0 0 1 0-1.06Z" fill="#212121"/></svg>
          </button>
        </div>
        <div class="px-4 pb-4">
          <Menu as="div" class="relative text-left">
            <div>
              <MenuButton @click="toggleFontDrawer" class=" bg-gray-50 text-onPrimaryContainer hover:bg-opaque border-gray-300 border-[0.1px] flex p-[10px] px-[15px] rounded-[6px] justify-center items-center cursor-pointer tab-item">
                <span class="mr-2" :style="{ fontFamily: selectedFont }" >{{ selectedFont || 'Select Font' }}</span>
                <svg v-if="isFontDrawerOpen === false" xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" class="opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" class="opacity-20">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 15l6-6l6 6" />
                </svg>
              </MenuButton>
            </div>

            <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
              <MenuItems class="z-10 dropdown-menu right-0 mt-4 py-2 origin-top-right divide-y rounded-[6px] bg-primaryContainer text-onPrimaryContainer overflow-hidden max-h-60 overflow-y-auto inline-block shadow-xl shadow-gray-300 border-gray-300 border-[0.1px]">
                <div class="p-2 flex space-x-2">
                  <input v-model="searchQuery" placeholder="Search" class="flex-1 placeholder:text-gray-500 outline-none p-2 px-4 bg-gray-50  border-b-[2px] focus:border-purple-500 backdrop-blur-xl rounded-[6px]"/>
                </div>
                <div v-if="filteredFonts.length === 0" class="p-4 text-onPrimaryContainer">
                  No fonts found
                </div>
                <div v-else class="p-2 flex flex-col space-y-2 text-onPrimaryContainer">
                  <button title="Reset Font" @click="resetFont" :class="[ 'text-left block w-full px-4 rounded-[6px] text-lg py-1.5 transition-colors hover:bg-primary',]">
                    Default
                  </button>                  
                  <MenuItem v-for="font in filteredFonts" :key="font" v-slot="{ active }">
                    <button :class="['block w-full px-4 rounded-[6px] text-xl py-2 text-left transition-colors hover:bg-primary',]" :style="{ fontFamily: font }" @click="selectFont(font)">
                      {{ font }}
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
          <div class="flex my-3 space-x-3 items-center">
            <div class="bg-gray-50 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-300 flex px-3 p-1 rounded-[6px] justify-center items-center text-black/75">
              Color
            </div>
            <input ref="colorPicker" type="color" :value="editor.getAttributes('textStyle').color"@input="updateColor"class="color-picker" />
            <button title="Reset Color" class="dark:text-white/90 backdrop-blur-lg  flex px-3 p-1 rounded-[0.6rem] justify-center items-center text-black/75" @click="resetColor">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5a7.5 7.5 0 1 0 7.419 6.392c-.067-.454.265-.892.724-.892.37 0 .696.256.752.623A9 9 0 1 1 18 5.292V4.25a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1 0-1.5h1.35a7.474 7.474 0 0 0-5.1-2Z" fill="#3d3d3d"/></svg>
            </button>
          </div>

          <div class="flex space-x-4">
            <div class="flex space-x-4 dark:text-white/40 text-black/30">
              <div class="bg-gray-50 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-300 flex px-3 p-1 rounded-[6px] justify-center items-center text-black/75">
                Text align
              </div>

              <button @click="setTextAlign('left')" :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('left') }" class="p-1 hover:bg-white/70 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 5.75A.75.75 0 0 1 2.75 5h15.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 5.75ZM2 18.75a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2.75 11.5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75Z" fill="#a3a3a3"/></svg>
              </button>

              <button @click="setTextAlign('center')" :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('center') }"class="p-1 hover:bg-white/70 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.75A.75.75 0 0 1 4.75 5h14.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 5.75ZM6 18.75a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM2.75 11.5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75Z" fill="#a3a3a3"/></svg>  
              </button>

              <button @click="setTextAlign('right')" :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('right') }" class="p-1 hover:bg-white/70 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.75A.75.75 0 0 1 5.75 5h15.5a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 5.75ZM10 18.75a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5h-10.5a.75.75 0 0 1-.75-.75ZM2.75 11.5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75Z" fill="#a3a3a3"/></svg>
              </button>

              <button @click="setTextAlign('justify')" :class="{ 'text-black/75 dark:text-white/90': isActiveAlign('justify') }"class="p-1 hover:bg-white/70 dark:hover:bg-[#2a3828] rounded-lg transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 5.75A.75.75 0 0 1 2.75 5h18.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 5.75ZM2 18.75a.75.75 0 0 1 .75-.75h18.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2.75 11.5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75Z" fill="#a3a3a3"/></svg>
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
  },
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

const isFontDrawerOpen = ref(false);

function toggleFontDrawer() {
  isFontDrawerOpen.value = !isFontDrawerOpen.value
}

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