<template>
  <div class="flex">
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        class="bg-gray-50 hover:bg-white hover:bg-white/80 dark:bg-[#2d3d33] dark:text-white/90 hover:dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl flex px-3 p-1 rounded-2xl justify-center items-center text-black/75 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 7V4h16v3M9 20h6M12 4v16" />
        </svg>
        <span>Styles</span>
      </PopoverButton>

      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-1 opacity-0">
        <PopoverPanel class="absolute rounded-xl z-10 mb-3 w-80 top-12 -translate-x-1/2 transform px-4 sm:px-0">
          <div class="rounded-xl">
            <div
              class="relative border border-gray-100 dark:border-none rounded-xl flex flex-col justify-start items-start dark:bg-[#2d3d33] bg-gray-50 p-3">
              <div class="flex">
                <Menu as="div" class="text-left">
                  <MenuButton
                    class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
                    <span class="mr-2">{{ selectedFont || 'Select Font' }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" class="opacity-20">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" d="m6 9l6 6l6-6" />
                    </svg>
                  </MenuButton>

                  <transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <MenuItems
                      class="z-10 w-full dropdown-menu absolute right-0 mt-4 origin-top-right divide-y divide-gray-100 rounded-xl dark:text-white/90 dark:bg-[#1f2920] dark:border-none bg-gray-50 border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                      <div>
                        <div class="p-2 flex space-x-4">
                          <input v-model="searchQuery" placeholder="Search fonts..."
                            class="placeholder:text-gray-200 dark:placeholder:text-gray-50 outline-none p-2 bg-white/80 border dark:border-none border-gray-100 backdrop-blur-xl rounded-xl dark:bg-[#171f18] text-black/75 dark:text-white/90" />

                            <button title="Reset" @click="editor.chain().focus().unsetFontFamily().run()"><svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" class="opacity-10 dark:opacity-100"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 21l-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21m9 0H7M5 11l9 9"/></svg></button>

                        </div>
                        <div v-if="filteredFonts.length === 0" class="p-4 text-lg text-gray-500">
                          No fonts found
                        </div>
                        <div v-else>
                          <MenuItem v-for="font in filteredFonts" :key="font" v-slot="{ active }">
                          <button :class="[
                            'block w-full px-4 text-xl py-2 text-left'
                          ]" :style="{ fontFamily: font }" @click="selectFont(font)">
                            {{ font }}
                          </button>
                          </MenuItem>
                        </div>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>

              <div class="flex my-3 space-x-4 items-center">
                <div
                  class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
                  Color</div>
                <input ref="colorPicker" type="color" :value="editor.getAttributes('textStyle').color"
                  @change="editor.chain().focus().setColor($event.target.value).run()" />

                <div
                  class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75 cursor-pointer"
                  @click="editor.chain().focus().unsetColor().run()">Reset</div>
              </div>

              <div class="flex space-x-4">

                <div class="flex space-x-4 dark:text-white/40 text-black/30">
                  <div
                    class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
                    Text align
                  </div>

                  <button @click="editor.chain().focus().setTextAlign('left').run()"
                    :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'left' }) }"><svg
                      xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" d="M21 6H3m12 6H3m14 6H3" />
                    </svg></button>

                  <button @click="editor.chain().focus().setTextAlign('center').run()"
                    :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'center' }) }"><svg
                      xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" d="M21 6H3m14 6H7m12 6H5" />
                    </svg></button>

                  <button @click="editor.chain().focus().setTextAlign('right').run()"
                    :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'right' }) }"><svg
                      xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" d="M21 6H3m18 6H9m12 6H7" />
                    </svg></button>

                  <button @click="editor.chain().focus().setTextAlign('justify').run()"
                    :class="{ 'text-black/75 dark:text-white/90': editor.isActive({ textAlign: 'justify' }) }"> <svg
                      xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" d="M3 6h18M3 12h18M3 18h18" />
                    </svg></button>
                </div>

              </div>

            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Popover, PopoverButton, PopoverPanel, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { Editor } from '@tiptap/vue-3';

const props = defineProps({
  editor: {
    type: Editor,
    required: true
  }
});

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
];


const selectedFont = ref('');
const searchQuery = ref('');

const filteredFonts = computed(() => {
  return fonts.filter(font =>
    font.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectFont = (font) => {
  selectedFont.value = font;
  console.log('Selected font:', font);
  if (props.editor) {
    props.editor.chain().focus().setFontFamily(font).run();
  }
};

</script>

<style>
/* Styles remain unchanged */
.dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.dropdown-menu::-webkit-scrollbar {
  width: 0px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}

.dropdown-menu::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.color-picker:hover {
  transform: scale(1.1);
}
</style>