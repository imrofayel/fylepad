<!--
  Enhanced Tab Management Features:
  
  1. Tab Rearrangement:
     - Right-click any tab → Move Left/Right
     - Keyboard: Ctrl+Shift+Left/Right Arrow to move active tab
  
  2. Tab Colors:
     - Right-click any tab → Choose from 8 different colors
     - Colors persist and show as small indicators on tabs
  
  3. Tab Groups:
     - Right-click any tab → Assign to existing group or create new
     - Click the groups toggle button (☰) to see grouped tabs
     - Groups show with colored indicators and can be collapsed/expanded
  
  4. Tab Actions:
     - Right-click any tab → Duplicate or Close
     - Keyboard shortcuts: Ctrl+N (new tab), Ctrl+G+[number] (switch to tab)
-->
<template>
  <div class="h-full w-full gap-0 flex flex-col">
    <div class="flex justify-between items-center w-full p-3 py-2 fixed bg-white z-10 pr-[7.5rem] const activeTab = ref(0);
const showGroups = ref(false);
const tabRefs = ref<Record<number, HTMLElement>>({});k:bg-[#171717]" v-if="!focusMode.focused">
      <div class="flex space-x-2 overflow-auto justify-center items-center">
        <button @click="newTab"
          class="hover:!scale-100 drop-shadow-sm" title="New Tab">

          <svg xmlns="http://www.w3.org/2000/svg" class="dark:text-white" width="22.5" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6c3.3 0 4.95 0 5.975 1.025S22 10.7 22 14v1c0 3.3 0 4.95-1.025 5.975S18.3 22 15 22h-1c-3.3 0-4.95 0-5.975-1.025S7 18.3 7 15V9M2 7h3m2-2V2" color="currentColor"/></svg>

        </button>

        <!-- Groups Toggle Button -->
        <button @click="showGroups = !showGroups"
          class="hover:!scale-100 drop-shadow-sm" title="Toggle Groups">
          <svg xmlns="http://www.w3.org/2000/svg" class="dark:text-white" width="20" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h18M3 12h18M3 17h18"/>
          </svg>
        </button>

        <!-- Groups Panel -->
        <div v-if="showGroups" class="absolute top-12 left-0 bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-xs z-20">
          <TabGroups 
            :tabs="tabs" 
            :activeTab="activeTab"
            @tabSelected="activeTab = $event"
            @closeTab="closeTab"
          />
        </div>

        <div class="dropdown-menu overflow-auto flex space-x-2">
          <div class="flex space-x-2">
            <div 
              v-for="(tab, tabIndex) in ungroupedTabs" 
              :key="`tab-${tab.originalIndex}`"
              :ref="el => setTabRef(tab.originalIndex, el)"
              @click="activeTab = tab.originalIndex"
              @contextmenu.prevent="showContextMenu(tab.originalIndex, $event)"
              class="border border-gray-200 bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool tab-item relative"
              :class="getTabClasses(tab.originalIndex)"
            >
              <!-- Group indicator -->
              <div 
                v-if="tab.group" 
                class="absolute -top-1 -left-1 w-3 h-3 rounded-full text-xs flex items-center justify-center text-white font-bold"
                :class="getGroupIndicatorColor(tab.group)"
                :title="`Group: ${tab.group}`"
              >
                {{ tab.group.charAt(0).toUpperCase() }}
              </div>
              
              <!-- Color indicator -->
              <div 
                v-if="tab.color && tab.color !== 'Default'"
                class="w-2 h-2 rounded-full mr-2"
                :class="getTabColorIndicator(tab.color)"
              />
              
              <span class="tab-title">{{ tab.title || 'Untitled' }}</span>
              <button @click.stop="closeTab(tab.originalIndex)"
                class="ml-2 text-onPrimaryContainer/30 hover:text-onPrimaryContainer dark:text-gray-50/50 dark:hover:text-gray-100"
                :class="{ 'text-white font-normal': activeTab === tab.originalIndex }">&times;</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow" :class="focusMode.focused ? 'mt-1' : 'mt-7'">
      <Editor v-if="tabs.length > 0" :key="activeTab" :title="tabs[activeTab].title" :content="tabs[activeTab].content"
        @update:title="updateTabTitle" @update:content="updateTabContent" />
    </div>

    <!-- Tab Context Menu -->
    <TabContextMenu
      :visible="contextMenu.visible"
      :targetElement="contextMenu.targetElement"
      :tabIndex="contextMenu.tabIndex"
      :tabColor="contextMenu.tabIndex >= 0 ? tabs[contextMenu.tabIndex]?.color || 'Default' : 'Default'"
      :tabGroup="contextMenu.tabIndex >= 0 ? tabs[contextMenu.tabIndex]?.group || '' : ''"
      :existingGroups="existingGroups"
      :totalTabs="tabs.length"
      @close="closeContextMenu"
      @colorChanged="changeTabColor"
      @groupChanged="changeTabGroup"
      @duplicateTab="duplicateTab"
      @closeTab="closeTab"
      @moveTab="moveTab"
    />

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
  @apply max-h-fit
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
import { ref, reactive, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { fs, path } from '@tauri-apps/api';
import { isNumber } from '@tiptap/core';

import { useFocusStore } from '../stores/focus'
import TabContextMenu from '../components/ui/tabContextMenu.vue'
import TabGroups from '../components/ui/tabGroups.vue'

const focusMode = useFocusStore()

const colorMode = useColorMode()

interface Tab {
  title: string;
  content: any;
  color?: string;
  group?: string;
}

const tabs = reactive<Tab[]>([{ title: 'Untitled', content: '', color: 'Default' }]);
const activeTab = ref(0);
const showGroups = ref(false);
const tabRefs = ref<Record<number, HTMLElement>>({});

// Context menu state
const contextMenu = reactive({
  visible: false,
  targetElement: null as HTMLElement | null,
  tabIndex: -1
});

// Set tab reference
const setTabRef = (index: number, el: Element | ComponentPublicInstance | null) => {
  if (el && 'nodeType' in el) {
    tabRefs.value[index] = el as HTMLElement;
  }
};

// Show context menu
const showContextMenu = (tabIndex: number, event: MouseEvent) => {
  contextMenu.visible = true;
  contextMenu.targetElement = event.target as HTMLElement;
  contextMenu.tabIndex = tabIndex;
};

// Close context menu
const closeContextMenu = () => {
  contextMenu.visible = false;
  contextMenu.targetElement = null;
  contextMenu.tabIndex = -1;
};

// Get existing groups
const existingGroups = computed(() => {
  const groups = new Set<string>();
  tabs.forEach(tab => {
    if (tab.group) {
      groups.add(tab.group);
    }
  });
  return Array.from(groups);
});

// Get ungrouped tabs for display
const ungroupedTabs = computed(() => tabs
  .map((tab, index) => ({ ...tab, originalIndex: index }))
  .filter(tab => !tab.group)
);

// Handle drag end
const onDragEnd = () => {
  // This will be called after the draggable updates the model
  saveAppState();
};

// Get tab classes based on active state and color
const getTabClasses = (tabIndex: number) => {
  const tab = tabs[tabIndex];
  if (!tab) return '';
  
  const isActive = activeTab.value === tabIndex;
  
  let classes = '';
  
  if (isActive) {
    // Apply color-specific active styles
    switch (tab.color) {
      case 'Blue':
        classes = '!bg-blue-500 dark:!bg-blue-600 !border-blue-600 dark:!border-blue-500 !text-white font-medium';
        break;
      case 'Red':
        classes = '!bg-red-500 dark:!bg-red-600 !border-red-600 dark:!border-red-500 !text-white font-medium';
        break;
      case 'Purple':
        classes = '!bg-purple-500 dark:!bg-purple-600 !border-purple-600 dark:!border-purple-500 !text-white font-medium';
        break;
      case 'Orange':
        classes = '!bg-orange-500 dark:!bg-orange-600 !border-orange-600 dark:!border-orange-500 !text-white font-medium';
        break;
      case 'Pink':
        classes = '!bg-pink-500 dark:!bg-pink-600 !border-pink-600 dark:!border-pink-500 !text-white font-medium';
        break;
      case 'Teal':
        classes = '!bg-teal-500 dark:!bg-teal-600 !border-teal-600 dark:!border-teal-500 !text-white font-medium';
        break;
      case 'Yellow':
        classes = '!bg-yellow-500 dark:!bg-yellow-600 !border-yellow-600 dark:!border-yellow-500 !text-white font-medium';
        break;
      default:
        classes = '!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d] !text-white font-medium';
    }
  }
  
  return classes;
};

// Get tab color indicator
const getTabColorIndicator = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'Blue': 'bg-blue-400',
    'Red': 'bg-red-400',
    'Purple': 'bg-purple-400',
    'Orange': 'bg-orange-400',
    'Pink': 'bg-pink-400',
    'Teal': 'bg-teal-400',
    'Yellow': 'bg-yellow-400',
  };
  return colorMap[colorName] || '';
};

// Get group indicator color
const getGroupIndicatorColor = (groupName: string) => {
  const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-yellow-500'
  ];
  
  // Use a simple hash to consistently assign colors to groups
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = ((hash << 5) - hash + groupName.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

// Change tab color
const changeTabColor = (tabIndex: number, color: { name: string }) => {
  if (tabs[tabIndex]) {
    tabs[tabIndex].color = color.name;
    saveAppState();
  }
};

// Change tab group
const changeTabGroup = (tabIndex: number, group: string) => {
  if (tabs[tabIndex]) {
    tabs[tabIndex].group = group || undefined;
    saveAppState();
  }
};

// Duplicate tab
const duplicateTab = (tabIndex: number) => {
  if (tabs[tabIndex]) {
    const originalTab = tabs[tabIndex];
    const newTab: Tab = {
      title: `${originalTab.title} (Copy)`,
      content: originalTab.content,
      color: originalTab.color,
      group: originalTab.group
    };
    tabs.splice(tabIndex + 1, 0, newTab);
    activeTab.value = tabIndex + 1;
    saveAppState();
  }
};

// Move tab left or right
const moveTab = (tabIndex: number, direction: 'left' | 'right') => {
  if (direction === 'left' && tabIndex > 0) {
    // Swap with previous tab
    const temp = tabs[tabIndex];
    tabs[tabIndex] = tabs[tabIndex - 1];
    tabs[tabIndex - 1] = temp;
    
    // Update active tab if needed
    if (activeTab.value === tabIndex) {
      activeTab.value = tabIndex - 1;
    } else if (activeTab.value === tabIndex - 1) {
      activeTab.value = tabIndex;
    }
  } else if (direction === 'right' && tabIndex < tabs.length - 1) {
    // Swap with next tab
    const temp = tabs[tabIndex];
    tabs[tabIndex] = tabs[tabIndex + 1];
    tabs[tabIndex + 1] = temp;
    
    // Update active tab if needed
    if (activeTab.value === tabIndex) {
      activeTab.value = tabIndex + 1;
    } else if (activeTab.value === tabIndex + 1) {
      activeTab.value = tabIndex;
    }
  }
  saveAppState();
};

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

  tabs.push({ title: 'Untitled', content: '', color: 'Default' });
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
  const currentTab = tabs[activeTab.value];
  if (currentTab) {
    currentTab.title = newTitle;
  }
};

const updateTabContent = (content: any) => {
  const currentTab = tabs[activeTab.value];
  if (currentTab) {
    currentTab.content = content;
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
  
  // CTRL + SHIFT + Left Arrow -> Move tab left
  if (event.ctrlKey && event.shiftKey && event.key === 'ArrowLeft') {
    event.preventDefault();
    moveTab(activeTab.value, 'left');
  }
  
  // CTRL + SHIFT + Right Arrow -> Move tab right
  if (event.ctrlKey && event.shiftKey && event.key === 'ArrowRight') {
    event.preventDefault();
    moveTab(activeTab.value, 'right');
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

const fallbackTitle = 'Untitled';
const currentTab = computed(() => tabs[activeTab.value as any]);
const currentTabTitle = computed(() => currentTab.value?.title ?? fallbackTitle);

useHead({
  title: currentTabTitle,
  meta: [
    { name: 'description', content: 'A minimal notepad with literally everything you need.' }
  ],
})

useSeoMeta({
  title: currentTabTitle,
  ogTitle: currentTabTitle,
  description: 'A minimal notepad with literally everything you need.',
  ogDescription: 'An aesthetic notepad for effortless note-taking with AI. Enjoy rich editing, auto-save, multi-tab support, Mermaid / PlantUML diagrams, tables, code-blocks and much more — all in one.',
})

</script>