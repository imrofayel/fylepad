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
                v-if="!tab.lock" class="ml-2 text-onPrimaryContainer/30 hover:text-onPrimaryContainer dark:text-gray-50/50 dark:hover:text-gray-100"
                :class="{ 'text-white font-normal': activeTab === tabIndex }">&times;</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow" :class="focusMode.focused ? 'mt-1' : 'mt-7'">
      <Editor v-if="tabs.length > 0 && tabs[activeTab]" :key="activeTab" :title="tabs[activeTab].title || 'Untitled'" :content="parseContent(tabs[activeTab].content)"
        @update:title="updateTabTitle" @update:content="updateTabContent" />
      <div v-else-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading your notes...</p>
        </div>
      </div>
    </div>

    <!-- Tab Context Menu -->
    <TabContextMenu
      v-if="tabs.length > 0 && tabs[activeTab]"
      :visible="contextMenu.visible"
      :targetElement="contextMenu.targetElement"
      :tabIndex="contextMenu.tabIndex"
      :tabColor="contextMenu.tabIndex >= 0 ? tabs[contextMenu.tabIndex]?.color || 'Default' : 'Default'"
      :totalTabs="tabs.length"
      @close="closeContextMenu"
      @colorChanged="changeTabColor"
      @duplicateTab="duplicateTab"
      @lock-tab="lockTab"
      :status="tabs[activeTab]?.lock || false"
    />

    <!-- Loading indicator -->
    <div v-if="isLoading" class="fixed top-0 left-0 right-0 h-1">
      <div class="h-full bg-green-500 animate-pulse"></div>
    </div>

    <!-- Background sync indicator -->
    <div v-if="syncStatus.isSyncing && !isLoading" class="fixed top-0 right-4 mt-2 z-20">
      <div class="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span>Syncing...</span>
      </div>
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
import { isNumber } from '@tiptap/core';

import { useFocusStore } from '../stores/focus'
import TabContextMenu from '../components/ui/tabContextMenu.vue'

const focusMode = useFocusStore()
const colorMode = useColorMode()

interface Tab {
  title: string;
  content: any;
  color?: string;
  lock: boolean;
  id: string;
  position: number;
  noteId?: string; // Database ID
}

// State
const tabs = reactive<Tab[]>([]);
const activeTab = ref(0);
const tabRefs = ref<Record<number, HTMLElement>>({});
const isLoading = ref(false);
const isInitialized = ref(false);
const isCached = ref(false); // Track if data is already cached
const lastFetchTime = ref(0); // Track last fetch time for cache invalidation

// Background sync status
const syncStatus = reactive({
  isSyncing: false,
  pendingSyncs: 0,
  lastSyncTime: 0
});

// Debounced save function - now saves the current active tab specifically in background
const debouncedSave = debounce(() => {
  if (!isInitialized.value || tabs.length === 0) return;
  
  const currentTab = tabs[activeTab.value];
  if (currentTab) {
    // Background sync without await - no blocking
    syncTabToCloud(currentTab);
    console.log('Tab auto-save triggered, syncing to cloud...');
  }
}, 1000);

// Enhanced drag-and-drop state
const dragState = reactive({
  dragging: false,
  draggedTabIndex: -1,
  dragOverTabIndex: -1,
  dragOverSide: '', // 'left' or 'right'
  startX: 0,
  startY: 0
});

// Context menu state
const contextMenu = reactive({
  visible: false,
  targetElement: null as HTMLElement | null,
  tabIndex: -1
});

// API Functions
const apiRequest = async (url: string, options: any = {}) => {
  const response = await $fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
};

const loadNotesFromCloud = async (forceRefresh = false) => {
  // Skip loading if already cached and not forcing refresh
  if (isCached.value && !forceRefresh) {
    console.log('Using cached tabs, skipping API call');
    return;
  }

  // Skip if already loading to prevent duplicate requests
  if (isLoading.value) {
    console.log('Already loading, skipping duplicate request');
    return;
  }

  try {
    isLoading.value = true;
    console.log('Fetching notes from cloud...');
    
    const response: any = await apiRequest('/api/notes');
    
    if (response.notes && response.notes.length > 0) {
      const cloudTabs = response.notes.map((note: any, index: number) => ({
        title: note.title || 'Untitled',
        content: note.content || '', // Keep as string, will be parsed when needed
        color: note.color || 'Default',
        lock: note.lock || false,
        position: note.position || (index + 1), // Fallback to index-based position
        id: note.id || crypto.randomUUID(),
        noteId: note.noteId || note._id || note.id, // Handle different ID fields
      }));
      
      // Sort by position to ensure correct order
      cloudTabs.sort((a: any, b: any) => a.position - b.position);
      
      tabs.splice(0, tabs.length, ...cloudTabs);
      activeTab.value = Math.min(0, cloudTabs.length - 1);
      
      // Mark as cached
      isCached.value = true;
      lastFetchTime.value = Date.now();
      
      console.log(`Loaded ${cloudTabs.length} tabs from cloud`);
    } else {
      // No notes in cloud, create initial tab
      console.log('No notes found, creating initial tab');
      await createInitialTab();
      isCached.value = true; // Mark as cached even with initial tab
    }
  } catch (error) {
    console.error('Failed to load notes from cloud:', error);
    // Only create initial tab if we have no cached data
    if (!isCached.value) {
      await createInitialTab();
      isCached.value = true;
    }
  } finally {
    isLoading.value = false;
    isInitialized.value = true;
  }
};

const createInitialTab = async () => {
  const newTabData = {
    title: 'Untitled',
    content: '',
    color: 'Default',
    lock: false,
    position: 1, // First tab gets position 1
    id: crypto.randomUUID(),
  };
  
  try {
    const response: any = await apiRequest('/api/notes', {
      method: 'POST',
      body: JSON.stringify(newTabData),
    });
    
    tabs.push({
      ...newTabData,
      noteId: response.note.noteId || response.note._id || response.note.id,
    });
    activeTab.value = 0;
    
    // Update cache status
    isCached.value = true;
    lastFetchTime.value = Date.now();
  } catch (error) {
    console.error('Failed to create initial tab:', error);
    // Fallback to local tab
    tabs.push(newTabData);
    activeTab.value = 0;
    isCached.value = true; // Still mark as cached to prevent refetching
  }
};

const saveTabToCloud = async (tab: Tab) => {
  if (!tab.noteId) {
    // Create new note
    try {
      // Ensure content is properly serialized
      let contentToSave = tab.content;
      if (typeof contentToSave === 'object' && contentToSave !== null) {
        contentToSave = JSON.stringify(contentToSave);
      }

      const response: any = await apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: tab.title || 'Untitled',
          content: contentToSave || '',
          color: tab.color || 'Default',
          lock: tab.lock || false,
          position: tab.position,
          id: tab.id,
        }),
      });
      tab.noteId = response.note.noteId || response.note._id || response.note.id;
      console.log('New note created in cloud:', tab.noteId);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  } else {
    // Update existing note
    try {
      // Ensure content is properly serialized
      let contentToSave = tab.content;
      if (typeof contentToSave === 'object' && contentToSave !== null) {
        contentToSave = JSON.stringify(contentToSave);
      }

      await apiRequest(`/api/notes/${tab.noteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: tab.title || 'Untitled',
          content: contentToSave || '',
          color: tab.color || 'Default',
          lock: tab.lock || false,
          position: tab.position,
        }),
      });
      console.log('Note updated in cloud:', tab.noteId);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }
};

// Cache management functions
const refreshCache = async () => {
  console.log('Refreshing cache...');
  isCached.value = false;
  await loadNotesFromCloud(true);
};

const invalidateCache = () => {
  console.log('Cache invalidated');
  isCached.value = false;
  lastFetchTime.value = 0;
};

// Check if cache is stale (optional: implement cache expiration)
const isCacheStale = (maxAgeMs = 5 * 60 * 1000) => { // 5 minutes default
  return Date.now() - lastFetchTime.value > maxAgeMs;
};

const deleteTabFromCloud = async (tab: Tab) => {
  if (tab.noteId) {
    try {
      await apiRequest(`/api/notes/${tab.noteId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }
};

// Utility function for content parsing
const parseContent = (content: any) => {
  if (!content) return '';
  
  // If it's already a string, try to parse it as JSON
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch {
      // If parsing fails, return as string
      return content;
    }
  }
  
  // If it's already an object, return as is
  return content;
};

// Utility function for debouncing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Drag and drop handlers (unchanged)
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
  
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onTabDragEnter = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
};

const onTabDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!relatedTarget || !relatedTarget.closest('.tab-item')) {
    dragState.dragOverTabIndex = -1;
    dragState.dragOverSide = '';
  }
};

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
  
  let newIndex = targetIndex;
  if (dragState.dragOverSide === 'right') {
    newIndex = targetIndex + 1;
  }
  
  if (sourceIndex < newIndex) {
    newIndex--;
  }
  
  moveTabToPosition(sourceIndex, newIndex);
  resetDragState();
};

const onTabDragEnd = () => {
  resetDragState();
};

const resetDragState = () => {
  dragState.dragging = false;
  dragState.draggedTabIndex = -1;
  dragState.dragOverTabIndex = -1;
  dragState.dragOverSide = '';
  dragState.startX = 0;
  dragState.startY = 0;
};

const moveTabToPosition = (sourceIndex: number, targetIndex: number) => {
  if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || 
      sourceIndex >= tabs.length || targetIndex > tabs.length) {
    return;
  }
  
  // Perform instant UI update
  const [movedTab] = tabs.splice(sourceIndex, 1);
  tabs.splice(targetIndex, 0, movedTab);
  
  // Update active tab index instantly
  if (activeTab.value === sourceIndex) {
    activeTab.value = targetIndex;
  } else if (activeTab.value > sourceIndex && activeTab.value <= targetIndex) {
    activeTab.value--;
  } else if (activeTab.value < sourceIndex && activeTab.value >= targetIndex) {
    activeTab.value++;
  }

  // Update positions in memory instantly
  tabs.forEach((tab, index) => {
    tab.position = index + 1;
  });
  
  // Sync to database in background (no await)
  syncTabPositionsToCloud();
  console.log('Tab order changed instantly, syncing to cloud...');
};

// Background sync function for tab positions
const syncTabPositionsToCloud = async () => {
  if (!isInitialized.value || tabs.length === 0) return;
  
  syncStatus.pendingSyncs++;
  syncStatus.isSyncing = true;
  
  try {
    // Filter out tabs without noteId
    const validTabs = tabs.filter(tab => tab.noteId);
    if (validTabs.length === 0) return;

    // Prepare position updates
    const positionUpdates = validTabs.map(tab => ({
      id: tab.noteId!,
      position: tab.position
    }));

    // Call API to batch update positions
    await apiRequest('/api/notes/positions', {
      method: 'PUT',
      body: JSON.stringify({ updates: positionUpdates }),
    });

    syncStatus.lastSyncTime = Date.now();
    console.log('Tab positions synced to cloud successfully');
  } catch (error) {
    console.error('Failed to sync tab positions to cloud:', error);
    // Could implement retry logic here if needed
  } finally {
    syncStatus.pendingSyncs = Math.max(0, syncStatus.pendingSyncs - 1);
    if (syncStatus.pendingSyncs === 0) {
      syncStatus.isSyncing = false;
    }
  }
};

// Enhanced function to update all tab positions after reordering (kept for backward compatibility)
const updateTabPositions = async () => {
  await syncTabPositionsToCloud();
};

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
  
  if (isDragging) {
    classes += ' dragging';
  }
  
  if (isDragOver && !isDragging) {
    if (dragState.dragOverSide === 'left') {
      classes += ' drag-over-left';
    } else if (dragState.dragOverSide === 'right') {
      classes += ' drag-over-right';
    }
  }
  
  if (isActive) {
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

// Tab operations
const newTab = () => {
  if (tabs.length >= 5) {
    return;
  }

  // Calculate next position
  const nextPosition = tabs.length > 0 ? Math.max(...tabs.map(t => t.position)) + 1 : 1;

  const newTabData: Tab = {
    title: 'Untitled',
    content: '',
    color: 'Default',
    lock: false,
    position: nextPosition,
    id: crypto.randomUUID(),
  };

  // Instant UI update
  tabs.push(newTabData);
  activeTab.value = tabs.length - 1;
  
  console.log('New tab created instantly, syncing to cloud...');
  
  // Sync to cloud in background (no await)
  syncNewTabToCloud(newTabData);
};

// Background sync function for new tabs
const syncNewTabToCloud = async (tabData: Tab) => {
  syncStatus.pendingSyncs++;
  syncStatus.isSyncing = true;
  
  try {
    const response: any = await apiRequest('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: tabData.title,
        content: tabData.content,
        color: tabData.color,
        lock: tabData.lock,
        position: tabData.position,
        id: tabData.id,
      }),
    });
    
    // Update the tab with the server-assigned noteId
    tabData.noteId = response.note.noteId || response.note._id || response.note.id;
    
    // Cache is still valid, just added new item
    lastFetchTime.value = Date.now();
    syncStatus.lastSyncTime = Date.now();
    console.log('New tab synced to cloud:', tabData.noteId);
  } catch (error) {
    console.error('Failed to sync new tab to cloud:', error);
    // Tab remains in local state even if cloud sync fails
  } finally {
    syncStatus.pendingSyncs = Math.max(0, syncStatus.pendingSyncs - 1);
    if (syncStatus.pendingSyncs === 0) {
      syncStatus.isSyncing = false;
    }
  }
};

const closeTab = (index: number) => {
  const tabToClose = tabs[index];
  
  if (tabs.length > 1) {
    // Instant UI update - remove the tab from the array
    tabs.splice(index, 1);
    
    // Update positions of remaining tabs instantly
    tabs.forEach((tab, i) => {
      tab.position = i + 1;
    });
    
    // Update active tab index instantly
    if (activeTab.value >= index && activeTab.value > 0) {
      activeTab.value--;
    }
    
    console.log('Tab closed instantly, syncing to cloud...');
    
    // Sync deletion to cloud in background (no await)
    syncTabDeletionToCloud(tabToClose);
    
    // Sync position updates to cloud in background (no await)
    syncTabPositionsToCloud();
    
    // Cache is still valid, just removed item
    lastFetchTime.value = Date.now();
  } else {
    // If it's the last tab, delete it instantly and create a new one
    tabs.splice(index, 1);
    
    console.log('Last tab closed, creating new tab and syncing to cloud...');
    
    // Sync deletion to cloud in background (no await)
    syncTabDeletionToCloud(tabToClose);
    
    // Create new tab instantly
    newTab();
  }
};

// Background sync function for tab deletion
const syncTabDeletionToCloud = async (tab: Tab) => {
  if (tab.noteId) {
    syncStatus.pendingSyncs++;
    syncStatus.isSyncing = true;
    
    try {
      await apiRequest(`/api/notes/${tab.noteId}`, {
        method: 'DELETE',
      });
      syncStatus.lastSyncTime = Date.now();
      console.log('Tab deletion synced to cloud:', tab.noteId);
    } catch (error) {
      console.error('Failed to sync tab deletion to cloud:', error);
    } finally {
      syncStatus.pendingSyncs = Math.max(0, syncStatus.pendingSyncs - 1);
      if (syncStatus.pendingSyncs === 0) {
        syncStatus.isSyncing = false;
      }
    }
  }
};

const updateTabTitle = (newTitle: string) => {
  const currentTab = tabs[activeTab.value];
  if (currentTab && isInitialized.value) {
    // Instant UI update
    currentTab.title = newTitle;
    
    // Use debounced save for title changes (user might be typing)
    debouncedSave();
  }
};

const updateTabContent = (content: any) => {
  const currentTab = tabs[activeTab.value];
  if (currentTab && isInitialized.value) {
    // Instant UI update - Handle different content types - serialize objects to JSON
    if (typeof content === 'object' && content !== null) {
      currentTab.content = JSON.stringify(content);
    } else {
      currentTab.content = content;
    }
    
    // Use debounced save for content changes (user might be typing)
    debouncedSave();
  }
};

const changeTabColor = (tabIndex: number, color: { name: string }) => {
  if (tabs[tabIndex]) {
    // Instant UI update
    tabs[tabIndex].color = color.name;
    
    console.log(`Tab color changed to ${color.name} instantly, syncing to cloud...`);
    
    // Sync to cloud in background (no await)
    syncTabToCloud(tabs[tabIndex]);
  }
};

// Background sync function for individual tab updates
const syncTabToCloud = async (tab: Tab) => {
  syncStatus.pendingSyncs++;
  syncStatus.isSyncing = true;
  
  try {
    await saveTabToCloud(tab);
    syncStatus.lastSyncTime = Date.now();
    console.log(`Tab synced to cloud: ${tab.noteId}`);
  } catch (error) {
    console.error('Failed to sync tab to cloud:', error);
  } finally {
    syncStatus.pendingSyncs = Math.max(0, syncStatus.pendingSyncs - 1);
    if (syncStatus.pendingSyncs === 0) {
      syncStatus.isSyncing = false;
    }
  }
};

const duplicateTab = (tabIndex: number) => {
  if (tabs[tabIndex]) {
    const originalTab = tabs[tabIndex];
    
    // Calculate next position after the original tab
    const nextPosition = originalTab.position + 1;
    
    // Shift positions of all tabs after the original instantly
    tabs.forEach(tab => {
      if (tab.position >= nextPosition) {
        tab.position++;
      }
    });

    const newTabData: Tab = {
      title: `${originalTab.title} (Copy)`,
      content: originalTab.content,
      color: originalTab.color,
      lock: false, // Always unlock duplicated tabs
      position: nextPosition,
      id: crypto.randomUUID(),
    };

    // Instant UI update
    tabs.splice(tabIndex + 1, 0, newTabData);
    activeTab.value = tabIndex + 1;
    
    console.log('Tab duplicated instantly, syncing to cloud...');
    
    // Sync to cloud in background (no await)
    syncDuplicatedTabToCloud(newTabData);
    
    // Cache is still valid, just added new item
    lastFetchTime.value = Date.now();
  }
};

// Background sync function for duplicated tabs
const syncDuplicatedTabToCloud = async (tabData: Tab) => {
  syncStatus.pendingSyncs++;
  syncStatus.isSyncing = true;
  
  try {
    // Ensure content is properly serialized for API
    let contentToSave = tabData.content;
    if (typeof contentToSave === 'object' && contentToSave !== null) {
      contentToSave = JSON.stringify(contentToSave);
    }

    const response: any = await apiRequest('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: tabData.title,
        content: contentToSave,
        color: tabData.color,
        lock: tabData.lock,
        position: tabData.position,
        id: tabData.id,
      }),
    });
    
    // Update the tab with the server-assigned noteId
    tabData.noteId = response.note.noteId || response.note._id || response.note.id;
    
    // Update positions in the database
    await syncTabPositionsToCloud();
    
    syncStatus.lastSyncTime = Date.now();
    console.log('Duplicated tab synced to cloud:', tabData.noteId);
  } catch (error) {
    console.error('Failed to sync duplicated tab to cloud:', error);
  } finally {
    syncStatus.pendingSyncs = Math.max(0, syncStatus.pendingSyncs - 1);
    if (syncStatus.pendingSyncs === 0) {
      syncStatus.isSyncing = false;
    }
  }
};

const lockTab = (tabIndex: number) => {
  if (tabs[tabIndex]) {
    // Instant UI update
    tabs[tabIndex].lock = !tabs[tabIndex].lock;
    
    console.log(`Tab lock status changed to ${tabs[tabIndex].lock} instantly, syncing to cloud...`);
    
    // Sync to cloud in background (no await)
    syncTabToCloud(tabs[tabIndex]);
  }
};

const moveTab = (tabIndex: number, direction: 'left' | 'right') => {
  if (direction === 'left' && tabIndex > 0) {
    moveTabToPosition(tabIndex, tabIndex - 1);
  } else if (direction === 'right' && tabIndex < tabs.length - 1) {
    moveTabToPosition(tabIndex, tabIndex + 1);
  }
};

// Keyboard shortcuts
function handleShortcut(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 'n') {
    event.preventDefault();
    newTab();
  }
  
  // CTRL + R -> Refresh cache (manual refresh)
  if (event.ctrlKey && event.key === 'r' && event.shiftKey) {
    event.preventDefault();
    refreshCache();
    return;
  }
  
  if (event.altKey) {
    event.preventDefault();
    const numberListener = (e: KeyboardEvent) => {
      if (isNumber(parseInt(e.key)) && parseInt(e.key) <= tabs.length) {
        const tabNumber = parseInt(e.key) - 1;
        if (tabNumber < tabs.length) {
          activeTab.value = tabNumber;
        }
        document.removeEventListener('keydown', numberListener);
      }
    };
    document.addEventListener('keydown', numberListener);
  }
  
  if (event.ctrlKey && event.shiftKey && event.key === 'ArrowLeft') {
    event.preventDefault();
    moveTab(activeTab.value, 'left');
  }
  
  if (event.ctrlKey && event.shiftKey && event.key === 'ArrowRight') {
    event.preventDefault();
    moveTab(activeTab.value, 'right');
  }
}

// Lifecycle
onMounted(async () => {
  document.addEventListener('keydown', handleShortcut);
  await loadNotesFromCloud();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleShortcut);
});

// SEO
const fallbackTitle = 'Untitled';
const currentTab = computed(() => tabs[activeTab.value]);
const currentTabTitle = computed(() => currentTab.value?.title || fallbackTitle);

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