<script setup lang="ts">
import { useHead } from "@vueuse/head";
import SEO from "./lib/seo";

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
