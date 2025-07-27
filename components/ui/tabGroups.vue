<template>
  <div class="mb-2" v-if="groups.length > 0">
    <div v-for="group in groups" :key="group.name" class="mb-1">
      <div 
        class="flex items-center justify-between px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#2a2a2a] rounded cursor-pointer"
        @click="toggleGroup(group.name)"
      >
        <span>{{ group.name }} ({{ group.tabs.length }})</span>
        <svg 
          class="w-4 h-4 transition-transform" 
          :class="{ 'rotate-90': expandedGroups.has(group.name) }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
      
      <div 
        v-show="expandedGroups.has(group.name)"
        class="ml-2 mt-1 space-y-1"
      >
        <div
          v-for="tab in group.tabs"
          :key="tab.index"
          @click="$emit('tabSelected', tab.index)"
          class="flex items-center justify-between px-2 py-1 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-[#404040]"
          :class="{ 
            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': tab.index === activeTab 
          }"
        >
          <div class="flex items-center space-x-2">
            <div 
              class="w-3 h-3 rounded-full" 
              :class="getTabColorClass(tab.color)"
            />
            <span class="truncate">{{ tab.title }}</span>
          </div>
          <button
            @click.stop="$emit('closeTab', tab.index)"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface TabInfo {
  index: number
  title: string
  color: string
}

interface GroupInfo {
  name: string
  tabs: TabInfo[]
}

interface Props {
  tabs: Array<{ title: string; color?: string; group?: string }>
  activeTab: number
}

interface Emits {
  (e: 'tabSelected', index: number): void
  (e: 'closeTab', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expandedGroups = ref(new Set<string>())

const groups = computed((): GroupInfo[] => {
  const groupMap = new Map<string, TabInfo[]>()
  
  props.tabs.forEach((tab, index) => {
    if (tab.group) {
      if (!groupMap.has(tab.group)) {
        groupMap.set(tab.group, [])
      }
      groupMap.get(tab.group)!.push({
        index,
        title: tab.title || 'Untitled',
        color: tab.color || 'Default'
      })
    }
  })
  
  return Array.from(groupMap.entries()).map(([name, tabs]) => ({
    name,
    tabs
  }))
})

const toggleGroup = (groupName: string) => {
  if (expandedGroups.value.has(groupName)) {
    expandedGroups.value.delete(groupName)
  } else {
    expandedGroups.value.add(groupName)
  }
}

const getTabColorClass = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'Default': 'bg-gray-400',
    'Blue': 'bg-blue-400',
    'Red': 'bg-red-400',
    'Purple': 'bg-purple-400',
    'Orange': 'bg-orange-400',
    'Pink': 'bg-pink-400',
    'Teal': 'bg-teal-400',
    'Yellow': 'bg-yellow-400',
  }
  return colorMap[colorName] || 'bg-gray-400'
}

// Auto-expand groups that contain the active tab
watch(() => props.activeTab, (activeTab) => {
  const activeTabData = props.tabs[activeTab]
  if (activeTabData?.group) {
    expandedGroups.value.add(activeTabData.group)
  }
}, { immediate: true })
</script>
