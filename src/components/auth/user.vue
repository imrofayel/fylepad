<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";

const { user, loading, signInWithGoogle, logout } = useAuth();
const router = useRouter();
</script>

<template>
  <USkeleton class="h-8 w-8 rounded-full bg-accented" v-if="loading" />

  <div v-else-if="user">
    <UPopover arrow>
      <UAvatar :src="user.image" :alt="user.name" class="w-8 h-8" />

      <template #content>
        <div class="flex flex-col p-0.5 py-1 gap-0.5 w-42">
          <UButton
            label="Catelog"
            variant="link"
            color="neutral"
            :icon="ICONS.home"
            class="p-2 py-1.5"
          />
          <UButton
            label="Settings"
            variant="link"
            color="neutral"
            :icon="ICONS.settings"
            class="p-2 py-1.5"
            @click="router.push('/settings')"
          />
          <UButton
            label="Logout"
            variant="link"
            color="error"
            :icon="ICONS.logout"
            class="p-2 py-1.5"
            @click="logout"
          />
        </div>
      </template>
    </UPopover>
  </div>

  <div v-else>
    <UButton
      label="Login"
      :ui="{
        base: 'py-1! px-2 cursor-pointer',
      }"
      @click="signInWithGoogle"
    />
  </div>
</template>
