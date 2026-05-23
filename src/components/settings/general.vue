<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import { ref } from "vue";

const { user, updatePhoto } = useAuth();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

function showToast(title: string, color: "success" | "error" = "success") {
  toast.add({
    title,
    color,
  });
}

function copyMail() {
  navigator.clipboard.writeText(user.value.email);
  showToast("Email copied to clipboard");
}

function openPhotoPicker() {
  fileInput.value?.click();
}

async function handlePhotoChange(event: Event) {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];

  if (!file || uploading.value) {
    if (input) input.value = "";
    return;
  }

  uploading.value = true;

  try {
    await updatePhoto(file);
    showToast("Profile photo updated");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile photo";
    showToast(message, "error");
  } finally {
    uploading.value = false;
    if (input) input.value = "";
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 scale-[99%]">
    <div class="flex gap-4 items-center">
      <div class="relative shrink-0">
        <UAvatar :name="user?.name" :src="user?.image" size="3xl" />

        <div
          v-if="uploading"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-950/45 backdrop-blur-[1px]"
        >
          <UIcon :name="ICONS.loader" class="animate-spin text-white" size="24" />
        </div>

        <input
          ref="fileInput"
          class="hidden"
          type="file"
          accept="image/*"
          @change="handlePhotoChange"
        />
      </div>

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
          <ButtonWithTooltip
            text="Upload photo"
            icon="tabler:camera-filled"
            :disabled="uploading"
            @click="openPhotoPicker"
          />
          <ButtonWithTooltip text="Copy mail" icon="tabler:mail-filled" @click="copyMail" />
        </div>
      </div>
    </div>
  </div>
</template>
