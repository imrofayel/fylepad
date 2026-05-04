<script setup lang="ts">
import { useHead } from "@vueuse/head";
import SEO from "./lib/seo";
import { useAuth } from "@/composables/useAuth";
import { onMounted } from "vue";

useHead(SEO);

const { fetchUser } = useAuth();

onMounted(() => {
  fetchUser();
});
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
  >
    <div class="bg-default" data-vaul-drawer-wrapper>
      <RouterView />
    </div>
  </UApp>
</template>
