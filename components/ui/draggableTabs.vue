<template>
  <div class="tab-reorder-container">
    <div 
      v-for="(tab, index) in tabs" 
      :key="`tab-${index}`"
      :draggable="!tab.group"
      @dragstart="handleDragStart($event, index)"
      @dragover.prevent
      @dragenter.prevent
      @drop="handleDrop($event, index)"
      @dragend="handleDragEnd"
      class="tab-item"
      :class="{
        'dragging': draggedIndex === index,
        'drag-over': dragOverIndex === index && draggedIndex !== index
      }"
    >
      <slot :tab="tab" :index="index" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  title: string
  content: any
  color?: string
  group?: string
}

interface Props {
  tabs: Tab[]
}

interface Emits {
  (e: 'reorder', oldIndex: number, newIndex: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const handleDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== dropIndex) {
    emit('reorder', draggedIndex.value, dropIndex)
  }
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<style scoped>
.tab-item.dragging {
  opacity: 0.5;
}

.tab-item.drag-over {
  border-left: 2px solid #3b82f6;
}
</style>
