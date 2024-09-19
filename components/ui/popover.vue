<template>
  <div class="flex">
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton @click="handlePopoverClick"
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
                    <span class="mr-2">{{ selectedFont || 'Inter' }}</span>
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
                      class="w-full dropdown-menu absolute right-0 mt-4 origin-top-right divide-y divide-gray-100 rounded-xl dark:text-white/90 dark:bg-[#1f2920] dark:border-none bg-gray-50 border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                      <div v-if="permissionDenied" class="p-4 text-sm text-gray-500">
                        <p>Permission to access local fonts was denied. Please enable it in your system settings.</p>
                        <button @click="requestPermission"
                          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                          Request Permission
                        </button>
                      </div>
                      <div v-else>
                        <div class="p-2">
                          <div class="flex fixed space-x-2"><input v-model="searchQuery" placeholder="Search fonts..."
                              class="placeholder:text-gray-200 dark:placeholder:text-gray-50 outline-none p-2 bg-white/80 border dark:border-none border-gray-100 backdrop-blur-xl rounded-xl dark:bg-[#171f18] text-black/75 dark:text-white/90" />

                            <button @click="resetFont" title="Reset"
                              class="bg-white/80 border border-gray-100 backdrop-blur-xl rounded-xl flex dark:text-white/90 dark:bg-[#171f18] dark:border-transparent px-3 p-1 justify-center items-center text-gray-200 cursor-pointer">

                              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                  stroke-width="2"
                                  d="m7 21l-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21m9 0H7M5 11l9 9" />
                              </svg>

                            </button>

                          </div>

                        </div>
                        <div v-if="uniqueFonts.length === 0" class="p-4 text-sm text-gray-500">
                          Loading fonts...
                        </div>
                        <div v-else class="mt-10">
                          <MenuItem v-for="font in filteredFonts" :key="font.family" v-slot="{ active }">
                          <button :class="[
                            'block w-full px-4 py-2 text-left'
                          ]" :style="{ fontFamily: font.family }" @click="selectFont(font)">
                            {{ font.family }}
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
                  Color</div><input ref="colorPicker" type="color"
                  @change="editor.chain().focus().setColor($event.target.value).run()" />

                <div
                  class="bg-white/80 dark:text-white/90 hover:dark:bg-[#1f2b24] dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg border border-gray-100 flex px-3 p-1 rounded-2xl justify-center items-center text-black/75 cursor-pointer"
                  @click="editor.chain().focus().unsetColor().run()">Reset</div>

              </div>

            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Popover, PopoverButton, PopoverPanel, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { Editor } from '@tiptap/vue-3';

const props = defineProps({
  editor: {
    type: Editor,
    required: true
  }
});

const fonts = ref([]);
const selectedFont = ref('');
const fontsLoaded = ref(false);
const searchQuery = ref('');
const permissionDenied = ref(false);

const uniqueFonts = computed(() => {
  const uniqueFontMap = new Map();
  fonts.value.forEach(font => {
    if (!uniqueFontMap.has(font.family)) {
      uniqueFontMap.set(font.family, font);
    }
  });
  return Array.from(uniqueFontMap.values());
});

const filteredFonts = computed(() => {
  return uniqueFonts.value.filter(font =>
    font.family.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const loadFonts = async () => {
  if (fontsLoaded.value) return;

  try {
    const availableFonts = await window.queryLocalFonts();
    fonts.value = availableFonts;
    fontsLoaded.value = true;
    permissionDenied.value = false;
  } catch (err) {
    console.error('Error loading fonts:', err);
    permissionDenied.value = true;
  }
};

const handlePopoverClick = () => {
  if (!fontsLoaded.value) {
    loadFonts();
  }
};

const selectFont = (font) => {
  selectedFont.value = font.family;
  console.log('Selected font:', font.family);
  if (props.editor) {
    props.editor.chain().focus().setFontFamily(font.family).run();
  }
};

const resetFont = () => {
  selectedFont.value = '';
  console.log('Font reset');
  if (props.editor) {
    props.editor.chain().focus().unsetFontFamily().run();
  }
};

const requestPermission = async () => {
  try {
    // This will trigger a new permission request
    await window.queryLocalFonts();
    // If successful, load the fonts
    loadFonts();
  } catch (err) {
    console.error('Permission request failed:', err);
    // The user likely denied the permission again
    permissionDenied.value = true;
  }
};

onMounted(() => {
  if (!('queryLocalFonts' in window)) {
    console.warn('Local Font Access API is not supported in this browser.');
    permissionDenied.value = true;
  } else {
    loadFonts();
  }
});

</script>

<style>
/* General class for transparent scrollbars */
.dropdown-menu {
  scrollbar-width: thin;
  /* For Firefox */
  scrollbar-color: transparent transparent;
}

.dropdown-menu::-webkit-scrollbar {
  width: 0px;
  /* Adjust the width if needed */
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
  /* Fully transparent */
}

.dropdown-menu::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
  /* Fully transparent */
}

.color-picker {
  /* Set a fixed size */
  width: 40px;
  height: 40px;

  /* Remove default border and add custom styles */
  border: none;
  border-radius: 50%;

  /* Add a shadow and transition effect */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  /* Add hover effect */
  cursor: pointer;
}

.color-picker:hover {
  transform: scale(1.1);
  /* Enlarge slightly on hover */
}
</style>