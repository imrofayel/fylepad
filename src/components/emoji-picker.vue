<script setup lang="ts">
import EmojiPicker from "vue3-emoji-picker";
import { useColorMode } from "@vueuse/core";
import { ICONS } from "@/lib/constants/icons";

interface EmojiSelectPayload {
  i?: string;
  n?: string[];
  r?: string;
  t?: string;
  u?: string;
}

const emit = defineEmits<{
  select: [emoji: EmojiSelectPayload];
}>();

const onSelect = (emoji: EmojiSelectPayload) => {
  emit("select", emoji);
};

const { value } = useColorMode();
</script>

<template>
  <UPopover arrow>
    <ButtonWithTooltip text="Emoji" :icon="ICONS.emoji" />
    <template #content>
      <EmojiPicker
        :native="false"
        :theme="value === 'dark' ? 'dark' : 'light'"
        :display-recent="true"
        @select="onSelect"
      />
    </template>
  </UPopover>
</template>
