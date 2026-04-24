<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { FONT_FAMILY_OPTIONS } from "@/lib/constants/fonts";
import { useEditor } from "@/composables/useEditor";
import { computed, ref, watch } from "vue";

const { activeEditor } = useEditor();

const fontFamilyItems = [...FONT_FAMILY_OPTIONS];

const currentFont = ref<(typeof FONT_FAMILY_OPTIONS)[number] | undefined>(FONT_FAMILY_OPTIONS[0]);
const currentFontSize = ref<number>(16);
const currentLineHeight = ref<number>(1.4);

const isDisabled = computed(() => !activeEditor.value?.isEditable);

const clampFontSize = (value: number) => Math.min(30, Math.max(14, Math.round(value)));
const clampLineHeight = (value: number) => Math.min(2, Math.max(0, Math.round(value * 10) / 10));

const readTypographyFromEditor = () => {
  const attrs = activeEditor.value?.getAttributes("textStyle") ?? {};

  const fontFamily =
    typeof attrs.fontFamily === "string" && attrs.fontFamily
      ? attrs.fontFamily.replace(/^['"]|['"]$/g, "")
      : "";
  const rawFontSize = typeof attrs.fontSize === "string" ? Number.parseFloat(attrs.fontSize) : NaN;
  const rawLineHeight =
    typeof attrs.lineHeight === "string" ? Number.parseFloat(attrs.lineHeight) : NaN;

  currentFont.value =
    FONT_FAMILY_OPTIONS.find((option) => option.value === fontFamily) ?? FONT_FAMILY_OPTIONS[0];
  currentFontSize.value = Number.isFinite(rawFontSize) ? clampFontSize(rawFontSize) : 16;
  currentLineHeight.value = Number.isFinite(rawLineHeight) ? clampLineHeight(rawLineHeight) : 1.4;
};

const setFontFamily = (option: (typeof FONT_FAMILY_OPTIONS)[number] | undefined) => {
  const editor = activeEditor.value;
  if (!editor || !editor.isEditable || !option) {
    return;
  }

  editor.chain().focus().setFontFamily(option.value).run();
};

const setFontSize = (value: number | undefined) => {
  const editor = activeEditor.value;
  if (!editor || !editor.isEditable || typeof value !== "number" || Number.isNaN(value)) {
    return;
  }

  const fontSize = `${clampFontSize(value)}px`;
  if (editor.getAttributes("textStyle")?.fontSize === fontSize) {
    return;
  }

  editor.chain().focus().setFontSize(fontSize).run();
};

const setLineHeight = (value: number | undefined) => {
  const editor = activeEditor.value;
  if (!editor || !editor.isEditable || typeof value !== "number" || Number.isNaN(value)) {
    return;
  }

  const lineHeight = clampLineHeight(value).toString();
  if (editor.getAttributes("textStyle")?.lineHeight === lineHeight) {
    return;
  }

  editor.chain().focus().setLineHeight(lineHeight).run();
};

watch(
  activeEditor,
  () => {
    readTypographyFromEditor();
  },
  { immediate: true },
);

watch(currentFont, (value) => {
  setFontFamily(value);
});

watch(currentFontSize, (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return;
  }

  const normalized = clampFontSize(value);
  if (normalized !== value) {
    currentFontSize.value = normalized;
    return;
  }

  setFontSize(normalized);
});

watch(currentLineHeight, (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return;
  }

  const normalized = clampLineHeight(value);
  if (normalized !== value) {
    currentLineHeight.value = normalized;
    return;
  }

  setLineHeight(normalized);
});
</script>
<template>
  <UDrawer
    should-scale-background
    set-background-color-on-scale
    :ui="{
      content: 'light:bg-neutral-100!',
    }"
    :overlay="false"
  >
    <ButtonWithTooltip text="Customize" :icon="ICONS.style" />

    <template #content>
      <div class="px-4 flex items-center gap-1">
        <UIcon name="tabler:typography" class="text-xl" />Typography
      </div>

      <div class="p-4 gap-3 flex">
        <div class="relative flex items-center">
          <UIcon
            name="tabler:brand-foursquare"
            class="absolute left-2 pointer-events-none z-10 text-xl"
          />

          <UInputMenu
            v-model="currentFont"
            :disabled="isDisabled"
            placeholder="Select font"
            label-key="label"
            :items="fontFamilyItems"
            :autofocus="false"
            :ui="{
              base: 'w-40! pl-8!',
            }"
          />
        </div>

        <div class="relative flex items-center">
          <UIcon name="tabler:text-size" class="absolute left-2 pointer-events-none z-10 text-xl" />
          <UInputNumber
            v-model="currentFontSize"
            :disabled="isDisabled"
            :min="14"
            :max="30"
            :step="1"
            orientation="vertical"
            :placeholder="currentFontSize.toString()"
            :ui="{
              base: 'w-25! pl-8!',
            }"
          />
        </div>

        <div class="relative flex items-center">
          <UIcon
            name="tabler:arrow-autofit-height"
            class="absolute left-2 pointer-events-none z-10 text-lg"
          />
          <UInputNumber
            v-model="currentLineHeight"
            :disabled="isDisabled"
            :min="0"
            :max="2"
            :step="0.1"
            orientation="vertical"
            :placeholder="currentLineHeight.toString()"
            :ui="{
              base: 'w-25! pl-8!',
            }"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>
