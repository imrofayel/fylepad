<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { useEditor } from "@/composables/useEditor";
import type { Range as EditorRange } from "@tiptap/core";
import { ICONS } from "@/lib/constants/icons";

const { isSearchOpen, toggleSearch, activeEditor } = useEditor();

const searchAndReplaceStorage = computed(() => {
  return (activeEditor.value?.storage as any)?.searchAndReplace;
});

const searchTerm = ref<string>("");
const replaceTerm = ref<string>("");
const caseSensitive = ref<boolean>(false);

function toggleCase() {
  caseSensitive.value = !caseSensitive.value;
  updateSearchReplace(true);
}

function onSearchEnter(e: KeyboardEvent) {
  e.preventDefault();
  updateSearchReplace();
}

const updateSearchReplace = (clearIndex: boolean = false) => {
  if (!activeEditor.value) return;

  if (clearIndex) activeEditor.value.commands.resetIndex();

  activeEditor.value.commands.setSearchTerm(searchTerm.value);
  activeEditor.value.commands.setReplaceTerm(replaceTerm.value);
  activeEditor.value.commands.setCaseSensitive(caseSensitive.value);
};

const goToSelection = () => {
  if (!activeEditor.value) return;

  const { results, resultIndex } = searchAndReplaceStorage.value || { results: [], resultIndex: 0 };
  const position: EditorRange = results[resultIndex];

  if (!position) return;

  activeEditor.value.commands.setTextSelection(position);

  const { node } = activeEditor.value.view.domAtPos(activeEditor.value.state.selection.anchor);
  node instanceof HTMLElement && node.scrollIntoView({ behavior: "smooth", block: "center" });
};

watch(
  () => searchTerm.value.trim(),
  (val, oldVal) => {
    if (!val) clear();
    if (val !== oldVal) updateSearchReplace(true);
  },
);

watch(
  () => replaceTerm.value.trim(),
  (val, oldVal) => (val === oldVal ? null : updateSearchReplace()),
);

watch(
  () => caseSensitive.value,
  (val, oldVal) => (val === oldVal ? null : updateSearchReplace(true)),
);

watch(
  () => isSearchOpen.value,
  (isOpen) => {
    if (!isOpen) {
      clear();
    }
  },
);

const replace = () => {
  activeEditor.value?.commands.replace();
  goToSelection();
};

const next = () => {
  activeEditor.value?.commands.nextSearchResult();
  goToSelection();
};

const previous = () => {
  activeEditor.value?.commands.previousSearchResult();
  goToSelection();
};

const clear = () => {
  searchTerm.value = "";
  replaceTerm.value = "";
  activeEditor.value?.commands.resetIndex();
  activeEditor.value?.commands.setSearchTerm("");
};

const replaceAll = () => activeEditor.value?.commands.replaceAll();
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <div class="flex items-center justify-between gap-2 px-1">
      <input
        v-model="searchTerm"
        @keydown.enter.prevent="onSearchEnter"
        type="text"
        placeholder="Search..."
        autofocus
        class="placeholder:text-gray-400 dark:placeholder:text-neutral-500 bg-transparent outline-none w-48 text-[14.5px] px-1"
      />

      <div class="flex items-center gap-0.5">
        <span class="text-sm text-neutral-400 mr-2 min-w-[30px] text-right tabular-nums">
          {{
            searchAndReplaceStorage?.results?.length > 0
              ? searchAndReplaceStorage?.resultIndex + 1
              : 0
          }}
          / {{ searchAndReplaceStorage?.results?.length || 0 }}
        </span>
        <ButtonWithTooltip
          text="Case Sensitive"
          @click="toggleCase"
          class="px-1 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          :class="caseSensitive ? 'text-default' : 'text-neutral-400'"
          :icon="ICONS.font"
        />
        <ButtonWithTooltip
          text="Previous"
          @click="previous"
          class="text-neutral-400"
          :icon="ICONS.arrowLeftCircle"
        />
        <ButtonWithTooltip
          text="Next"
          @click="next"
          class="text-neutral-400"
          :icon="ICONS.arrowRightCircle"
        />
      </div>
    </div>

    <div
      class="flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-700 py-0.5 px-2"
    >
      <input
        v-model="replaceTerm"
        @keydown.enter.prevent="replace"
        type="text"
        placeholder="Replace..."
        class="placeholder:text-gray-400 dark:placeholder:text-neutral-500 bg-transparent outline-none w-32 text-[14.5px] py-0.5"
      />
      <div class="flex gap-1 ml-auto">
        <ButtonWithTooltip
          text="Replace"
          @click="replace"
          class="text-neutral-400"
          :icon="ICONS.arrowDownCirlce"
        />
        <ButtonWithTooltip
          text="Replace All"
          @click="replaceAll"
          class="text-neutral-400"
          :icon="ICONS.replaceAll"
        />
      </div>
    </div>
  </div>
</template>
