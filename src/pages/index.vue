<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useEditor } from "@/composables/useEditor";

const EditorBlock = defineAsyncComponent(() => import("@/components/editor/block.vue"));
const { activeTabId, tabs } = useEditor();
</script>

<template>
  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-2 px-2">
    <AppHeader />
    <div v-if="tabs.length === 0" class="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <img src="/favicon.svg" alt="fylepad logo" class="w-16 h-16 mx-auto mb-6" />
    </div>
    <Suspense v-else>
      <template #default>
        <div>
          <div v-for="tab in tabs" :key="tab.id" v-show="tab.id === activeTabId">
            <EditorBlock :tab-id="tab.id" />
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>
