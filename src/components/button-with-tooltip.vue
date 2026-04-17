<script setup lang="ts">
const props = defineProps<{
  text: string;
}>();
</script>

<template>
  <UTooltip :text="text" arrow>
    <UButton v-bind="$attrs" variant="link" color="neutral" />
  </UTooltip>
</template>
