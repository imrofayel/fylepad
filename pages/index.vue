<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex justify-between items-center w-full p-3 py-2 fixed bg-white z-10 pr-[7.5rem] dark:bg-[#171717]">
      <div class="flex space-x-2 overflow-x-auto justify-center items-center">
        <button @click="newTab"
          class="border border-gray-200 bg-white/80 dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 text-black !px-[7px] py-[6px] rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool tab-item">

          <svg xmlns="http://www.w3.org/2000/svg" width="22.5" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="M5.076 17C4.089 4.545 12.912 1.012 19.973 2.224c.286 4.128-1.734 5.673-5.58 6.387c.742.776 2.055 1.753 1.913 2.974c-.1.868-.69 1.295-1.87 2.147C11.85 15.6 8.854 16.78 5.076 17"/><path d="M4 22c0-6.5 3.848-9.818 6.5-12"/></g></svg>

        </button>

        <div class="dropdown-menu overflow-auto flex space-x-2">
          <div v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
            class="border border-gray-200 bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool tab-item tab-item"
            :class="{ '!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d] !text-white font-medium': activeTab === index }">
            <span class="tab-title">{{ tab.title || 'Untitled' }}</span>
            <button @click.stop="closeTab(index)"
              class="ml-2 text-onPrimaryContainer/30 hover:text-onPrimaryContainer dark:text-gray-50/50 dark:hover:text-gray-100 text-lg"
              :class="{ 'text-white font-normal': activeTab === index }">&times;</button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex-grow">
      <Editor v-if="tabs.length > 0" :key="activeTab" :title="tabs[activeTab].title" :content="tabs[activeTab].content"
        @update:title="updateTabTitle" @update:content="updateTabContent" />
    </div>
  </div>
</template>

<style scoped>
.dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.dropdown-menu::-webkit-scrollbar {
  width: 0px;
}

.dropdown-menu::-webkit-scrollbar-thumb,
.dropdown-menu::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}

.tab-item {
  max-height: 40px;
  /* Ensure tabs don't grow vertically */
}

.tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  /* Adjust width limit as necessary */
  display: inline-block;
  vertical-align: middle;
}
</style>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { fs, path } from '@tauri-apps/api';

const colorMode = useColorMode()

interface Tab {
  title: string;
  content: any;
}

const tabs = reactive<Tab[]>([{ title: 'Untitled', content: '' }]);
const activeTab = ref(0);
// const fileInput = ref<HTMLInputElement | null>(null);

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

  // TODO: Ajudt the UI later. Add pricing thing into it just for fun.
  if (tabs.length >= 5) {
    return
  }

  tabs.push({ title: 'Untitled', content: '' });
  activeTab.value = tabs.length - 1;
};

const closeTab = (index: number) => {
  if (tabs.length > 1) {
    tabs.splice(index, 1);
    if (activeTab.value >= index && activeTab.value > 0) {
      activeTab.value--;
    }
  } else {
    tabs.splice(index, 1);
    newTab()
  }
};

const updateTabTitle = (newTitle: string) => {
  tabs[activeTab.value].title = newTitle;
};

const updateTabContent = (content: any) => {
  tabs[activeTab.value].content = content;
};

onMounted(() => {
  // Add the event listener when the component is mounted
  document.addEventListener('keydown', handleShortcut);
});

onBeforeUnmount(() => {
  // Clean up the event listener to prevent memory leaks
  document.removeEventListener('keydown', handleShortcut);
});

function handleShortcut(event: KeyboardEvent) {
  // CTRL + F -> Open search
  if (event.ctrlKey && event.key === 'n') {
    event.preventDefault();
    newTab()
  }
}

</script>