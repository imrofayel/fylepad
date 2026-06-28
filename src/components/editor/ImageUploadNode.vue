<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import type { NodeViewProps } from "@tiptap/vue-3";
import { NodeViewWrapper } from "@tiptap/vue-3";
import { ref, watch } from "vue";
import { isCloudMode } from "@/lib/editorDb";
import { useToast } from "@nuxt/ui/composables/useToast";

const props = defineProps<NodeViewProps>();

const file = ref<File | null>(null);
const loading = ref(false);
const toast = useToast();

watch(file, async (newFile) => {
  if (!newFile) return;

  loading.value = true;

  if (isCloudMode()) {
    try {
      const formData = new FormData();
      formData.append("photo", newFile);

      const API = import.meta.env.VITE_BACKEND_API;
      const response = await fetch(`${API}/api/uploads/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to upload image");
      }

      const data = await response.json();

      const pos = props.getPos();
      if (typeof pos !== "number") {
        loading.value = false;
        return;
      }

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .setImage({ src: data.asset.url })
        .run();

      loading.value = false;
      return;
    } catch (e: any) {
      toast.add({ title: "Image upload failed", description: e.message, color: "error" });
      loading.value = false;
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string;
    if (!dataUrl) {
      loading.value = false;
      return;
    }

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
        base: 'dark:bg-neutral-800/30 bg-neutral-100! dark:hover:bg-neutral-800/60',
      }"
      :preview="false"
      class="min-h-20"
    >
      <template #leading>
        <UAvatar
          :icon="loading ? ICONS.loader : ICONS.addPhoto"
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
