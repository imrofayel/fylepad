<template>
  <div
    v-if="visible"
    ref="popoverRef"
    class="fixed z-50 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-600 rounded-2xl drop-shadow-xs p-3 min-w-[250px]"
    :style="popoverStyle"
  >
    <div class="space-y-3">
      <!-- Color Selection -->
      <div>
        <div class="flex items-center flex-wrap gap-2">
          <button
            v-for="color in tabColors"
            :key="color.name"
            @click="selectColor(color)"
            class="w-5 h-5 rounded-[10px] transition-transform hover:scale-110"
            :class="[
              color.bg,
              selectedColor.name === color.name && 'border-2 border-black/10 dark:border-white/50',
            ]"
            :title="color.name"
          />
        </div>
      </div>
      
      <div class="flex relative right-3 top-1.5">
        <button
          @click="duplicateTab"
          class="flex gap-1 border border-gray-200 bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool tab-item relative transition-all duration-200 scale-90 max-w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="m12.442 14.553l-2.306 2.7C9.14 18.418 8.644 19 8 19s-1.141-.582-2.136-1.747l-2.306-2.7C2.52 13.337 2 12.728 2 12s.52-1.337 1.558-2.553l2.306-2.7C6.86 5.582 7.356 5 8 5s1.141.582 2.136 1.747l2.306 2.7C13.48 10.663 14 11.272 14 12s-.52 1.337-1.558 2.553"/><path d="m13 19l3.512-4.397C17.504 13.361 18 12.74 18 12s-.496-1.361-1.488-2.603L13 5"/><path d="m17 19l3.512-4.397C21.504 13.361 22 12.74 22 12s-.496-1.361-1.488-2.603L17 5"/></g></svg>Duplicate
        </button>

                <button
          @click="lockTab"
          class="flex gap-1 border border-gray-200 bg-white/80 text-black !px-[9px] py-[3px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool tab-item relative transition-all duration-200 right-1 scale-90 max-w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.998 2C8.99 2 7.04 4.019 4.734 4.755c-.938.3-1.407.449-1.597.66c-.19.21-.245.519-.356 1.135c-1.19 6.596 1.41 12.694 7.61 15.068c.665.255.998.382 1.61.382s.946-.128 1.612-.383c6.199-2.373 8.796-8.471 7.606-15.067c-.111-.616-.167-.925-.357-1.136s-.658-.36-1.596-.659C16.959 4.019 15.006 2 11.998 2M12 7v2" color="currentColor"/></svg>{{ status ? 'Locked' : 'Lock' }}
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
  status: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'colorChanged', tabIndex: number, color: TabColor): void
  (e: 'duplicateTab', tabIndex: number): void
  (e: 'lockTab', tabIndex: number): void
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
  { name: 'Default', bg: '!bg-[#24d86c] dark:!bg-[#0c843c]', activeStyles: '!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d]' },
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

const lockTab = () => {
  emit('lockTab', props.tabIndex)
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
