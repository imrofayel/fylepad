<script setup lang="ts">
defineProps<{
  text: string;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
    | undefined;
}>();
</script>

<template>
  <UTooltip :text="text" arrow>
    <UButton v-bind="$attrs" variant="link" :color="color || 'neutral'" />
  </UTooltip>
</template>
