<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();

const toast = useToast();

function showToast(title: string) {
  toast.add({
    title: title,
    color: "success",
  });
}

function copyMail() {
  navigator.clipboard.writeText(user.value.email);
  showToast("Email copied to clipboard");
}
</script>

<template>
  <div class="flex flex-col gap-3 scale-[99%]">
    <div class="flex gap-4 items-center">
      <UAvatar :name="user?.name" :src="user?.image" size="3xl" />

      <div class="flex flex-col items-start">
        <div class="flex gap-0.5 items-center">
          <div class="text-xl text-clear">{{ user?.name || "Adam Rofayel" }}</div>
          <UTooltip text="Verified" arrow>
            <UBadge
              variant="outline"
              color="info"
              class="rounded-full"
              v-if="user?.emailVerified"
              :ui="{
                base: 'ring-0!',
              }"
              size="lg"
              icon="tabler:circle-check-filled"
            >
            </UBadge>
          </UTooltip>
        </div>
        <div class="flex gap-3">
          <ButtonWithTooltip text="Upload photo" icon="tabler:camera-filled" />
          <ButtonWithTooltip text="Copy mail" icon="tabler:mail-filled" @click="copyMail" />
        </div>
      </div>
    </div>
  </div>
</template>
