<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
import { useColorMode } from "@vueuse/core";
import { ref } from "vue";

const items = ref([
  { label: "General", value: "general", icon: "tabler:layers-union", slot: "general" },
  { label: "AI", value: "ai", icon: ICONS.ai, slot: "ai" },
]);

const value = useColorMode();
</script>

<template>
  <div class="flex flex-col h-screen p-3">
    <div class="flex items-center justify-between">
      <ButtonWithTooltip
        text="Go back"
        variant="link"
        color="neutral"
        class="p-2 py-1.5"
        @click="$router.push('/')"
        :icon="ICONS.arrowBackFilled"
      />
      <div class="flex gap-2 items-center">
        <UTooltip :text="value === 'light' ? 'Go dark' : 'Go light'" arrow>
          <UColorModeButton variant="link" color="neutral" class="p-2 py-1.5" />
        </UTooltip>
        <AuthUser />
      </div>
    </div>

    <div class="mt-4">
      <UTabs
        :items="items"
        class="w-full"
        variant="link"
        size="lg"
        orientation="vertical"
        :ui="{
          root: 'items-start gap-6',
          list: ' border-none',
          trigger:
            'text-md dark:data-[state=active]:bg-neutral-800 data-[state=active]:bg-neutral-100 p-2.5 pr-20 py-1.5 hover:opacity-90',
        }"
        default-value="general"
      >
        <template #general>
          <SettingsGeneral />
        </template>

        <template #ai>
          <SettingsAi />
        </template>
      </UTabs>
    </div>
  </div>
</template>
