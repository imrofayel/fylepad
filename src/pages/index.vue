<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useEditor } from "@/composables/useEditor";

const EditorBlock = defineAsyncComponent(() => import("@/components/editor/block.vue"));
const { activeTabId, tabs } = useEditor();
</script>

<template>
  <div class="mx-auto min-h-screen w-full z-100 sm:px-3 pt-2">
    <AppHeader />
    <Suspense>
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
