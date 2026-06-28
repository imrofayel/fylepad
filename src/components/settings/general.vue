<script setup lang="ts">
import { useAuth, authClient } from "@/composables/useAuth";
import { ICONS } from "@/lib/constants/icons";
import { ref } from "vue";
import { useToast } from "@nuxt/ui/composables/useToast";

const { user, updatePhoto, logout } = useAuth();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

const deleting = ref(false);
const deletePopoverOpen = ref(false);
const deleteEmailInput = ref("");

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

async function confirmDeleteAccount() {
  if (deleteEmailInput.value.trim() !== user.value?.email) {
    showToast("Email doesn't match your account", "error");
    return;
  }

  deleting.value = true;
  try {
    await authClient.deleteUser({
      callbackURL: "/",
      fetchOptions: {
        onSuccess: async () => {
          deletePopoverOpen.value = false;
          deleteEmailInput.value = "";
          showToast("Verification email sent, please check your inbox to confirm deletion.");
        },
        onError: (ctx: any) => {
          showToast(ctx.error?.message || "Failed to delete account", "error");
        },
      },
    });
  } catch (e: any) {
    showToast(e?.message || "Failed to delete account", "error");
  } finally {
    deleting.value = false;
  }
}

function cancelDelete() {
  deletePopoverOpen.value = false;
  deleteEmailInput.value = "";
}
</script>

<template>
  <div class="flex flex-col gap-6 scale-[99%]">
    <!-- Profile section -->
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

    <div class="flex items-center mt-3 justify-between">
      <UFormField
        label="Danger Zone"
        description="This action cannot be undone, all your data will be lost."
        :ui="{
          label: 'text-[15.5px]',
          description: 'text-[15px] mb-3 text-default',
        }"
      >
        <template #label>
          <div class="flex items-center gap-2 mb-2.5">
            <UIcon :name="ICONS.trash" class="text-xl!" />Danger Zone
          </div>
        </template>

        <UPopover v-model:open="deletePopoverOpen" arrow>
          <UButton icon="tabler:trash" color="error" variant="subtle" class="mt-1" size="sm">
            Delete Account
          </UButton>

          <template #content>
            <div class="p-2 px w-80 flex flex-col gap-2">
              <div class="text-sm">Type your email to confirm:</div>
              <UInput
                v-model="deleteEmailInput"
                placeholder="example@gmail.com"
                size="md"
                :ui="{
                  base: 'font-mono bg-neutral-200! outline-none! ring-0 focus:ring-0! focus-visible:ring-0! focus-visible:outline-none! outline-0!  px-2 dark:bg-neutral-700!',
                }"
                autofocus
              />
              <div class="flex justify-end gap-2 mt-1">
                <UButton
                  color="neutral"
                  :ui="{
                    base: 'dark:bg-neutral-700! bg-neutral-200! ring-0',
                  }"
                  variant="subtle"
                  size="sm"
                  @click="cancelDelete"
                  >Cancel</UButton
                >
                <UButton
                  color="error"
                  size="sm"
                  variant="solid"
                  :loading="deleting"
                  :disabled="deleteEmailInput.trim() !== user?.email"
                  @click="confirmDeleteAccount"
                >
                  Delete Forever
                </UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </UFormField>
    </div>
  </div>
</template>
