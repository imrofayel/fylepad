<script setup lang="ts">
import EmojiPicker from "vue3-emoji-picker";
import { useColorMode } from "@vueuse/core";
import { computed } from "vue";
import { ICONS } from "@/lib/constants/icons";
import { useEditor } from "@/composables/useEditor";

interface EmojiSelectPayload {
  i?: string;
  n?: string[];
  r?: string;
  t?: string;
  u?: string;
}

const { activeEditor } = useEditor();

const onSelect = (emoji: EmojiSelectPayload) => {
  activeEditor.value?.commands.insertContent(emoji.i || "");
};

const colorMode = useColorMode();

const emojiTheme = computed(() => (colorMode.value === "dark" ? "dark" : "light"));
</script>

<template>
  <UPopover arrow>
    <ButtonWithTooltip text="Emoji" :icon="ICONS.emoji" />
    <template #content>
      <EmojiPicker :native="true" :theme="emojiTheme" :display-recent="true" @select="onSelect" />
    </template>
  </UPopover>
</template>
