<template>
  <div
    ref="menuRef"
    class="tab-link-menu max-h-64 min-w-64 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
  >
    <div v-if="filteredItems.length === 0" class="p-3 text-sm text-zinc-500 dark:text-zinc-400">
      No tabs found
    </div>
    <div
      v-for="(item, index) in filteredItems"
      :key="item.id"
      :class="[
        'flex cursor-pointer items-center px-3 py-2 transition-colors',
        'hover:bg-zinc-100 dark:hover:bg-zinc-700',
        index === selectedIndex && 'bg-zinc-100 dark:bg-zinc-700',
      ]"
      @click="selectItem(item)"
      @mouseenter="selectedIndex = index"
    >
      <!-- Tab color indicator -->
      <div
        v-if="item.color"
        :style="{ backgroundColor: item.color }"
        class="mr-3 h-3 w-3 shrink-0 rounded-full"
      />
      <div v-else class="mr-3 h-3 w-3 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />

      <!-- Tab details -->
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {{ item.name }}
        </div>
        <div v-if="item.group" class="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {{ item.group }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TabLinkItem } from "../extensions/tab-link";

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
  return props.items.filter(
    (item) => item.name.toLowerCase().includes(query) || item.group?.toLowerCase().includes(query),
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
  selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1);
  scrollToSelected();
};

const previousItem = () => {
  selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  scrollToSelected();
};

const scrollToSelected = () => {
  const menu = menuRef.value;
  if (!menu) return;

  const selectedElement =
    menu.children[selectedIndex.value + (filteredItems.value.length === 0 ? 0 : 1)];
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: "nearest" });
  }
};

// Reset selection when items change
watch(
  () => filteredItems.value,
  () => {
    selectedIndex.value = 0;
  },
);

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
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
</style>
