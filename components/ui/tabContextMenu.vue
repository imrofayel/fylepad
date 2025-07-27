<template>
  <div
    v-if="visible"
    ref="popoverRef"
    class="fixed z-50 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-[250px]"
    :style="popoverStyle"
  >
    <div class="space-y-3">
      <!-- Color Selection -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tab Color</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in tabColors"
            :key="color.name"
            @click="selectColor(color)"
            class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            :class="[
              color.bg,
              selectedColor?.name === color.name ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300 dark:border-gray-500'
            ]"
            :title="color.name"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <button
          @click="moveTabLeft"
          :disabled="tabIndex === 0"
          class="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-[#404040] text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-[#505050] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Move Left
        </button>
        <button
          @click="moveTabRight"
          :disabled="isLastTab"
          class="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-[#404040] text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-[#505050] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Move Right →
        </button>
      </div>
      
      <div class="flex gap-2 pt-2">
        <button
          @click="duplicateTab"
          class="flex-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
        >
          Duplicate
        </button>
        <button
          @click="closeTab"
          class="flex-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { computePosition, autoUpdate, offset, flip, shift } from '@floating-ui/vue'

interface TabColor {
  name: string
  bg: string
  activeStyles: string
}

interface Props {
  visible: boolean
  targetElement?: HTMLElement | null
  tabIndex: number
  tabColor?: string
  totalTabs: number
}

interface Emits {
  (e: 'close'): void
  (e: 'colorChanged', tabIndex: number, color: TabColor): void
  (e: 'duplicateTab', tabIndex: number): void
  (e: 'closeTab', tabIndex: number): void
  (e: 'moveTab', tabIndex: number, direction: 'left' | 'right'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  targetElement: null,
  tabColor: '',
  totalTabs: 1
})

const emit = defineEmits<Emits>()

const popoverRef = ref<HTMLElement>()
const popoverStyle = ref<Record<string, string>>({})

const tabColors: TabColor[] = [
  { name: 'Default', bg: 'bg-gray-300 dark:bg-gray-600', activeStyles: '!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d]' },
  { name: 'Blue', bg: 'bg-blue-400', activeStyles: '!bg-blue-500 dark:!bg-blue-600 !border-blue-600 dark:!border-blue-500' },
  { name: 'Red', bg: 'bg-red-400', activeStyles: '!bg-red-500 dark:!bg-red-600 !border-red-600 dark:!border-red-500' },
  { name: 'Purple', bg: 'bg-purple-400', activeStyles: '!bg-purple-500 dark:!bg-purple-600 !border-purple-600 dark:!border-purple-500' },
  { name: 'Orange', bg: 'bg-orange-400', activeStyles: '!bg-orange-500 dark:!bg-orange-600 !border-orange-600 dark:!border-orange-500' },
  { name: 'Pink', bg: 'bg-pink-400', activeStyles: '!bg-pink-500 dark:!bg-pink-600 !border-pink-600 dark:!border-pink-500' },
  { name: 'Teal', bg: 'bg-teal-400', activeStyles: '!bg-teal-500 dark:!bg-teal-600 !border-teal-600 dark:!border-teal-500' },
  { name: 'Yellow', bg: 'bg-yellow-400', activeStyles: '!bg-yellow-500 dark:!bg-yellow-600 !border-yellow-600 dark:!border-yellow-500' },
]

const selectedColor = computed(() => 
  tabColors.find(color => color.name === props.tabColor) || tabColors[0]
)

const isLastTab = computed(() => props.tabIndex >= props.totalTabs - 1)

const updatePosition = async () => {
  if (!popoverRef.value || !props.targetElement) return

  const { x, y } = await computePosition(props.targetElement, popoverRef.value, {
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 })
    ]
  })

  popoverStyle.value = {
    left: `${x}px`,
    top: `${y}px`
  }
}

watch(() => props.visible, async (visible) => {
  if (visible) {
    await nextTick()
    updatePosition()
  }
})

watch(() => props.targetElement, updatePosition)

const selectColor = (color: TabColor) => {
  emit('colorChanged', props.tabIndex, color)
}

const duplicateTab = () => {
  emit('duplicateTab', props.tabIndex)
  emit('close')
}

const closeTab = () => {
  emit('closeTab', props.tabIndex)
  emit('close')
}

const moveTabLeft = () => {
  emit('moveTab', props.tabIndex, 'left')
  emit('close')
}

const moveTabRight = () => {
  emit('moveTab', props.tabIndex, 'right')
  emit('close')
}

// Close popover when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
