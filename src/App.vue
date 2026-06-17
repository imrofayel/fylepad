<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { onBeforeUnmount, onMounted } from "vue";
import { useColorMode } from "@vueuse/core";
import SEO from "./lib/seo";

const colorMode = useColorMode();

function handleThemeShortcut(event: KeyboardEvent) {
  if (!event.ctrlKey || event.metaKey) return;

  const key = event.key.toLowerCase();

  if (key === "d") {
    event.preventDefault();
    colorMode.value = "dark";
  }

  if (key === "l") {
    event.preventDefault();
    colorMode.value = "light";
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleThemeShortcut, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleThemeShortcut, true);
});

useHead(SEO);
</script>

<template>
  <UApp
    :tooltip="{
      content: {
        side: 'top',
        sideOffset: 0,
      },
      delayDuration: 30,
    }"
    :toaster="{
      position: 'top-right',
    }"
  >
    <div class="min-h-screen bg-default" data-vaul-drawer-wrapper>
      <RouterView />
    </div>
  </UApp>
</template>
