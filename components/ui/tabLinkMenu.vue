<template>
  <div 
    v-if="items.length"
    class="tab-link-menu"
    ref="menuRef"
  >
    <div class="tab-link-menu-header">
      <span class="tab-link-menu-icon">🔗</span>
      <span>Link to tab</span>
    </div>
    
    <div class="tab-link-menu-items">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        :class="[
          'tab-link-menu-item',
          {
            'tab-link-menu-item-active': index === selectedIndex,
          },
        ]"
        @click="selectItem(index)"
      >
        <div class="tab-link-item-content">
          <div class="tab-link-item-header">
            <div 
              v-if="item.color && item.color !== 'Default'"
              class="tab-link-item-color"
              :class="getTabColorClass(item.color)"
            />
            <span class="tab-link-item-icon">📄</span>
            <span class="tab-link-item-title">{{ item.title || 'Untitled' }}</span>
          </div>
          <div v-if="item.preview" class="tab-link-item-preview">
            {{ item.preview }}
          </div>
        </div>
        <div class="tab-link-item-meta">
          <span class="tab-link-item-index">#{{ index + 1 }}</span>
        </div>
      </button>
    </div>
    
    <div class="tab-link-menu-footer">
      <span class="tab-link-menu-hint">
        ↑↓ to navigate • Enter to select • Esc to cancel
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

export interface TabLinkItem {
  id: string
  title: string
  color?: string
  preview?: string
  content?: any
}

interface Props {
  items: TabLinkItem[]
  command: (item: TabLinkItem) => void
}

const props = defineProps<Props>()

const selectedIndex = ref(0)
const menuRef = ref<HTMLElement>()

const selectItem = (index: number) => {
  if (props.items[index]) {
    props.command(props.items[index])
  }
}

const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
}

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex.value)
}

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    enterHandler()
    return true
  }

  return false
}

const getTabColorClass = (colorName: string) => {
  const colorMap: Record<string, string> = {
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

// Expose the keydown handler for Tiptap
defineExpose({
  onKeyDown,
})

onMounted(() => {
  // Scroll selected item into view when needed
  const scrollToSelected = () => {
    const selectedElement = menuRef.value?.querySelector('.tab-link-menu-item-active')
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' })
    }
  }
  
  // Watch for selectedIndex changes and scroll
  watch(() => selectedIndex.value, scrollToSelected)
})

</script>

<style scoped>
.tab-link-menu {
  @apply bg-white dark:bg-[#404040] border border-gray-200 dark:border-[#525252] rounded-2xl shadow-lg backdrop-blur-xl min-w-[320px] max-w-[400px] max-h-[300px] overflow-hidden;
}

.tab-link-menu-header {
  @apply flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-[#525252] bg-gray-50 dark:bg-[#333333];
}

.tab-link-menu-icon {
  @apply text-lg;
}

.tab-link-menu-items {
  @apply overflow-y-auto max-h-[200px];
}

.tab-link-menu-item {
  @apply w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-[#333333] border-none bg-transparent;
}

.tab-link-menu-item-active {
  @apply bg-gray-100 dark:bg-[#333333];
}

.tab-link-item-content {
  @apply flex-1 min-w-0;
}

.tab-link-item-header {
  @apply flex items-center gap-2 mb-1;
}

.tab-link-item-color {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

.tab-link-item-icon {
  @apply text-sm flex-shrink-0;
}

.tab-link-item-title {
  @apply font-medium text-gray-900 dark:text-gray-100 truncate;
}

.tab-link-item-preview {
  @apply text-xs text-gray-500 dark:text-gray-400 truncate ml-6;
}

.tab-link-item-meta {
  @apply flex-shrink-0 ml-3;
}

.tab-link-item-index {
  @apply text-xs text-gray-400 dark:text-gray-500 font-mono;
}

.tab-link-menu-footer {
  @apply px-4 py-2 border-t border-gray-200 dark:border-[#525252] bg-gray-50 dark:bg-[#333333];
}

.tab-link-menu-hint {
  @apply text-xs text-gray-500 dark:text-gray-400;
}
</style>
