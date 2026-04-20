<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const EditorBlock = defineAsyncComponent(() => import("@/components/editor/block.vue"));
</script>

<template>
  <div class="fixed top-0 left-0 right-0 pointer-events-none z-10">
    <div class="bg-default" style="height: env(safe-area-inset-top)"></div>
    <div class="h-8 bg-linear-to-b from-default to-transparent"></div>
  </div>

  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-2">
    <AppHeader />
    <Suspense>
      <template #default>
        <EditorBlock />
      </template>
    </Suspense>
  </div>
</template>
