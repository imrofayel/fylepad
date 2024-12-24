<template>
  <div>
    <transition name="slide-up">
      <div v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border border-b-0 drop-shadow-cooltop border-gray-200 rounded-t-3xl"
        :style="{ maxHeight: '70%', overflowY: 'auto' }">
        <div class="flex justify-end items-center px-4 py-3 dark:border-[#2a3828]">
          <button @click="closeSheet"
            class="bg-white dark:bg-[#171717] dark:border-[#484747] dark:text-gray-50 border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-2 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool tab-item">
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
                class="bg-white dark:bg-[#171717] dark:border-[#484747] dark:text-gray-50 border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-3 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool">
                <span class="mr-2 text-[18px]" :style="{ fontFamily: selectedFont }">{{ selectedFont || 'Select Font'
                  }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24"
                  class="opacity-20 dark:opacity-80">
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
                class="z-10 right-0 mt-4 origin-top-right divide-y rounded-2xl text-onPrimaryContainer overflow-hidden max-h-60 overflow-y-auto inline-block dark:bg-[#171717] dark:!border-[#484747] bg-white border !border-gray-200 backdrop-blur-xl justify-center items-center cursor-pointer drop-shadow-cool">
                <div class="p-2 inline-flex space-x-2">
                  <input v-model="searchQuery" placeholder="Search"
                    class="placeholder:text-gray-400 dark:placeholder:text-gray-200/80 bg-transparent outline-none mt-1 p-2 px-3 bg-white border dark:border-none border-gray-200 rounded-xl  drop-shadow-cool text-black dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 flex justify-center" />
                  <button title="Reset Font" @click="resetFont"
                    class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white/80 text-gray-800/90 !px-[8px]  rounded-xl justify-center items-center cursor-pointer inline-block drop-shadow-cool">
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
                    'block w-full px-4 hover:border rounded-xl !text-xl py-2 text-left 1 dark:text-white hover:bg-gray-50 dark:hover:bg-[#404040] dark:hover:border-[#414040]', active ? 'bg-gray-50' : ''
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
              class="bg-white dark:bg-[#171717] dark:border-[#484747] dark:text-gray-50 border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-3 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool space-x-2 text-[18px]">
              <span>Color</span>
              <input ref="colorPicker" type="color" :value="currentColor" @input="updateColor"
                class="color-picker hidden" />
              <button @click="$refs.colorPicker.click()" class="ml-2 p-1 rounded-full hover:bg-gray-100">
                <div class="h-5 w-5 rounded-full border" :style="{ backgroundColor: currentColor }" />
              </button>

              <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" class="drop-shadow-sm"
                @click="resetColor">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5"
                  color="currentColor" />
              </svg>
            </div>
          </div>

          <div class="flex space-x-4">
            <div class="flex space-x-4 dark:text-white/40 text-black/30">
              <div
                class="bg-white dark:bg-[#171717] dark:border-[#484747] dark:text-gray-50 border border-gray-200 text-onPrimaryContainer backdrop-blur-xl flex px-3 p-2 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool space-x-1 text-[18px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" class="drop-shadow-sm">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M10.855 8.891C11.383 8.297 11.648 8 12 8s.617.297 1.145.891l1.3 1.461c.704.79 1.055 1.185 1.055 1.648s-.351.858-1.055 1.648l-1.3 1.46c-.528.595-.793.892-1.145.892s-.617-.297-1.145-.891l-1.3-1.461C8.852 12.858 8.5 12.463 8.5 12s.351-.858 1.055-1.648zM5 12H2m20 0h-3m-7 7v3m0-20v3"
                    color="currentColor" />
                </svg><span>Text align</span>

                <div class="pl-2 flex space-x-1 text-gray-400 dark:text-white/40"><button @click="setTextAlign('left')"
                    :class="{ 'text-gray-900 hover:text-gray-900 dark:text-white/90 dark:hover:text-white/90': isActiveAlign('left') }"
                    class="p-1 hover:text-gray-500 dark:hover:text-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="drop-shadow-sm">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="1.5" d="M3 3h18M3 9h8m-8 6h18M3 21h8" color="currentColor" />
                    </svg>
                  </button>

                  <button @click="setTextAlign('center')"
                    :class="{ 'text-gray-900 hover:text-gray-900 dark:text-white/90 dark:hover:text-white/90': isActiveAlign('center') }"
                    class="p-1 hover:text-gray-500 dark:hover:text-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="drop-shadow-sm">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="1.5" d="M3 3h18M8 9h8M3 15h18M8 21h8" color="currentColor" />
                    </svg>
                  </button>

                  <button @click="setTextAlign('right')"
                    :class="{ 'text-gray-900 hover:text-gray-900 dark:text-white/90 dark:hover:text-white/90': isActiveAlign('right') }"
                    class="p-1 hover:text-gray-500 dark:hover:text-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="drop-shadow-sm">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="1.5" d="M3 3h18m-8 6h8M3 15h18m-8 6h8" color="currentColor" />
                    </svg>
                  </button>

                  <button @click="setTextAlign('justify')"
                    :class="{ 'text-gray-900 hover:text-gray-900 dark:text-white/90 dark:hover:text-white/90': isActiveAlign('justify') }"
                    class="p-1 hover:text-gray-500 dark:hover:text-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="drop-shadow-sm">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="1.5" d="M3 3h18M3 9h18M3 15h18M3 21h18" color="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>

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
const currentColor = ref('')

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
  currentColor.value = event.target.value
  props.editor.chain().focus().setColor(currentColor.value).run()
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