<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { computed, ref } from "vue";

const fonts = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
];

const align = [
  { label: "Left", value: "left", icon: "tabler:align-left" },
  { label: "Center", value: "center", icon: "tabler:align-center" },
  { label: "Right", value: "right", icon: "tabler:align-right" },
  { label: "Justify", value: "justify", icon: "tabler:align-justified" },
];

const currentFont = ref(fonts[0]);
const currentAlign = ref(align[0]);
const color = ref("#00C16A");

const chip = computed(() => ({ backgroundColor: color.value }));
</script>
<template>
  <UDrawer
    should-scale-background
    set-background-color-on-scale
    :ui="{
      content: 'light:bg-neutral-100!',
    }"
  >
    <ButtonWithTooltip text="Customize" :icon="ICONS.style" />

    <template #content>
      <div class="p-4 flex gap-2.5">
        <UInputMenu
          v-model="currentFont"
          label-key="label"
          :items="fonts"
          :autofocus="false"
          class="max-w-40!"
        />

        <UPopover>
          <UButton
            label="Choose color"
            color="neutral"
            variant="outline"
            :ui="{
              base: 'max-w-40!',
            }"
          >
            <template #leading>
              <span :style="chip" class="size-2.5 rounded-full" />
            </template>
          </UButton>

          <template #content>
            <UColorPicker v-model="color" class="p-2" />
          </template>
        </UPopover>

        <UInputMenu
          v-model="currentAlign"
          label-key="label"
          :icon="currentAlign.icon"
          :items="align"
          :autofocus="false"
          class="max-w-40!"
        />
      </div>
    </template>
  </UDrawer>
</template>
