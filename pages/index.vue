<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex justify-between items-center w-full p-3 py-2 fixed bg-[#f4f4f4] dark:bg-[#263029] backdrop-blur-lg z-10">

      <div class="flex space-x-2 overflow-x-auto justify-center items-center">

        <div class="flex space-x-2">
      <!-- Close button -->
      <button @click="closeWindow()"
        class="w-3 h-3 rounded-full transition-colors duration-200 flex items-center justify-center bg-red-400"
      >
      </button>

      <!-- Minimize button -->
      <button @click="minimizeWindow()"
        class="w-3 h-3 rounded-full transition-colors duration-200 flex items-center justify-center bg-yellow-400 overflow-hidden"
      >
      </button>

      <!-- Maximize button -->
      <button @click="maximizeWindow()"
        class="w-3 h-3 rounded-full transition-colors duration-200 flex items-center justify-center bg-green-400"
      >
      </button>

      <div></div>
    </div>

        <div v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
          class="bg-[#e7e6e660] dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl flex px-3 p-1 rounded-2xl justify-center items-center dark:text-white/90 text-black/80 cursor-pointer"
          :class="{ 'bg-white/60 dark:bg-[#2d3d33]': activeTab === index }">
          {{ tab.title || 'Untitled' }}
          <button @click.stop="closeTab(index)" class="ml-2 dark:text-white/30 dark:hover:text-white/80 text-black/30 hover:text-black/80">&times;</button>
        </div>

        <button @click="newTab"
          class="backdrop-blur-lg flex px-2 p-1 rounded-2xl justify-center items-center text-black/10 dark:text-white/70 dark:hover:text-white hover:text-black/60">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7v14"/></svg>
        </button>
      </div>
      
      <div class="flex">
        <Menu as="div" class="relative inline-block text-left">
          <MenuButton class="bg-white/50 hover:bg-white/80 dark:text-white/90 dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent backdrop-blur-lg flex px-3 p-1 rounded-2xl justify-center items-center text-black/75">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></g></svg>
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems class="absolute right-0 mt-2 origin-top-right divide-y divide-gray-100 rounded-xl dark:text-white/90 dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-none bg-white overflow-hidden">
              <div>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="exportJson"
                    :class="[
                      active ? 'bg-white/80 dark:bg-[#1f2920] text-black' : 'text-black',
                      'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-[#e7e6e660]'
                    ]"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10v10M7 17L17 7"/></svg>Save
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="triggerFileInput"
                    :class="[
                      active ? 'bg-white dark:bg-[#1f2920] text-black' : 'text-black',
                      'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-[#e7e6e660]'
                    ]"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7L7 17m10 0H7V7"/></svg>Open
                  </button>
                </MenuItem>

                <MenuItem v-slot="{ active }" v-if="colorMode.value === 'dark'">
                  <button
                    @click="onClick('light')"
                    :class="[
                      active ? 'bg-white dark:bg-[#1f2920] text-black' : 'text-black',
                      'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-[#e7e6e660]'
                    ]"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707"/></g></svg>Light
                  </button>
                </MenuItem>

                <MenuItem v-slot="{ active }" v-if="colorMode.value === 'light'">
                  <button
                    @click="onClick('dark')"
                    :class="[
                      active ? 'bg-white dark:bg-[#1f2920] text-black' : 'text-black',
                      'group flex opacity-70 dark:text-white dark:bg-[#2d3d33] hover:dark:bg-[#1f2920] dark:border-transparent w-full items-center px-4 py-2 bg-white/80 hover:bg-[#e7e6e660]'
                    ]"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" class="mr-1.5 opacity-20"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9"/></svg>Dark
                  </button>
                </MenuItem>

              </div>
            </MenuItems>
          </transition>
        </Menu>
        <input type="file" ref="fileInput" accept="application/json" @change="importJson" class="hidden" />
      </div>
    </div>

    <div class="mt-14 flex-grow">
      <Editor v-if="tabs.length > 0" :key="activeTab" :title="tabs[activeTab].title"
        :content="tabs[activeTab].content" @update:title="updateTabTitle" @update:content="updateTabContent" />
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { fs, path } from '@tauri-apps/api';

import { appWindow } from '@tauri-apps/api/window';

async function closeWindow() {
  await appWindow.close();
}

async function minimizeWindow() {
  await appWindow.minimize();
}

async function maximizeWindow() {
  await appWindow.maximize();
}

const colorMode = useColorMode()

function onClick(val: string) {
  colorMode.preference = val
}

interface Tab {
  title: string;
  content: any;
}

const tabs = reactive<Tab[]>([{ title: 'Untitled', content: '' }]);
const activeTab = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

// Function to save the app state
async function saveAppState() {
  const appState = {
    tabs: tabs,
    activeTab: activeTab.value,
    colorMode: colorMode.preference
  };
  
  // Try to save using Tauri's fs API
  try {
    const appDir = await path.appDataDir();
    const filePath = await path.join(appDir, 'app_state.json');
    await fs.writeTextFile(filePath, JSON.stringify(appState));
  } catch (error) {
    // If Tauri's fs API fails, fall back to localStorage
    localStorage.setItem('appState', JSON.stringify(appState));
  }
}

// Function to load the app state
async function loadAppState() {
  let appState;

  // Try to load using Tauri's fs API
  try {
    const appDir = await path.appDataDir();
    const filePath = await path.join(appDir, 'app_state.json');
    const contents = await fs.readTextFile(filePath);
    appState = JSON.parse(contents);
  } catch (error) {
    // If Tauri's fs API fails, try localStorage
    const storedState = localStorage.getItem('appState');
    if (storedState) {
      appState = JSON.parse(storedState);
    }
  }

  // If we successfully loaded a state, apply it
  if (appState) {
    tabs.splice(0, tabs.length, ...appState.tabs);
    activeTab.value = appState.activeTab;
    colorMode.preference = appState.colorMode;
  }
}

// Load the app state when the component mounts
onMounted(async () => {
  await loadAppState();
});

// Watch for changes and save the state
watch([tabs, activeTab, () => colorMode.preference], async () => {
  await saveAppState();
}, { deep: true });

const newTab = () => {
  tabs.push({ title: 'Untitled', content: '' });
  activeTab.value = tabs.length - 1;
};

const closeTab = (index: number) => {
  if (tabs.length > 1) {
    tabs.splice(index, 1);
    if (activeTab.value >= index && activeTab.value > 0) {
      activeTab.value--;
    }
  }
};

const updateTabTitle = (newTitle: string) => {
  tabs[activeTab.value].title = newTitle;
};

const updateTabContent = (content: any) => {
  tabs[activeTab.value].content = content;
};

const exportJson = () => {
  const exportData = {
    title: tabs[activeTab.value].title,
    content: tabs[activeTab.value].content,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${exportData.title || 'untitled'}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const importJson = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (result) {
      const importedData = JSON.parse(result.toString());
      tabs[activeTab.value].title = importedData.title || 'Untitled';
      tabs[activeTab.value].content = importedData.content;
    }
  };
  reader.readAsText(file);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

</script>

<style scoped>
/* You can add any scoped styles here if needed */
</style>