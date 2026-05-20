<script setup lang="ts">
const model = defineModel<string>({ default: "" });

const emits = defineEmits<{
  (event: "enter"): void;
}>();

const normalizeTabTitle = () => {
  if (!model.value?.trim()) {
    model.value = "Untitled";
  }
};
</script>

<template>
  <UInput
    v-model="model"
    placeholder="Untitled"
    class="w-full"
    :ui="{
      base: 'ring-0 px-0 text-2xl! font-normal tracking-tight shadow-none mt-2.5 mb-2 focus-visible:ring-0!',
    }"
    @keydown.enter.prevent="emits('enter')"
    @blur="normalizeTabTitle"
  />
</template>
