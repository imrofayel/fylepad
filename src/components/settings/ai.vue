<script setup lang="ts">
import { useAISettings, type AIModel } from "@/composables/useAISettings";
import { isCloudMode } from "@/lib/editorDb";
import { onMounted, ref } from "vue";
import { ICONS } from "@/lib/constants/icons";

const { aiEnabled, apiKey, selectedModel, models, fetchModels, isFetchingModels } = useAISettings();
const cloudMode = isCloudMode();

const showKey = ref(false);
const isEditingKey = ref(false);

onMounted(() => {
  if (aiEnabled.value && !cloudMode) {
    fetchModels();
  }
});

const handleToggleAI = (val: boolean) => {
  aiEnabled.value = val;
  if (val && !cloudMode) {
    fetchModels();
  }
};
</script>

<template>
  <div class="flex flex-col gap-8 max-w-2xl">
    <div>
      <h3 class="text-lg font-medium text-neutral-900 dark:text-white">AI Assistant</h3>
      <p class="text-sm text-neutral-500 mt-1">
        Configure the AI assistant features and integration.
      </p>
    </div>

    <!-- Global Toggle -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium text-neutral-900 dark:text-white">Enable AI Features</h4>
        <p class="text-sm text-neutral-500 mt-1">
          Turns on AI autocomplete, actions, and features throughout the app.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="aiEnabled"
        @click="handleToggleAI(!aiEnabled)"
        class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        :class="aiEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'"
      >
        <span class="sr-only">Enable AI Features</span>
        <span
          class="pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
          :class="[
            aiEnabled
              ? 'translate-x-4 bg-white dark:bg-neutral-900'
              : 'translate-x-0.5 bg-white dark:bg-neutral-500',
          ]"
        />
      </button>
    </div>

    <!-- Local/Tauri BYOK Settings -->
    <template v-if="!cloudMode && aiEnabled">
      <UDivider class="my-2" />

      <!-- API Key -->
      <UFormField
        label="AI Gateway API Key"
        description="Provide your AI Gateway API key. This key is stored locally and never sent to our servers."
      >
        <div
          v-if="!isEditingKey"
          class="flex items-center justify-between p-2 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800/50 min-h-[36px] w-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          @click="isEditingKey = true"
        >
          <span class="text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            {{ apiKey ? "••••••••••••••••••••••••" : "No key provided" }}
          </span>
          <UButton color="neutral" variant="ghost" icon="tabler:edit" size="sm" :padded="false" />
        </div>
        <UInput
          v-else
          v-model="apiKey"
          :type="showKey ? 'text' : 'password'"
          placeholder="sk_..."
          class="w-full"
          autofocus
        >
          <template #trailing>
            <div class="flex items-center gap-1 pr-1">
              <UButton
                color="neutral"
                variant="ghost"
                :icon="showKey ? 'tabler:eye-off' : 'tabler:eye'"
                size="sm"
                :padded="false"
                @click="showKey = !showKey"
              />
              <UButton
                color="primary"
                variant="ghost"
                icon="tabler:check"
                size="sm"
                :padded="false"
                @click="isEditingKey = false"
              />
            </div>
          </template>
        </UInput>
      </UFormField>

      <!-- Model Selection -->
      <UFormField
        label="Preferred Model"
        description="Select the AI model you'd like to use. Some models may have different capabilities or pricing."
      >
        <USelectMenu
          v-model="selectedModel"
          :items="models"
          value-key="id"
          label-key="name"
          placeholder="Select an AI model..."
          :loading="isFetchingModels"
          class="w-full"
        >
          <template #item="{ item }">
            <div class="flex flex-col gap-1 py-1">
              <span class="font-medium text-sm">{{
                (item as AIModel).name || (item as AIModel).id
              }}</span>
              <span class="text-xs text-neutral-500">{{ (item as AIModel).id }}</span>
            </div>
          </template>
        </USelectMenu>
      </UFormField>
    </template>

    <div
      v-else-if="cloudMode && aiEnabled"
      class="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 text-sm text-neutral-500"
    >
      <div class="flex items-start gap-3">
        <UIcon :name="ICONS.info" class="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p class="font-medium text-neutral-900 dark:text-white mb-1">Managed AI</p>
          <p>
            You are using Fylepad Cloud. AI models and keys are managed automatically for your
            account.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
