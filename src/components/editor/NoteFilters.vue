<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useStorage } from "@vueuse/core";

type SortOrder = "asc" | "desc";

const props = withDefaults(
  defineProps<{
    sortOrder: SortOrder;
    dateRange: any;
    storageKey?: string;
  }>(),
  {
    storageKey: "fylepad-zen.note-sort-order",
  },
);

const emit = defineEmits<{
  (event: "update:sortOrder", value: SortOrder): void;
  (event: "update:dateRange", value: any): void;
}>();

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const storedSortOrder = useStorage<SortOrder>(props.storageKey, "asc");

const sortOptions = [
  { label: "Oldest first", value: "asc" },
  { label: "Newest first", value: "desc" },
];

function toDate(value: unknown) {
  const candidate = value as { toDate?: (timeZone: string) => Date } | Date | undefined;
  return candidate instanceof Date
    ? new Date(candidate)
    : new Date(candidate?.toDate?.(localTimeZone) || 0);
}

function formatRangeDate(value: unknown) {
  const date = toDate(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const sortOrderProxy = computed<SortOrder>({
  get: () => props.sortOrder,
  set: (value) => {
    emit("update:sortOrder", value);
    storedSortOrder.value = value;
  },
});

const dateRangeProxy = computed({
  get: () => props.dateRange,
  set: (value) => emit("update:dateRange", value),
});

const hasDateFilter = computed(() => !!props.dateRange?.start && !!props.dateRange?.end);

const dateFilterLabel = computed(() => {
  const range = props.dateRange;
  if (!range?.start && !range?.end) return "Any date";
  if (range.start && !range.end) {
    return `${formatRangeDate(range.start)} - ...`;
  }

  if (!range.start || !range.end) return "Any date";

  const startLabel = formatRangeDate(range.start);
  const endLabel = formatRangeDate(range.end);

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
});

function resetDateFilter() {
  emit("update:dateRange", null);
}

onMounted(() => {
  if (storedSortOrder.value !== props.sortOrder) {
    emit("update:sortOrder", storedSortOrder.value);
  }
});

watch(
  () => props.sortOrder,
  (value) => {
    storedSortOrder.value = value;
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 mb-4">
    <USelect
      v-model="sortOrderProxy"
      :items="sortOptions"
      value-key="value"
      label-key="label"
      size="md"
      color="neutral"
      variant="soft"
      arrow
      icon="ph:sort-ascending-duotone"
      :ui="{
        base: 'bg-neutral-100 text-[15.5px]! dark:bg-neutral-800',
        itemTrailingIcon: 'size-4.5',
        trailingIcon: 'size-5',
        content:
          'ring-1 ring-neutral-300 dark:ring-neutral-600 bg-neutral-100 dark:bg-neutral-800!',
        arrow:
          'fill-neutral-100! dark:fill-neutral-800! dark:stroke-neutral-600! stroke-neutral-300!',
      }"
    />
    <UPopover
      arrow
      :ui="{
        content: 'bg-neutral-100 dark:bg-neutral-800!',
        arrow: 'fill-neutral-100! dark:fill-neutral-800!',
      }"
    >
      <UButton
        :icon="'ph:calendar-duotone'"
        size="md"
        variant="soft"
        color="neutral"
        class="text-[15.5px]! font-normal"
        :label="dateFilterLabel"
      />
      <template #content>
        <div class="p-2">
          <UCalendar
            v-model="dateRangeProxy"
            range
            color="warning"
            variant="soft"
            size="xs"
            :ui="{
              root: 'dark:bg-neutral-800 bg-neutral-100',
            }"
          />
          <div class="flex items-center justify-end gap-2 pt-2">
            <UButton
              v-if="hasDateFilter"
              label="Clear"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="resetDateFilter"
            />
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
