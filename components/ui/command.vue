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
        class="fixed inset-0"
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
        <div class="relative bg-white/90 dark:bg-[#404040]/90 border border-[#c6c6c4] dark:border-[#525252] backdrop-blur-lg  rounded-2xl shadow-notion overflow-hidden">
          <div
            class="absolute -right-[4px] -top-2 z-10 bg-[#fd5050] hover:bg-[#f21616] border-[#cf1515] border w-5 h-5 flex items-center justify-center text-lg text-white rounded-full cursor-pointer"
            @click="emit('close')">&times;</div>
          <div class="flex items-center pl-3 pr-2 py-2 ">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Type to find across tabs"
              class="flex-1 bg-transparent outline-none placeholder-[#32302c] dark:placeholder-gray-300 !text-[#32302c] dark:!text-gray-50 placeholder:antialiased antialiased font-normal text-[18px]"
              @keydown="handleKeyDown"
            />
            <div class="shadow-notion text-[18px] p-0.5 rounded-xl px-1.5 !text-[#32302c] dark:!text-gray-50">
              {{ String(filteredResults.length).padStart(2, '0') }}
            </div>
          </div>

          <!-- Results -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loading" class="p-4 text-center text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" class="mx-auto" viewBox="0 0 24 24"><path fill="currentColor" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg>
            </div>

            <div v-else-if="searchQuery && filteredResults.length === 0" class="p-4 pt-3 text-center text-[#32302c] dark:text-gray-50 text-lg">
              No results found
            </div>

            <div v-else-if="!searchQuery" class="p-2">
              <div class="space-y-1">
                <div
                  v-for="(action) in quickActions"
                  :key="action.id"
                  :class="[
                    'flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors',
                    
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
                    <div class="mb-0.5">{{ action.title }}</div>
                    <div class="text-[16px] ">{{ action.description }}</div>
                  </div>
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
                  'flex items-start m-2 px-4 py-3 cursor-pointer last:border-b-0 transition-colors',
                  selectedIndex === index && ''
                ]"
                @click="selectResult(result)"
              >
                <!-- Tab indicator -->
                <div class="flex items-center mr-3 mt-1">
<svg aria-hidden="true" :class="selectedIndex === index && '!fill-[#24d86c]'" role="graphics-symbol" viewBox="0 0 16 16" class="page" style="width: 23px; display: block; fill: rgba(71, 70, 68, 0.6); flex-shrink: 0;"><path d="M4.35645 15.4678H11.6367C13.0996 15.4678 13.8584 14.6953 13.8584 13.2256V7.02539C13.8584 6.0752 13.7354 5.6377 13.1406 5.03613L9.55176 1.38574C8.97754 0.804688 8.50586 0.667969 7.65137 0.667969H4.35645C2.89355 0.667969 2.13477 1.44043 2.13477 2.91016V13.2256C2.13477 14.7021 2.89355 15.4678 4.35645 15.4678ZM4.46582 14.1279C3.80273 14.1279 3.47461 13.7793 3.47461 13.1436V2.99219C3.47461 2.36328 3.80273 2.00781 4.46582 2.00781H7.37793V5.75391C7.37793 6.73145 7.86328 7.20312 8.83398 7.20312H12.5186V13.1436C12.5186 13.7793 12.1836 14.1279 11.5205 14.1279H4.46582ZM8.95703 6.02734C8.67676 6.02734 8.56055 5.9043 8.56055 5.62402V2.19238L12.334 6.02734H8.95703ZM10.4336 9.00098H5.42969C5.16992 9.00098 4.98535 9.19238 4.98535 9.43164C4.98535 9.67773 5.16992 9.86914 5.42969 9.86914H10.4336C10.6797 9.86914 10.8643 9.67773 10.8643 9.43164C10.8643 9.19238 10.6797 9.00098 10.4336 9.00098ZM10.4336 11.2979H5.42969C5.16992 11.2979 4.98535 11.4893 4.98535 11.7354C4.98535 11.9746 5.16992 12.1592 5.42969 12.1592H10.4336C10.6797 12.1592 10.8643 11.9746 10.8643 11.7354C10.8643 11.4893 10.6797 11.2979 10.4336 11.2979Z"></path></svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-base font-medium text-[#32302c] dark:text-gray-50 mb-1 truncate">
                    {{ result.tabTitle || 'Untitled' }}
                  </div>
                  <div 
                    class="text-[15px] text-[#6f6e6b] dark:text-gray-300 leading-relaxed"
                    v-html="result.highlightedText"
                  />
                </div>

                                  <kbd class="px-0.5 py-0.5 dark:text-gray-50" :class="selectedIndex !== index && 'hidden'">
                    <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 16 16" class="enter" style="width: 17px; display: inline; flex-shrink: 0;"><path fill="currentColor" d="M5.38965 14.1667C5.81812 14.1667 6.10156 13.8767 6.10156 13.468C6.10156 13.2571 6.01587 13.0989 5.89062 12.967L4.18994 11.3125L3.02979 10.3369L4.55908 10.4028H12.7922C14.4402 10.4028 15.1389 9.65796 15.1389 8.04297V4.13403C15.1389 2.48608 14.4402 1.78735 12.7922 1.78735H9.13379C8.70532 1.78735 8.4021 2.11035 8.4021 2.50586C8.4021 2.90137 8.69873 3.22437 9.13379 3.22437H12.7593C13.4316 3.22437 13.7151 3.50781 13.7151 4.17358V7.99683C13.7151 8.67578 13.425 8.95923 12.7593 8.95923H4.55908L3.02979 9.03174L4.18994 8.04956L5.89062 6.39502C6.01587 6.26978 6.10156 6.11157 6.10156 5.89404C6.10156 5.48535 5.81812 5.19531 5.38965 5.19531C5.21167 5.19531 5.01392 5.27441 4.8689 5.41943L1.08521 9.1438C0.933594 9.28882 0.854492 9.48657 0.854492 9.68433C0.854492 9.87549 0.933594 10.0732 1.08521 10.2183L4.8689 13.9492C5.01392 14.0876 5.21167 14.1667 5.38965 14.1667Z"></path></svg>
                  </kbd>
              </Motion>
            </div>
          </div>

          <div class="px-2.5 py-2 border-[#c6c6c4] dark:border-[#525252] text-[16.5px] text-[#32302c] dark:text-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                 <span class="flex items-center">
                  <kbd class="px-0.5 py-0.5"><svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" class="arrowUpDown directional-icon" fill="currentColor" style="width: 20px; display: block; flex-shrink: 0;"><path d="M14.075 3.45a.625.625 0 0 0-.884 0l-3.497 3.5a.625.625 0 0 0 .883.884l2.431-2.431v10.705a.625.625 0 0 0 1.25 0V5.402l2.431 2.43a.625.625 0 1 0 .884-.883zM2.427 12.167a.625.625 0 0 1 .884 0l2.43 2.431V3.893a.625.625 0 0 1 1.25 0v10.705l2.431-2.43a.625.625 0 0 1 .884.883L6.81 16.55a.625.625 0 0 1-.884 0l-3.498-3.498a.625.625 0 0 1 0-.884"></path></svg></kbd>
                  <span class="ml-1">to navigate</span>
                </span>
                <span class="flex items-center">
                  <kbd class="px-0.5 py-0.5">
                    <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 16 16" class="enter" fill="currentColor" style="width: 16px; display: inline; flex-shrink: 0;"><path d="M5.38965 14.1667C5.81812 14.1667 6.10156 13.8767 6.10156 13.468C6.10156 13.2571 6.01587 13.0989 5.89062 12.967L4.18994 11.3125L3.02979 10.3369L4.55908 10.4028H12.7922C14.4402 10.4028 15.1389 9.65796 15.1389 8.04297V4.13403C15.1389 2.48608 14.4402 1.78735 12.7922 1.78735H9.13379C8.70532 1.78735 8.4021 2.11035 8.4021 2.50586C8.4021 2.90137 8.69873 3.22437 9.13379 3.22437H12.7593C13.4316 3.22437 13.7151 3.50781 13.7151 4.17358V7.99683C13.7151 8.67578 13.425 8.95923 12.7593 8.95923H4.55908L3.02979 9.03174L4.18994 8.04956L5.89062 6.39502C6.01587 6.26978 6.10156 6.11157 6.10156 5.89404C6.10156 5.48535 5.81812 5.19531 5.38965 5.19531C5.21167 5.19531 5.01392 5.27441 4.8689 5.41943L1.08521 9.1438C0.933594 9.28882 0.854492 9.48657 0.854492 9.68433C0.854492 9.87549 0.933594 10.0732 1.08521 10.2183L4.8689 13.9492C5.01392 14.0876 5.21167 14.1667 5.38965 14.1667Z"></path></svg>
                  </kbd>
                  <span class="ml-1">to select</span>
                </span>
              </div>
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
  // {
  //   id: 'new-tab',
  //   title: 'New Tab',
  //   description: 'Create a new tab',
  //   shortcut: 'Ctrl+N',
  //   icon: 'plus',
  //   action: () => {
  //     emit('newTab')
  //     emit('close')
  //   }
  // },
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
