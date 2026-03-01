<template>
  <div
    ref="menuRef"
    class="tab-link-menu bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-64"
  >
    <div v-if="filteredItems?.length === 0" class="p-3 text-sm text-zinc-500 dark:text-zinc-400">
      No tabs found
    </div>
    <div
      v-for="(item, index) in filteredItems"
      :key="item.id"
      :class="[
        'flex items-center px-3 py-2 cursor-pointer transition-colors',
        'hover:bg-zinc-100 dark:hover:bg-zinc-700',
        index === selectedIndex && 'bg-zinc-100 dark:bg-zinc-700'
      ]"
      @click="selectItem(item)"
      @mouseenter="selectedIndex = index"
    >
      <!-- Tab color indicator -->
      <div
        v-if="item.color"
        :style="{ backgroundColor: item.color }"
        class="w-3 h-3 rounded-full mr-3 flex-shrink-0"
      />
      <div v-else class="w-3 h-3 rounded-full mr-3 flex-shrink-0 bg-zinc-300 dark:bg-zinc-600" />

      <!-- Tab details -->
      <div class="flex-1 min-w-0">
        <div class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
          {{ item.name }}
        </div>
        <div v-if="item.group" class="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {{ item.group }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { TabLinkItem } from '../extensions/tab-link';

interface Props {
  items: TabLinkItem[];
  query: string;
  onSelect: (item: TabLinkItem) => void;
}

const props = defineProps<Props>();

const menuRef = ref<HTMLElement>();
const selectedIndex = ref(0);

const filteredItems = computed(() => {
  if (!props.query) {
    return props.items;
  }

  const query = props.query.toLowerCase();
  return props.items.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.group?.toLowerCase().includes(query)
  );
});

const selectItem = (item: TabLinkItem) => {
  props.onSelect(item);
};

const selectCurrentItem = () => {
  const item = filteredItems.value[selectedIndex.value];
  if (item) {
    selectItem(item);
  }
};

const nextItem = () => {
  selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value?.length - 1);
  scrollToSelected();
};

const previousItem = () => {
  selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  scrollToSelected();
};

const scrollToSelected = () => {
  const menu = menuRef.value;
  if (!menu) return;

  const selectedElement = menu.children[selectedIndex.value + (filteredItems.value?.length === 0 ? 0 : 1)];
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: 'nearest' });
  }
};

// Reset selection when items change
watch(() => filteredItems.value, () => {
  selectedIndex.value = 0;
});

// Expose methods to parent
defineExpose({
  selectCurrentItem,
  nextItem,
  previousItem,
});

onMounted(() => {
  // Auto-select first item if available
  if (filteredItems.value.length > 0) {
    selectedIndex.value = 0;
  }
});
</script>

<style scoped>
.tab-link-menu {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
</style>
