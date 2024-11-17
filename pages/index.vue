<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex justify-between items-center w-full p-3 py-2 fixed bg-surface backdrop-blur-lg z-10 pr-[7.5rem]">
      <div class="flex space-x-2 overflow-x-auto justify-center items-center">
        <button @click="newTab"
          class="bg-primaryContainer/30 text-onPrimaryContainer hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-3 rounded-2xl justify-center items-center cursor-pointer tab-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7v14"/></svg>
        </button>

        <div class="dropdown-menu overflow-auto flex space-x-2">
          <div v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
            class="bg-primaryContainer/30 text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-2 rounded-2xl justify-center items-center cursor-pointer tab-item"
            :class="{ 'bg-primaryContainer/60': activeTab === index }">
            <span class="tab-title">{{ tab.title || 'Untitled' }}</span>
            <button @click.stop="closeTab(index)" class="ml-2 text-onPrimaryContainer/30 hover:text-onPrimaryContainer text-lg">&times;</button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex-grow">
      <Editor v-if="tabs.length > 0" :key="activeTab" :title="tabs[activeTab].title"
        :content="tabs[activeTab].content" @update:title="updateTabTitle" @update:content="updateTabContent" />
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
  max-height: 40px; /* Ensure tabs don't grow vertically */
}

.tab-title { 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px; /* Adjust width limit as necessary */
  display: inline-block;
  vertical-align: middle;
}
</style>


<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
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

// const exportJson = () => {
//   const exportData = {
//     title: tabs[activeTab.value].title,
//     content: tabs[activeTab.value].content,
//   };

//   const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = `${exportData.title || 'untitled'}.json`;
//   link.click();
//   URL.revokeObjectURL(url);
// };

// const importJson = (event: Event) => {
//   const file = (event.target as HTMLInputElement).files?.[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     const result = e.target?.result;
//     if (result) {
//       const importedData = JSON.parse(result.toString());
//       tabs[activeTab.value].title = importedData.title || 'Untitled';
//       tabs[activeTab.value].content = importedData.content;
//     }
//   };
//   reader.readAsText(file);
// };

// const triggerFileInput = () => {
//   fileInput.value?.click();
// };

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