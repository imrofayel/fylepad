<template>
  <div class="h-full w-full gap-0 flex" :class="isVerticalTabs ? 'flex-row' : 'flex-col'">
    <!-- Command Dialog -->
    <UiCommand
      :is-open="commandOpen"
      :tabs="tabs"
      :active-tab-index="activeTab"
      @close="commandOpen = false"
      @select-tab="handleTabSelect"
      @select-result="handleSearchResultSelect"
      @new-tab="newTab"
    />

    <!-- Top Bar for Horizontal Tabs -->
    <div v-if="!isVerticalTabs" v-show="!focusMode.focused" class="flex justify-between items-center w-full p-0 py-2 fixed bg-white z-10 pr-[7.5rem] dark:bg-[#171717]">
      <div class="flex space-x-2 overflow-visible justify-center items-center">
        <!-- Tab Layout Toggle @click="toggleTabLayout" -->
        <button 
          class="hover:!scale-100 drop-shadow-sm hidden" :title="isVerticalTabs ? 'Switch to Horizontal Tabs' : 'Switch to Vertical Tabs'">
          
          <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="peekSide directional-icon rotate-180" style="width: 25px; display: block; flex-shrink: 0;"><path d="M10.392 6.125a.5.5 0 0 0-.5.5v6.75a.5.5 0 0 0 .5.5h4.683a.5.5 0 0 0 .5-.5v-6.75a.5.5 0 0 0-.5-.5z"/><path d="M4.5 4.125A2.125 2.125 0 0 0 2.375 6.25v7.5c0 1.174.951 2.125 2.125 2.125h11a2.125 2.125 0 0 0 2.125-2.125v-7.5A2.125 2.125 0 0 0 15.5 4.125zM3.625 6.25c0-.483.392-.875.875-.875h11c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-11a.875.875 0 0 1-.875-.875z"/></svg>

        </button>

        <button
class="hover:!scale-100 dark:text-gray-50  drop-shadow-sm"
          title="New Tab" @click="newTab">
          
          <svg aria-hidden="true" fill="currentColor" role="graphics-symbol" viewBox="0 0 16 16" class="plus mx-1" style="width: 17px; display: block; flex-shrink: 0; margin-inline-end: 6px; margin-top: 1px;"><path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"/></svg>

        </button>

        <div ref="tabContainer" class="dropdown-menu overflow-auto flex space-x-2">
          <div class="flex space-x-2">
            <div
              v-for="(tab, tabIndex) in tabs"
              :key="tab.id"
              :ref="el => setTabRef(tabIndex, el)"
              draggable="true"
              class="border border-[#c6c6c4] bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-xl justify-center items-center cursor-pointer flex drop-shadow-cool tab-item relative transition-all duration-200"
              :class="getTabClasses(tabIndex)"
              :style="getTabStyle(tabIndex)"
              @dragstart="onTabDragStart(tabIndex, $event)"
              @dragover="onTabDragOver($event, tabIndex)"
              @dragenter="onTabDragEnter($event, tabIndex)"
              @dragleave="onTabDragLeave($event)"
              @drop="onTabDrop($event, tabIndex)"
              @dragend="onTabDragEnd"
              @click="activeTab = tabIndex"
              @contextmenu.prevent="showContextMenu(tabIndex, $event)"
            >
              <!-- Color indicator -->
              <div 
                v-if="tab.color && tab.color !== 'Default'"
                class="w-[4.5px] relative right-0.5 h-[16px] rounded-full mr-[4px]"
                :class="getTabColorIndicator(tab.color)"
              />
              
              <span class="tab-title">{{ tab.title || 'Untitled' }}</span>
              <button
v-if="!tab.lock"
                class="ml-2 hover:text-red-600 dark:text-gray-50/50 dark:hover:text-gray-100" title="Close tab"
                @click.stop="closeTab(tabIndex)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar for Vertical Tabs -->
    <div v-if="isVerticalTabs && sidebarVisible" v-show="!focusMode.focused" class="flex flex-col min-w-60 max-w-60 border-[#c6c6c4] m-3 dark:border-[#525252] h-full sticky top-3 border rounded-xl !overflow-visible  dark:bg-[#171717] z-20">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-2.5 pr-1.5 py-2 dark:border-[#525252] dark:bg-[#171717]">
        <!-- Tab Layout Toggle -->
        <button
class="hover:!scale-100 drop-shadow-sm"
          :title="isVerticalTabs ? 'Switch to Horizontal Tabs' : 'Switch to Vertical Tabs'" @click="toggleTabLayout">
          <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="peekSide directional-icon" style="width: 25px; display: block; flex-shrink: 0;"><path d="M10.392 6.125a.5.5 0 0 0-.5.5v6.75a.5.5 0 0 0 .5.5h4.683a.5.5 0 0 0 .5-.5v-6.75a.5.5 0 0 0-.5-.5z"/><path d="M4.5 4.125A2.125 2.125 0 0 0 2.375 6.25v7.5c0 1.174.951 2.125 2.125 2.125h11a2.125 2.125 0 0 0 2.125-2.125v-7.5A2.125 2.125 0 0 0 15.5 4.125zM3.625 6.25c0-.483.392-.875.875-.875h11c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-11a.875.875 0 0 1-.875-.875z"/></svg>
        </button>

        <div class="flex items-center space-x-2">
          <button
class="hover:!scale-100 drop-shadow-sm"
            title="New Tab" @click="newTab">
            <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 16 16" class="plus" style="width: 16px; display: block; flex-shrink: 0; margin-inline-end: 6px; margin-top: 1px;"><path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"/></svg>
          </button>
          
          <!-- Close Sidebar Button -->
          <button
class="hover:!scale-100 drop-shadow-sm dark:text-gray-50"
            title="Hide Sidebar" @click="sidebarVisible = false">
            <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 16 16" class="doubleChevronRight directional-icon rotate-180" style="width: 17px; display: block; flex-shrink: 0;" fill="currentColor"><path d="M2.25781 14.1211C2.47656 14.1211 2.66797 14.0391 2.81836 13.8887L8.14355 8.67969C8.32812 8.49512 8.41699 8.29688 8.41699 8.06445C8.41699 7.8252 8.32812 7.62012 8.14355 7.44922L2.81836 2.24023C2.66797 2.08984 2.4834 2.00781 2.25781 2.00781C1.81348 2.00781 1.46484 2.35645 1.46484 2.80078C1.46484 3.0127 1.55371 3.21777 1.7041 3.375L6.50977 8.05762L1.7041 12.7539C1.55371 12.9043 1.46484 13.1094 1.46484 13.3281C1.46484 13.7725 1.81348 14.1211 2.25781 14.1211ZM8.36914 14.1211C8.58789 14.1211 8.77246 14.0391 8.92285 13.8887L14.2549 8.67969C14.4395 8.49512 14.5283 8.29688 14.5283 8.06445C14.5283 7.8252 14.4326 7.62012 14.2549 7.44922L8.92285 2.24023C8.77246 2.08984 8.58789 2.00781 8.36914 2.00781C7.9248 2.00781 7.56934 2.35645 7.56934 2.80078C7.56934 3.0127 7.66504 3.21777 7.81543 3.375L12.6211 8.05762L7.81543 12.7539C7.66504 12.9043 7.56934 13.1094 7.56934 13.3281C7.56934 13.7725 7.9248 14.1211 8.36914 14.1211Z"/></svg>
          </button>
        </div>
      </div>

      <!-- Vertical Tabs List -->
      <div ref="tabContainer" class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="(tab, tabIndex) in tabs"
          :key="tab.id"
          :ref="el => setTabRef(tabIndex, el)"
          draggable="true"
          class="group relative w-full p-1 pr-0.5 py-1.5 text-[#32302c] cursor-pointer flex items-center  tab-item"
          :class="tabIndex === activeTab && ' !bg-gray-100/80 rounded-lg !px-2'"
          :style="getTabStyle(tabIndex)"
          @dragstart="onTabDragStart(tabIndex, $event)"
          @dragover="onTabDragOver($event, tabIndex)"
          @dragenter="onTabDragEnter($event, tabIndex)"
          @dragleave="onTabDragLeave($event)"
          @drop="onTabDrop($event, tabIndex)"
          @dragend="onTabDragEnd"
          @click="activeTab = tabIndex"
          
          @contextmenu.prevent="showContextMenu(tabIndex, $event)"
        >
          <svg aria-hidden="true" class="mr-1.5 fill-white" :class="(tabIndex !== activeTab) && getTabIconColorIndicator(tab.color as any)"  role="graphics-symbol" viewBox="0 0 16 16" style="width: 19px; fill: rgba(71, 70, 68, 0.6); display: block; flex-shrink: 0;"><path data-v-2474b7ad="" d="M4.35645 15.4678H11.6367C13.0996 15.4678 13.8584 14.6953 13.8584 13.2256V7.02539C13.8584 6.0752 13.7354 5.6377 13.1406 5.03613L9.55176 1.38574C8.97754 0.804688 8.50586 0.667969 7.65137 0.667969H4.35645C2.89355 0.667969 2.13477 1.44043 2.13477 2.91016V13.2256C2.13477 14.7021 2.89355 15.4678 4.35645 15.4678ZM4.46582 14.1279C3.80273 14.1279 3.47461 13.7793 3.47461 13.1436V2.99219C3.47461 2.36328 3.80273 2.00781 4.46582 2.00781H7.37793V5.75391C7.37793 6.73145 7.86328 7.20312 8.83398 7.20312H12.5186V13.1436C12.5186 13.7793 12.1836 14.1279 11.5205 14.1279H4.46582ZM8.95703 6.02734C8.67676 6.02734 8.56055 5.9043 8.56055 5.62402V2.19238L12.334 6.02734H8.95703ZM10.4336 9.00098H5.42969C5.16992 9.00098 4.98535 9.19238 4.98535 9.43164C4.98535 9.67773 5.16992 9.86914 5.42969 9.86914H10.4336C10.6797 9.86914 10.8643 9.67773 10.8643 9.43164C10.8643 9.19238 10.6797 9.00098 10.4336 9.00098ZM10.4336 11.2979H5.42969C5.16992 11.2979 4.98535 11.4893 4.98535 11.7354C4.98535 11.9746 5.16992 12.1592 5.42969 12.1592H10.4336C10.6797 12.1592 10.8643 11.9746 10.8643 11.7354C10.8643 11.4893 10.6797 11.2979 10.4336 11.2979Z"/></svg>
          
          <!-- Tab content -->
          <div class="flex-1 min-w-0">
            <div class=" truncate text-[18px]">{{ tab.title || 'Untitled' }}</div>
          </div>

          <!-- Close button -->
          <button
v-if="!tab.lock"
            class="ml-2 hover:text-red-600 flex-shrink-0 opacity-0 group-hover:opacity-100" 
            :class="tabIndex === activeTab && '!opacity-100'"
            title="Close tab"
            @click.stop="closeTab(tabIndex)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
class="flex-grow" :class="[
      focusMode.focused ? 'mt-1' : (isVerticalTabs ? '!mt-0' : 'mt-7'),
      isVerticalTabs && !focusMode.focused ? 'ml-0' : ''
    ]">
      <button 
        v-if="isVerticalTabs && !sidebarVisible && !focusMode.focused" 
        class="fixed top-4 left-4 z-30 dark:text-gray-50"
        title="Show Sidebar"
        @click="sidebarVisible = true">
        <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 16 16" class="doubleChevronRight directional-icon" style="width: 19px; display: block; flex-shrink: 0;" fill="currentColor"><path d="M2.25781 14.1211C2.47656 14.1211 2.66797 14.0391 2.81836 13.8887L8.14355 8.67969C8.32812 8.49512 8.41699 8.29688 8.41699 8.06445C8.41699 7.8252 8.32812 7.62012 8.14355 7.44922L2.81836 2.24023C2.66797 2.08984 2.4834 2.00781 2.25781 2.00781C1.81348 2.00781 1.46484 2.35645 1.46484 2.80078C1.46484 3.0127 1.55371 3.21777 1.7041 3.375L6.50977 8.05762L1.7041 12.7539C1.55371 12.9043 1.46484 13.1094 1.46484 13.3281C1.46484 13.7725 1.81348 14.1211 2.25781 14.1211ZM8.36914 14.1211C8.58789 14.1211 8.77246 14.0391 8.92285 13.8887L14.2549 8.67969C14.4395 8.49512 14.5283 8.29688 14.5283 8.06445C14.5283 7.8252 14.4326 7.62012 14.2549 7.44922L8.92285 2.24023C8.77246 2.08984 8.58789 2.00781 8.36914 2.00781C7.9248 2.00781 7.56934 2.35645 7.56934 2.80078C7.56934 3.0127 7.66504 3.21777 7.81543 3.375L12.6211 8.05762L7.81543 12.7539C7.66504 12.9043 7.56934 13.1094 7.56934 13.3281C7.56934 13.7725 7.9248 14.1211 8.36914 14.1211Z"/></svg>
      </button>

      <Editor
v-if="tabs.length > 0" ref="editorRef" :key="activeTab" :title="tabs[activeTab].title" :content="tabs[activeTab].content"
        :tabs="tabs" :active-tab-index="activeTab" :is-vertical="isVerticalTabs"
        :is-sidebar-open="sidebarVisible"
        @update:title="updateTabTitle"
        @update:content="updateTabContent"
        @open-command="commandOpen = true" 
        @switch-to-tab="switchToTab"/>
    </div>

    <!-- Tab Context Menu -->
    <TabContextMenu
      :visible="contextMenu.visible"
      :target-element="contextMenu.targetElement"
      :tab-index="contextMenu.tabIndex"
      :tab-color="contextMenu.tabIndex >= 0 ? tabs[contextMenu.tabIndex]?.color || 'Default' : 'Default'"
      :total-tabs="tabs.length"
      :status="tabs[activeTab].lock"
      @close="closeContextMenu"
      @color-changed="changeTabColor"
      @duplicate-tab="duplicateTab"
      @lock-tab="lockTab"

    />

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, onBeforeUnmount, computed, nextTick } from 'vue';
import {  path } from '@tauri-apps/api';
import { isNumber } from '@tiptap/core';

import { useFocusStore } from '../stores/focus'
import TabContextMenu from '../components/ui/tabContextMenu.vue'
import * as fs from "@tauri-apps/plugin-fs"

const focusMode = useFocusStore()

const colorMode = useColorMode()

// Command dialog state
const commandOpen = ref(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = ref<{ editor: any } | null>(null)

// Vertical tabs state
const isVerticalTabs = ref(false)
const sidebarVisible = ref(true)

interface Tab {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  color?: string;
  lock: boolean
  id: string; // Add unique ID for tabs
}

const tabs = reactive<Tab[]>([{ 
  title: 'Untitled', 
  content: '', 
  color: 'Default',
  lock: false,
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
const onTabDragEnter = (event: DragEvent, _targetIndex: number) => {
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

const getTabIconColorIndicator = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'Blue': '!fill-blue-500',
    'Red': '!fill-red-500',
    'Purple': '!fill-purple-500',
    'Orange': '!fill-orange-500',
    'Pink': '!fill-pink-500',
    'Teal': '!fill-teal-500',
    'Yellow': '!fill-yellow-500',
    'default': '!fill-white'
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
      lock: false,
      id: crypto.randomUUID()
    };
    tabs.splice(tabIndex + 1, 0, newTab);
    activeTab.value = tabIndex + 1;
    saveAppState();
  }
};

const lockTab = (tabIndex: number) => {
    if (tabs[tabIndex]) {
    tabs[tabIndex].lock = !tabs[tabIndex].lock;
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

// Toggle tab layout and manage sidebar visibility
const toggleTabLayout = () => {
  isVerticalTabs.value = !isVerticalTabs.value;
  if (isVerticalTabs.value) {
    // When switching to vertical tabs, show sidebar by default
    sidebarVisible.value = true;
  }
};

// Handle tab selection from command dialog
const handleTabSelect = (tabIndex: number) => {
  activeTab.value = tabIndex;
};

// Handle search result selection from command dialog
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSearchResultSelect = async (result: any) => {
  // Switch to the tab
  activeTab.value = result.tabIndex;
  
  // Wait for the tab to be active and editor to be ready
  await nextTick();
  
  // Small delay to ensure editor is fully ready
  setTimeout(() => {
    // Try to get the editor instance from the ref
    const editor = editorRef.value?.editor;
    
    if (editor) {
      console.log('Using editor from ref');
      // Use the search & replace extension to highlight and navigate to the result
      const searchTerm = result.searchTerm || result.text.substring(0, 50);
      editor.commands.setSearchTerm(searchTerm);
      editor.commands.resetIndex();
      
      // Wait a bit for search to process
      setTimeout(() => {
        const { results } = editor.storage.searchAndReplace;
        
        if (results && results.length > 0) {
          // Find the closest match to our result position
          let bestMatchIndex = 0;
          if (result.from !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bestMatchIndex = results.findIndex((r: any) => 
              Math.abs(r.from - result.from) < 10
            );
            if (bestMatchIndex === -1) bestMatchIndex = 0;
          }
          
          // Set the result index to highlight the correct match
          editor.storage.searchAndReplace.resultIndex = bestMatchIndex;
          
          // Set text selection and scroll to position
          const targetResult = results[bestMatchIndex];
          if (targetResult) {
            editor.commands.setTextSelection({ 
              from: targetResult.from, 
              to: targetResult.to 
            });
            
            // Wait for selection to be set
            setTimeout(() => {
              // Scroll to position
              try {
                const { node } = editor.view.domAtPos(editor.state.selection.anchor);
                if (node instanceof HTMLElement) {
                  node.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              } catch (e) {
                console.log('Could not scroll to position:', e);
              }
              
              // Focus the editor
              editor.chain().focus().run();
              
              // Clear the search after a delay
              setTimeout(() => {
                editor.commands.setSearchTerm('');
              }, 3000);
            }, 100);
          }
        }
      }, 100);
    } else {
      // Fallback to DOM method
      console.log('Using DOM fallback method');
      const proseMirrorElement = document.querySelector('.ProseMirror');
      
      if (proseMirrorElement) {
        // Try to get the TipTap editor instance through the Vue component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vueComponent = (proseMirrorElement as any)?.__vueParentComponent;
        const fallbackEditor = vueComponent?.parent?.setupState?.editor || vueComponent?.ctx?.editor;
        
        if (fallbackEditor) {
          const searchTerm = result.searchTerm || result.text.substring(0, 50);
          fallbackEditor.commands.setSearchTerm(searchTerm);
          fallbackEditor.commands.resetIndex();
          
          setTimeout(() => {
            const { results } = fallbackEditor.storage.searchAndReplace;
            if (results && results.length > 0) {
              let bestMatchIndex = 0;
              if (result.from !== undefined) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
              bestMatchIndex = results.findIndex((r: any) => 
                  Math.abs(r.from - result.from) < 10
                );
                if (bestMatchIndex === -1) bestMatchIndex = 0;
              }
              
              fallbackEditor.storage.searchAndReplace.resultIndex = bestMatchIndex;
              const targetResult = results[bestMatchIndex];
              if (targetResult) {
                fallbackEditor.commands.setTextSelection({ 
                  from: targetResult.from, 
                  to: targetResult.to 
                });
                
                setTimeout(() => {
                  try {
                    const { node } = fallbackEditor.view.domAtPos(fallbackEditor.state.selection.anchor);
                    if (node instanceof HTMLElement) {
                      node.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  } catch (e) {
                    console.log('Could not scroll to position:', e);
                  }
                  
                  fallbackEditor.chain().focus().run();
                  setTimeout(() => {
                    fallbackEditor.commands.setSearchTerm('');
                  }, 3000);
                }, 100);
              }
            }
          }, 100);
        } else {
          // Final fallback to simple scrolling
          console.log('Using simple text search fallback');
          let node;
          const walker = document.createTreeWalker(
            proseMirrorElement,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          const searchTerm = result.text.toLowerCase().substring(0, 50);
          while ((node = walker.nextNode())) {
            const textContent = node.textContent?.toLowerCase() || '';
            if (textContent.includes(searchTerm)) {
              const element = node.parentElement;
              if (element) {
                element.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
                break;
              }
            }
          }
        }
      }
    }
  }, 200);
};

// Function to save the app state
async function saveAppState() {
  const appState = {
    tabs: tabs,
    activeTab: activeTab.value,
    colorMode: colorMode.preference,
    isVerticalTabs: isVerticalTabs.value,
    sidebarVisible: sidebarVisible.value
  };

  // Try to save using Tauri's fs API
  try {
    const appDir = await path.appDataDir();
    const filePath = await path.join(appDir, 'app_state.json');
    await fs.writeTextFile(filePath, JSON.stringify(appState));
  } catch {
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
  } catch {
    // If Tauri's fs API fails, try localStorage
    const storedState = localStorage.getItem('appState');
    if (storedState) {
      appState = JSON.parse(storedState);
    }
  }

  // If we successfully loaded a state, apply it
  if (appState) {
    // Ensure all tabs have IDs (for backward compatibility)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migratedTabs = appState.tabs.map((tab: any) => ({
      ...tab,
      id: tab.id || crypto.randomUUID()
    }));
    
    tabs.splice(0, tabs.length, ...migratedTabs);
    activeTab.value = appState.activeTab;
    colorMode.preference = appState.colorMode;
    if (appState.isVerticalTabs !== undefined) {
      isVerticalTabs.value = appState.isVerticalTabs;
    }
    if (appState.sidebarVisible !== undefined) {
      sidebarVisible.value = appState.sidebarVisible;
    }
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
watch([tabs, activeTab, () => colorMode.preference, isVerticalTabs, sidebarVisible], async () => {
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
    lock: false,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateTabContent = (content: any) => {
  const currentTab = tabs[activeTab.value];
  if (currentTab) {
    currentTab.content = content;
  }
};

const switchToTab = (tabIndex: number) => {
  if (tabIndex >= 0 && tabIndex < tabs.length) {
    activeTab.value = tabIndex;
  }
};

function handleShortcut(event: KeyboardEvent) {
  // CTRL + K -> Open command palette
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault();
    commandOpen.value = true;
    return;
  }

  // CTRL + N -> New tab
  if (event.ctrlKey && event.key === 'n') {
    event.preventDefault();
    newTab();
  }
  
  // CTRL + G + [number] -> Switch to tab
  if (event.altKey) {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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