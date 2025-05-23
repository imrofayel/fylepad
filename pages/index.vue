<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex justify-between items-center w-full p-3 py-2 fixed bg-white z-10 pr-[7.5rem] dark:bg-[#171717]">
      <div class="flex space-x-2 overflow-auto justify-center items-center">
        <button @click="newTab"
          class="hover:!scale-100 drop-shadow-sm" title="New Tab">

          <svg xmlns="http://www.w3.org/2000/svg" class="dark:text-white" width="22.5" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6c3.3 0 4.95 0 5.975 1.025S22 10.7 22 14v1c0 3.3 0 4.95-1.025 5.975S18.3 22 15 22h-1c-3.3 0-4.95 0-5.975-1.025S7 18.3 7 15V9M2 7h3m2-2V2" color="currentColor"/></svg>

        </button>

          <div class="dropdown-menu overflow-auto flex space-x-2">
            <transition-group name="list" tag="div" class="flex space-x-2 ">
            <div v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
              class="border border-gray-200 bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool tab-item"
              :class="{ '!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d] !text-white font-medium': activeTab === index }">
              <span class="tab-title relative -top-[1.5px]">{{ tab.title || 'Untitled' }}</span>
              <button @click.stop="closeTab(index)"
                class="ml-2 text-onPrimaryContainer/30 hover:text-onPrimaryContainer dark:text-gray-50/50 dark:hover:text-gray-100 text-lg"
                :class="{ 'text-white font-normal': activeTab === index }">&times;</button>
            </div>
          </transition-group>
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

/* Transition styles */
.list-enter-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

</style>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue';
import { fs, path } from '@tauri-apps/api';
import { isNumber } from '@tiptap/core';

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

const handleDragChange = () => {
  // Update activeTab if the active tab was moved
  const newIndex = tabs.findIndex((tab, index) => index === activeTab.value);
  if (newIndex !== -1) {
    activeTab.value = newIndex;
  }
};

function handleShortcut(event: KeyboardEvent) {
  // CTRL + N -> New tab
  if (event.ctrlKey && event.key === 'n') {
    event.preventDefault();
    newTab();
  }
  
  // CTRL + G + [number] -> Switch to tab
  if (event.ctrlKey && event.key === 'g') {
    event.preventDefault();
    const numberListener = (e: KeyboardEvent) => {
      if (isNumber(parseInt(e.key)) && parseInt(e.key) <= tabs.length) {
        const tabNumber = parseInt(e.key) - 1; // Convert to 0-based index
        if (tabNumber < tabs.length) {
          activeTab.value = tabNumber;
        }
        document.removeEventListener('keydown', numberListener);
      }
    };
    document.addEventListener('keydown', numberListener);
  }
}

onMounted(() => {
  // Add the event listener when the component is mounted
  document.addEventListener('keydown', handleShortcut);
});

onBeforeUnmount(() => {
  // Clean up the event listener to prevent memory leaks
  document.removeEventListener('keydown', handleShortcut);
});

</script>