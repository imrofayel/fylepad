<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <UTooltip :text="text" arrow>
    <UButton v-bind="$attrs" variant="link" color="neutral" />
  </UTooltip>
</template>
