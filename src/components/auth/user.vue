<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";

const { user, loading, signInWithGoogle, logout } = useAuth();
const router = useRouter();
</script>

<template>
  <div>
    <USkeleton class="h-7 w-7 rounded-full bg-accented" v-if="loading" />

    <div v-else-if="user">
      <UPopover
        arrow
        :ui="{
          content: 'bg-white dark:bg-neutral-800!',
          arrow: 'fill-background! dark:fill-neutral-800!',
        }"
      >
        <UAvatar :src="user.image" :alt="user.name" size="md" />

        <template #content>
          <div class="flex flex-col p-0.5 py-1 w-42">
            <UButton
              label="Catelog"
              variant="link"
              color="neutral"
              :icon="ICONS.home"
              class="p-2 py-1.5 font-normal text-[15px]"
              :ui="{
                leadingIcon: 'size-4.5',
              }"
              @click="router.push('/')"
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
            />
          </div>
        </template>
      </UPopover>
    </div>

    <div v-else>
      <ButtonWithTooltip text="Login" :icon="ICONS.login" @click="signInWithGoogle" />
    </div>
  </div>
</template>
