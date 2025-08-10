<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      @click="handleBackdropClick"
    >
      <!-- Backdrop -->
      <Motion
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.15 }"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />
      
      <!-- Command Dialog -->
      <Motion
        :initial="{ opacity: 0, scale: 0.95, y: -20 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :exit="{ opacity: 0, scale: 0.95, y: -20 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
        class="relative w-full max-w-2xl mx-4"
        @click.stop
      >
        <div class="bg-white dark:bg-[#404040] rounded-2xl border border-gray-200 dark:border-[#525252] shadow-2xl overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center px-4 py-3 border-b border-gray-200 dark:border-[#525252]">
            <svg
              class="w-5 h-5 text-gray-400 dark:text-gray-300 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search across all tabs..."
              class="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg"
              @keydown="handleKeyDown"
            />
            <div class="text-xs text-gray-400 dark:text-gray-500 ml-2">
              {{ filteredResults.length }} results
            </div>
          </div>

          <!-- Results -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loading" class="p-4 text-center text-gray-500 dark:text-gray-400">
              <svg class="animate-spin w-5 h-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Searching...
            </div>

            <div v-else-if="searchQuery && filteredResults.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
              <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0120 12a8 8 0 10-2.209 5.291c-.312.312-.38.606-.58.88a8.005 8.005 0 01-1.238 1.137C15.311 19.64 13.78 20 12 20s-3.311-.36-3.973-.692A8.005 8.005 0 017.79 18.17c-.2-.274-.268-.568-.58-.88A7.962 7.962 0 015 12a8 8 0 0112.001-.001z"/>
              </svg>
              No results found
            </div>

            <div v-else-if="!searchQuery" class="p-4">
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">Quick Actions</div>
              <div class="space-y-1">
                <div
                  v-for="(action, index) in quickActions"
                  :key="action.id"
                  :class="[
                    'flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors',
                    selectedIndex === index
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300'
                  ]"
                  @click="executeAction(action)"
                >
                  <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#333333] flex items-center justify-center mr-3">
                    <svg v-if="action.icon === 'plus'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    <svg v-else-if="action.icon === 'tab'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium">{{ action.title }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ action.description }}</div>
                  </div>
                  <div class="text-xs text-gray-400 dark:text-gray-500">{{ action.shortcut }}</div>
                </div>
              </div>
            </div>

            <div v-else class="py-2">
              <Motion
                v-for="(result, index) in filteredResults"
                :key="`${result.tabIndex}-${result.position}`"
                :initial="{ opacity: 0, y: 10 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.1, delay: index * 0.02 }"
                :class="[
                  'flex items-start px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-[#333333] last:border-b-0 transition-colors',
                  selectedIndex === index
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-[#333333]'
                ]"
                @click="selectResult(result)"
              >
                <!-- Tab indicator -->
                <div class="flex items-center mr-3 mt-1">
                  <div 
                    class="w-3 h-3 rounded-full mr-2"
                    :class="getTabColorClass(result.tabColor || 'Default')"
                  />
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Tab {{ result.tabIndex + 1 }}
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {{ result.tabTitle || 'Untitled' }}
                  </div>
                  <div 
                    class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                    v-html="result.highlightedText"
                  />
                  <div class="flex items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l3 3-6 6 2-4 1-2z"/>
                    </svg>
                    Position {{ result.position + 1 }}
                  </div>
                </div>
              </Motion>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2 border-t border-gray-200 dark:border-[#525252] bg-gray-50 dark:bg-[#333333] text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <span class="flex items-center">
                  <kbd class="px-1.5 py-0.5 bg-white dark:bg-[#404040] border border-gray-200 dark:border-[#525252] rounded">↑↓</kbd>
                  <span class="ml-1">to navigate</span>
                </span>
                <span class="flex items-center">
                  <kbd class="px-1.5 py-0.5 bg-white dark:bg-[#404040] border border-gray-200 dark:border-[#525252] rounded">↵</kbd>
                  <span class="ml-1">to select</span>
                </span>
              </div>
              <span class="flex items-center">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-[#404040] border border-gray-200 dark:border-[#525252] rounded">Esc</kbd>
                <span class="ml-1">to close</span>
              </span>
            </div>
          </div>
        </div>
      </Motion>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Motion } from 'motion-v'

interface Tab {
  title: string
  content: any
  color?: string
  lock: boolean
  id: string
}

interface SearchResult {
  tabIndex: number
  tabTitle: string
  tabColor?: string
  position: number
  from: number
  to: number
  text: string
  highlightedText: string
  context: string
  searchTerm: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  shortcut: string
  icon: any
  action: () => void
}

interface Props {
  isOpen: boolean
  tabs: Tab[]
  activeTabIndex: number
}

interface Emits {
  (e: 'close'): void
  (e: 'selectTab', tabIndex: number): void
  (e: 'selectResult', result: SearchResult): void
  (e: 'newTab'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchInputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const selectedIndex = ref(0)
const loading = ref(false)
const searchResults = ref<SearchResult[]>([])

// Quick actions when no search query
const quickActions = computed((): QuickAction[] => [
  {
    id: 'new-tab',
    title: 'New Tab',
    description: 'Create a new tab',
    shortcut: 'Ctrl+N',
    icon: 'plus',
    action: () => {
      emit('newTab')
      emit('close')
    }
  },
  {
    id: 'switch-tab',
    title: 'Switch Tab',
    description: `Switch to tab ${props.activeTabIndex + 1} of ${props.tabs.length}`,
    shortcut: 'Alt+[1-9]',
    icon: 'tab',
    action: () => {
      // This is just informational
    }
  }
])

// Focus search input when dialog opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    searchInputRef.value?.focus()
    searchQuery.value = ''
    selectedIndex.value = 0
    searchResults.value = []
  }
})

// Debounced search
const searchTimeout = ref<NodeJS.Timeout>()
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout.value)
  
  if (!newQuery.trim()) {
    searchResults.value = []
    selectedIndex.value = 0
    return
  }

  loading.value = true
  searchTimeout.value = setTimeout(() => {
    performSearch(newQuery.trim())
    loading.value = false
  }, 150)
})

// Extract text content from editor JSON
const extractTextFromContent = (content: any): string => {
  if (!content) return ''
  
  const extractText = (node: any): string => {
    let text = ''
    
    if (node.text) {
      text += node.text
    }
    
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        text += extractText(child)
      }
    }
    
    return text
  }
  
  if (typeof content === 'string') {
    return content
  }
  
  if (content.content && Array.isArray(content.content)) {
    return extractText(content)
  }
  
  return ''
}

// Perform search across all tabs
const performSearch = (query: string) => {
  const results: SearchResult[] = []
  const searchTerm = query.toLowerCase()
  
  props.tabs.forEach((tab, tabIndex) => {
    const text = extractTextFromContent(tab.content)
    const title = tab.title || 'Untitled'
    
    // Search in title
    if (title.toLowerCase().includes(searchTerm)) {
      const titleIndex = title.toLowerCase().indexOf(searchTerm)
      const highlightedTitle = highlightText(title, searchTerm)
      results.push({
        tabIndex,
        tabTitle: title,
        tabColor: tab.color,
        position: 0,
        from: titleIndex,
        to: titleIndex + searchTerm.length,
        text: title,
        highlightedText: highlightedTitle,
        context: 'Title',
        searchTerm: query
      })
    }
    
    // Search in content - get actual character positions
    let searchIndex = 0
    let match
    const lowerText = text.toLowerCase()
    
    while ((match = lowerText.indexOf(searchTerm, searchIndex)) !== -1) {
      // Get context around the match
      const start = Math.max(0, match - 50)
      const end = Math.min(text.length, match + searchTerm.length + 50)
      const context = text.substring(start, end)
      const highlightedText = highlightText(context, searchTerm)
      
      // Extract the sentence containing this match
      const sentenceStart = text.lastIndexOf('.', match)
      const sentenceEnd = text.indexOf('.', match)
      const sentence = text.substring(
        sentenceStart === -1 ? 0 : sentenceStart + 1,
        sentenceEnd === -1 ? text.length : sentenceEnd
      ).trim()
      
      results.push({
        tabIndex,
        tabTitle: title,
        tabColor: tab.color,
        position: match,
        from: match,
        to: match + searchTerm.length,
        text: sentence || context,
        highlightedText,
        context: sentence ? getContextFromPosition(text, match) : 'Content',
        searchTerm: query
      })
      
      searchIndex = match + 1
      
      // Limit matches per tab to avoid too many results
      if (results.filter(r => r.tabIndex === tabIndex).length >= 5) break
    }
  })
  
  searchResults.value = results.slice(0, 20) // Limit total results
  selectedIndex.value = 0
}

// Highlight search terms in text
const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600/50 px-1 py-0.5 rounded">$1</mark>')
}

// Escape regex special characters
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Get context around a sentence
const getContext = (sentences: string[], index: number): string => {
  const start = Math.max(0, index - 1)
  const end = Math.min(sentences.length, index + 2)
  return sentences.slice(start, end).join('. ')
}

// Get context description from text position
const getContextFromPosition = (text: string, position: number): string => {
  // Find the paragraph or heading that contains this position
  const textBefore = text.substring(0, position)
  const lines = textBefore.split('\n')
  
  // Look for headings (lines starting with #)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line.startsWith('#')) {
      return line.replace(/#+\s*/, '').trim() || 'Content'
    }
  }
  
  // If no heading found, return a generic context
  const sentences = textBefore.split(/[.!?]+/)
  const lastSentence = sentences[sentences.length - 2] || sentences[sentences.length - 1]
  return lastSentence?.trim().substring(0, 30) + '...' || 'Content'
}

// Get filtered results (combines search results and quick actions)
const filteredResults = computed(() => {
  if (searchQuery.value.trim()) {
    return searchResults.value
  }
  return []
})

// Get tab color class
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

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  const items = searchQuery.value.trim() ? filteredResults.value : quickActions.value
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % items.length
      break
    
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = selectedIndex.value === 0 ? items.length - 1 : selectedIndex.value - 1
      break
    
    case 'Enter':
      event.preventDefault()
      if (searchQuery.value.trim()) {
        const result = filteredResults.value[selectedIndex.value]
        if (result) {
          selectResult(result)
        }
      } else {
        const action = quickActions.value[selectedIndex.value]
        if (action) {
          executeAction(action)
        }
      }
      break
    
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// Select a search result
const selectResult = (result: SearchResult) => {
  emit('selectResult', result)
  emit('close')
}

// Execute a quick action
const executeAction = (action: QuickAction) => {
  action.action()
}

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Handle global escape key
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  clearTimeout(searchTimeout.value)
})
</script>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.75rem;
}

:deep(mark) {
  @apply bg-yellow-200 dark:bg-yellow-600/50 px-1 py-0.5 rounded;
}
</style>
