<template>
  <div class="h-full w-full gap-0 flex flex-col">
    <div class="flex justify-between items-center w-full p-3 py-2 fixed bg-white z-10 pr-[7.5rem] dark:bg-[#171717]" v-if="!focusMode.focused">
      <div class="flex space-x-2 overflow-auto justify-center items-center">
        <button @click="newTab"
          class="hover:!scale-100 drop-shadow-sm" title="New Tab">

          <svg xmlns="http://www.w3.org/2000/svg" class="dark:text-white" width="22.5" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6c3.3 0 4.95 0 5.975 1.025S22 10.7 22 14v1c0 3.3 0 4.95-1.025 5.975S18.3 22 15 22h-1c-3.3 0-4.95 0-5.975-1.025S7 18.3 7 15V9M2 7h3m2-2V2" color="currentColor"/></svg>

        </button>

        <div class="dropdown-menu overflow-auto flex space-x-2" ref="tabContainer">
          <div class="flex space-x-2">
            <div
              v-for="(tab, tabIndex) in tabs"
              :key="tab.id"
              draggable="true"
              @dragstart="onTabDragStart(tabIndex, $event)"
              @dragover="onTabDragOver($event, tabIndex)"
              @dragenter="onTabDragEnter($event, tabIndex)"
              @dragleave="onTabDragLeave($event)"
              @drop="onTabDrop($event, tabIndex)"
              @dragend="onTabDragEnd"
              :ref="el => setTabRef(tabIndex, el)"
              @click="activeTab = tabIndex"
              @contextmenu.prevent="showContextMenu(tabIndex, $event)"
              class="border border-gray-200 bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool tab-item relative transition-all duration-200"
              :class="getTabClasses(tabIndex)"
              :style="getTabStyle(tabIndex)"
            >
              <!-- Color indicator -->
              <div 
                v-if="tab.color && tab.color !== 'Default'"
                class="w-2 h-2 rounded-full mr-2"
                :class="getTabColorIndicator(tab.color)"
              />
              
              <span class="tab-title">{{ tab.title || 'Untitled' }}</span>
              <button @click.stop="closeTab(tabIndex)"
                class="ml-2 text-onPrimaryContainer/30 hover:text-onPrimaryContainer dark:text-gray-50/50 dark:hover:text-gray-100"
                :class="{ 'text-white font-normal': activeTab === tabIndex }">&times;</button>
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
      :totalTabs="tabs.length"
      @close="closeContextMenu"
      @colorChanged="changeTabColor"
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
  @apply max-h-fit;
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

/* Enhanced drag and drop styles */
.tab-item[draggable="true"] {
  cursor: grab;
  transition: all 0.5s ease;
}

.tab-item[draggable="true"]:active {
  cursor: grabbing;
}

.tab-item.drag-over-left {
  border-left: 6px solid #24d86c;
  padding-left: 6px;
}

.tab-item.drag-over-right {
  border-right: 6px solid #24d86c;
  padding-right: 6px;
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

const focusMode = useFocusStore()

const colorMode = useColorMode()

interface Tab {
  title: string;
  content: any;
  color?: string;
  id: string; // Add unique ID for tabs
}

const tabs = reactive<Tab[]>([{ 
  title: 'Untitled', 
  content: '', 
  color: 'Default',
  id: crypto.randomUUID() // Generate unique ID
}]);
const activeTab = ref(0);
const tabRefs = ref<Record<number, HTMLElement>>({});

// Enhanced drag-and-drop state
const dragState = reactive({
  dragging: false,
  draggedTabIndex: -1,
  dragOverTabIndex: -1,
  dragOverSide: '', // 'left' or 'right'
  startX: 0,
  startY: 0
});

const onTabDragStart = (index: number, event: DragEvent) => {
  dragState.dragging = true;
  dragState.draggedTabIndex = index;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());

    // Create a fully invisible drag image
    const invisible = document.createElement('div');
    invisible.style.width = '1px';
    invisible.style.height = '1px';
    invisible.style.opacity = '0';
    invisible.style.position = 'absolute';
    invisible.style.top = '-1000px';
    invisible.style.left = '-1000px';

    document.body.appendChild(invisible);
    void invisible.offsetWidth; // Force layout

    event.dataTransfer.setDragImage(invisible, 0, 0);

    // Clean up
    setTimeout(() => {
      if (document.body.contains(invisible)) {
        document.body.removeChild(invisible);
      }
    }, 0);
  }
};


// Enhanced drag over handler
const onTabDragOver = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  
  if (!dragState.dragging || dragState.draggedTabIndex === targetIndex) {
    return;
  }
  
  const targetElement = tabRefs.value[targetIndex];
  if (!targetElement) return;
  
  const rect = targetElement.getBoundingClientRect();
  const midPoint = rect.left + rect.width / 2;
  const isLeftSide = event.clientX < midPoint;
  
  dragState.dragOverTabIndex = targetIndex;
  dragState.dragOverSide = isLeftSide ? 'left' : 'right';
  
  // Set drop effect
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

// Drag enter handler
const onTabDragEnter = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
};

// Drag leave handler
const onTabDragLeave = (event: DragEvent) => {
  // Only clear drag over state if we're actually leaving the tab area
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!relatedTarget || !relatedTarget.closest('.tab-item')) {
    dragState.dragOverTabIndex = -1;
    dragState.dragOverSide = '';
  }
};

// Enhanced drop handler
const onTabDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  
  if (!dragState.dragging || dragState.draggedTabIndex === -1) {
    return;
  }
  
  const sourceIndex = dragState.draggedTabIndex;
  
  if (sourceIndex === targetIndex) {
    resetDragState();
    return;
  }
  
  // Calculate the new position based on drop side
  let newIndex = targetIndex;
  if (dragState.dragOverSide === 'right') {
    newIndex = targetIndex + 1;
  }
  
  // Adjust for the fact that we're removing the source tab first
  if (sourceIndex < newIndex) {
    newIndex--;
  }
  
  // Perform the move
  moveTabToPosition(sourceIndex, newIndex);
  
  resetDragState();
};

// Drag end handler
const onTabDragEnd = () => {
  resetDragState();
};

// Reset drag state
const resetDragState = () => {
  dragState.dragging = false;
  dragState.draggedTabIndex = -1;
  dragState.dragOverTabIndex = -1;
  dragState.dragOverSide = '';
  dragState.startX = 0;
  dragState.startY = 0;
};

// Move tab to a specific position
const moveTabToPosition = (sourceIndex: number, targetIndex: number) => {
  if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || 
      sourceIndex >= tabs.length || targetIndex > tabs.length) {
    return;
  }
  
  // Extract the tab to move
  const [movedTab] = tabs.splice(sourceIndex, 1);
  
  // Insert at new position
  tabs.splice(targetIndex, 0, movedTab);
  
  // Update active tab index
  if (activeTab.value === sourceIndex) {
    activeTab.value = targetIndex;
  } else if (activeTab.value > sourceIndex && activeTab.value <= targetIndex) {
    activeTab.value--;
  } else if (activeTab.value < sourceIndex && activeTab.value >= targetIndex) {
    activeTab.value++;
  }
  
  saveAppState();
};

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

// Get tab classes based on active state, color, and drag state
const getTabClasses = (tabIndex: number) => {
  const tab = tabs[tabIndex];
  if (!tab) return '';
  
  const isActive = activeTab.value === tabIndex;
  const isDragging = dragState.dragging && dragState.draggedTabIndex === tabIndex;
  const isDragOver = dragState.dragOverTabIndex === tabIndex;
  
  let classes = '';
  
  // Dragging state
  if (isDragging) {
    classes += ' dragging';
  }
  
  // Drag over states
  if (isDragOver && !isDragging) {
    if (dragState.dragOverSide === 'left') {
      classes += ' drag-over-left';
    } else if (dragState.dragOverSide === 'right') {
      classes += ' drag-over-right';
    }
  }
  
  // Active state with colors
  if (isActive) {
    // Apply color-specific active styles
    switch (tab.color) {
      case 'Blue':
        classes += ' !bg-blue-500 dark:!bg-blue-600 !border-blue-600 dark:!border-blue-500 !text-white font-medium';
        break;
      case 'Red':
        classes += ' !bg-red-500 dark:!bg-red-600 !border-red-600 dark:!border-red-500 !text-white font-medium';
        break;
      case 'Purple':
        classes += ' !bg-purple-500 dark:!bg-purple-600 !border-purple-600 dark:!border-purple-500 !text-white font-medium';
        break;
      case 'Orange':
        classes += ' !bg-orange-500 dark:!bg-orange-600 !border-orange-600 dark:!border-orange-500 !text-white font-medium';
        break;
      case 'Pink':
        classes += ' !bg-pink-500 dark:!bg-pink-600 !border-pink-600 dark:!border-pink-500 !text-white font-medium';
        break;
      case 'Teal':
        classes += ' !bg-teal-500 dark:!bg-teal-600 !border-teal-600 dark:!border-teal-500 !text-white font-medium';
        break;
      case 'Yellow':
        classes += ' !bg-yellow-500 dark:!bg-yellow-600 !border-yellow-600 dark:!border-yellow-500 !text-white font-medium';
        break;
      default:
        classes += ' !bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d] !text-white font-medium';
    }
  }
  
  return classes;
};



// Get tab style for drag effects
const getTabStyle = (tabIndex: number) => {
  const isDragging = dragState.dragging && dragState.draggedTabIndex === tabIndex;
  
  if (isDragging) {
    return {
      transform: 'scale(0.92)',
      zIndex: '1000',
    };
  }
  
  return {};
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

// Change tab color
const changeTabColor = (tabIndex: number, color: { name: string }) => {
  if (tabs[tabIndex]) {
    tabs[tabIndex].color = color.name;
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
      id: crypto.randomUUID()
    };
    tabs.splice(tabIndex + 1, 0, newTab);
    activeTab.value = tabIndex + 1;
    saveAppState();
  }
};

// Move tab left or right (for keyboard shortcuts and context menu)
const moveTab = (tabIndex: number, direction: 'left' | 'right') => {
  if (direction === 'left' && tabIndex > 0) {
    moveTabToPosition(tabIndex, tabIndex - 1);
  } else if (direction === 'right' && tabIndex < tabs.length - 1) {
    moveTabToPosition(tabIndex, tabIndex + 1);
  }
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
    // Ensure all tabs have IDs (for backward compatibility)
    const migratedTabs = appState.tabs.map((tab: any) => ({
      ...tab,
      id: tab.id || crypto.randomUUID()
    }));
    
    tabs.splice(0, tabs.length, ...migratedTabs);
    activeTab.value = appState.activeTab;
    colorMode.preference = appState.colorMode;
  }
}

// Load the app state when the component mounts
onMounted(async () => {
  await loadAppState();
});

// Clean up on unmount
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleShortcut);
});

// Watch for changes and save the state
watch([tabs, activeTab, () => colorMode.preference], async () => {
  await saveAppState();
}, { deep: true });

const newTab = () => {
  // TODO: Adjust the UI later. Add pricing thing into it just for fun.
  if (tabs.length >= 5) {
    return
  }

  tabs.push({ 
    title: 'Untitled', 
    content: '', 
    color: 'Default',
    id: crypto.randomUUID()
  });
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
  if (event.AT_TARGET) {
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