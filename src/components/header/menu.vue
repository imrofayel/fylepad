<script setup lang="ts">
import { useEditor } from "@/composables/useEditor";
import { ICONS } from "@lib/constants/icons";
import { useColorMode } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const { user, signInWithGoogle, logout } = useAuth();
const router = useRouter();

const color = useColorMode();
const { openFileDialog, saveActiveToDisk } = useEditor();

defineProps<{
  isHome: boolean;
}>();
</script>
<template>
  <UPopover
    arrow
    :ui="{
      content: 'bg-white dark:bg-neutral-800!',
      arrow: 'fill-background! dark:fill-neutral-800!',
    }"
  >
    <ButtonWithTooltip text="Menu" :icon="ICONS.menu" v-if="!user" />
    <UAvatar v-else :src="user.image" :alt="user.name" size="xs" />

    <template #content>
      <div class="flex flex-col p-0.5 py-1 w-42">
        <UButton
          label="Save file"
          variant="link"
          color="neutral"
          :icon="ICONS.markdown"
          class="p-2 py-1.5 font-normal text-[15px]"
          @click="saveActiveToDisk"
          :ui="{
            leadingIcon: 'size-4.5',
          }"
          v-if="!isHome"
        />

        <UButton
          label="Open (Ctrl + O)"
          variant="link"
          color="neutral"
          :icon="ICONS.folderOpen"
          class="p-2 py-1.5 font-normal text-[15px]"
          @click="
            () => {
              openFileDialog();
            }
          "
          :ui="{
            leadingIcon: 'size-4.5',
          }"
          v-if="!isHome"
        />

        <UButton
          label="Settings"
          variant="link"
          color="neutral"
          :icon="ICONS.settings"
          class="p-2 py-1.5 font-normal text-[15px]"
          :ui="{
            leadingIcon: 'size-4.5',
          }"
          @click="router.push('/settings')"
        />

        <UColorModeButton
          variant="link"
          color="neutral"
          :label="color === 'light' ? 'Dark mode' : 'Light mode'"
          class="p-2 py-1.5 font-normal text-[15px]"
          :ui="{
            leadingIcon: 'size-4.5',
          }"
        />

        <UButton
          label="About"
          variant="link"
          color="neutral"
          :icon="ICONS.info"
          class="p-2 py-1.5 font-normal text-[15px]"
          :ui="{
            leadingIcon: 'size-4.5',
          }"
        />

        <UButton
          label="Logout"
          variant="link"
          color="error"
          :icon="ICONS.logout"
          class="p-2 py-1.5 font-normal text-[15px]"
          :ui="{
            leadingIcon: 'size-4.5',
          }"
          @click="logout"
          v-if="user"
        />

        <UButton
          label="Login"
          variant="link"
          color="error"
          :icon="ICONS.login"
          class="p-2 py-1.5 font-normal text-[15px]"
          :ui="{
            leadingIcon: 'size-4.5',
          }"
          @click="signInWithGoogle"
          v-if="!user"
        />
      </div>
    </template>
  </UPopover>
</template>
