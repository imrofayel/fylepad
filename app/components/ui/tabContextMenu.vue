<template>
  <div
    v-if="visible"
    ref="popoverRef"
    class="drop-shadow-cool fixed z-50 min-w-[250px] rounded-2xl border border-gray-200 bg-white/90 p-3 drop-shadow-xs backdrop-blur-2xl dark:border-[#525252] dark:bg-[#2a2a2a]"
    :style="popoverStyle"
  >
    <div class="space-y-3">
      <!-- Color Selection -->
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="color in tabColors"
            :key="color.name"
            class="h-5 w-5 rounded-[10px] transition-transform hover:scale-110"
            :class="[
              color.bg,
              selectedColor.name === color.name && 'border-2 border-black/10 dark:border-white/50',
            ]"
            :title="color.name"
            @click="selectColor(color)"
          />
        </div>
      </div>

      <div class="relative top-1.5 right-3 flex">
        <button
          class="drop-shadow-cool tab-item relative flex max-w-fit scale-90 cursor-pointer items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white/90 !px-[9px] py-[3px] text-black transition-all duration-200 dark:border-[#525252] dark:bg-[#404040] dark:text-gray-50"
          @click="duplicateTab"
        >
          <svg
            aria-hidden="true"
            role="graphics-symbol"
            viewBox="0 0 20 20"
            class="duplicate"
            fill="currentColor"
            style="width: 22px; display: block; flex-shrink: 0"
          >
            <path
              d="M4.5 2.375A2.125 2.125 0 0 0 2.375 4.5V12c0 1.174.951 2.125 2.125 2.125h1.625v1.625c0 1.174.951 2.125 2.125 2.125h7.5a2.125 2.125 0 0 0 2.125-2.125v-7.5a2.125 2.125 0 0 0-2.125-2.125h-1.625V4.5A2.125 2.125 0 0 0 12 2.375zm8.375 3.75H8.25A2.125 2.125 0 0 0 6.125 8.25v4.625H4.5A.875.875 0 0 1 3.625 12V4.5c0-.483.392-.875.875-.875H12c.483 0 .875.392.875.875zm-5.5 2.125c0-.483.392-.875.875-.875h7.5c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-7.5a.875.875 0 0 1-.875-.875z"
            /></svg
          >Duplicate
        </button>

        <button
          class="drop-shadow-cool tab-item relative right-1 flex max-w-fit scale-90 cursor-pointer items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white/90 !px-[9px] py-[3px] text-black transition-all duration-200 dark:border-[#525252] dark:bg-[#404040] dark:text-gray-50"
          @click="lockTab"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 23px; stroke: currentColor; fill: none"
          >
            <rect x="4.5" y="8" width="11" height="9" rx="2" stroke-width="1.25" />
            <circle cx="10" cy="11.5" r="0.5" stroke-width="1.25" />
            <path d="M10 14V11.5" stroke-width="1.25" stroke-linecap="round" />
            <path
              class=""
              d="M19 6V4C19 2.34315 17.6569 1 16 1V1C14.3431 1 13 2.34315 13 4V8"
              stroke-width="1.25"
              stroke-linecap="round"
            /></svg
          >{{ status ? "Locked" : "Lock" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { computePosition, offset, flip, shift } from "@floating-ui/vue";

interface TabColor {
  name: string;
  bg: string;
  activeStyles: string;
}

interface Props {
  visible?: boolean;
  targetElement?: HTMLElement | null;
  tabIndex: number;
  tabColor?: string;
  totalTabs?: number;
  status: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "colorChanged", tabIndex: number, color: TabColor): void;
  (e: "duplicateTab" | "lockTab", tabIndex: number): void;
  (e: "moveTab", tabIndex: number, direction: "left" | "right"): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  targetElement: null,
  tabColor: "",
  totalTabs: 1,
});

const emit = defineEmits<Emits>();

const popoverRef = ref<HTMLElement>();
const popoverStyle = ref<Record<string, string>>({});

const tabColors: TabColor[] = [
  {
    name: "Default",
    bg: "!bg-[#24d86c] dark:!bg-[#0c843c]",
    activeStyles: "!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] !border-[#28c76d]",
  },
  {
    name: "Blue",
    bg: "bg-blue-400",
    activeStyles: "!bg-blue-500 dark:!bg-blue-600 !border-blue-600 dark:!border-blue-500",
  },
  {
    name: "Red",
    bg: "bg-red-400",
    activeStyles: "!bg-red-500 dark:!bg-red-600 !border-red-600 dark:!border-red-500",
  },
  {
    name: "Purple",
    bg: "bg-purple-400",
    activeStyles: "!bg-purple-500 dark:!bg-purple-600 !border-purple-600 dark:!border-purple-500",
  },
  {
    name: "Orange",
    bg: "bg-orange-400",
    activeStyles: "!bg-orange-500 dark:!bg-orange-600 !border-orange-600 dark:!border-orange-500",
  },
  {
    name: "Pink",
    bg: "bg-pink-400",
    activeStyles: "!bg-pink-500 dark:!bg-pink-600 !border-pink-600 dark:!border-pink-500",
  },
  {
    name: "Teal",
    bg: "bg-teal-400",
    activeStyles: "!bg-teal-500 dark:!bg-teal-600 !border-teal-600 dark:!border-teal-500",
  },
  {
    name: "Yellow",
    bg: "bg-yellow-400",
    activeStyles: "!bg-yellow-500 dark:!bg-yellow-600 !border-yellow-600 dark:!border-yellow-500",
  },
];

const selectedColor = computed(
  () => tabColors.find((color) => color.name === props.tabColor) || tabColors[0],
);

const _isLastTab = computed(() => props.tabIndex >= props.totalTabs - 1);

const updatePosition = async () => {
  if (!popoverRef.value || !props.targetElement) return;

  const { x, y } = await computePosition(props.targetElement, popoverRef.value, {
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  popoverStyle.value = {
    left: `${x}px`,
    top: `${y}px`,
  };
};

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      await nextTick();
      updatePosition();
    }
  },
);

watch(() => props.targetElement, updatePosition);

const selectColor = (color: TabColor) => {
  emit("colorChanged", props.tabIndex, color);
};

const duplicateTab = () => {
  emit("duplicateTab", props.tabIndex);
  emit("close");
};

const lockTab = () => {
  emit("lockTab", props.tabIndex);
  emit("close");
};

const _moveTabLeft = () => {
  emit("moveTab", props.tabIndex, "left");
  emit("close");
};

const _moveTabRight = () => {
  emit("moveTab", props.tabIndex, "right");
  emit("close");
};

// Close popover when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    emit("close");
  }
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
  },
);
</script>
