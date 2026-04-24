<script setup lang="ts">
import type { NodeViewProps } from "@tiptap/vue-3";
import { NodeViewWrapper } from "@tiptap/vue-3";
import { ref, watch } from "vue";

const props = defineProps<NodeViewProps>();

const file = ref<File | null>(null);
const loading = ref(false);

watch(file, async (newFile) => {
  if (!newFile) return;

  loading.value = true;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string;
    if (!dataUrl) {
      loading.value = false;
      return;
    }

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const pos = props.getPos();
    if (typeof pos !== "number") {
      loading.value = false;
      return;
    }

    props.editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + 1 })
      .setImage({ src: dataUrl })
      .run();

    loading.value = false;
  };
  reader.readAsDataURL(newFile);
});
</script>

<template>
  <NodeViewWrapper>
    <UFileUpload
      v-model="file"
      accept="image/*"
      :ui="{
        base: 'dark:bg-neutral-800/30 dark:hover:bg-neutral-800/60',
      }"
      :preview="false"
      class="min-h-20"
    >
      <template #leading>
        <UAvatar
          :icon="loading ? 'tabler:loader-2' : 'tabler:photo-plus'"
          size="2xl"
          :ui="{
            root: 'bg-transparent',
            icon: [loading && 'animate-spin'],
          }"
        />
      </template>
    </UFileUpload>
  </NodeViewWrapper>
</template>
