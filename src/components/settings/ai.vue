<script setup lang="ts">
import { useAISettings, type AIModel } from "@/composables/useAISettings";
import { isCloudMode } from "@/lib/editorDb";
import { onMounted, ref } from "vue";
import { ICONS } from "@/lib/constants/icons";

const { aiEnabled, apiKey, selectedModel, models, fetchModels, isFetchingModels } = useAISettings();
const cloudMode = isCloudMode();

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
  <div class="flex flex-col gap-2 max-w-2xl">
    <div>
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-medium text-neutral-900 dark:text-white">AI</h3>
        <USwitch v-model="aiEnabled" color="info" @update:modelValue="handleToggleAI" />
      </div>
      <p class="mt-3 text-[16px]">
        Integrate AI Assistant to supercharge your note-taking experience.
      </p>
    </div>

    <!-- Local/Tauri BYOK Settings -->
    <template v-if="!cloudMode && aiEnabled">
      <UDivider class="my-2" />

      <!-- API Key -->
      <UFormField
        label="API Key"
        description="Provide your AI Gateway API key. This key is stored locally and never sent to our servers."
        :ui="{
          label: 'text-[15.5px]',
          description: 'text-[15px] mb-3 text-default',
        }"
      >
        <template #label>
          <div class="flex items-center gap-2 mb-2.5">
            <UIcon :name="ICONS.key" class="text-xl!" />API Key
          </div>
        </template>
        <div
          v-if="!isEditingKey"
          class="flex items-center bg-neutral-100 justify-between p-0 px-2 pr-1 dark:bg-neutral-800 rounded-sm min-h-[30px] w-full cursor-pointer"
          @click="isEditingKey = true"
        >
          <span class="text-neutral-600 dark:text-neutral-400 font-mono text-xs">
            {{ apiKey ? "* * * * * * * * * * * * * * * *" : "No key provided" }}
          </span>
          <UButton color="neutral" variant="ghost" :icon="ICONS.edit" size="md" :padded="false" />
        </div>
        <UInput
          v-else
          v-model="apiKey"
          type="text"
          placeholder="vck_..."
          class="w-full"
          :ui="{
            base: 'bg-neutral-100 dark:bg-neutral-800 justify-between p-1.5 focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! outline-0! px-2 pr-1 rounded-sm',
            trailing: 'p-0!',
          }"
          autofocus
        >
          <template #trailing>
            <div class="flex items-center gap-1">
              <UButton
                color="primary"
                variant="ghost"
                :icon="ICONS.check"
                size="lg"
                :padded="false"
                @click="isEditingKey = false"
              />
            </div>
          </template>
        </UInput>
      </UFormField>

      <!-- Model Selection -->
      <UFormField
        description="Select the AI model you'd like to use. Some models may have different capabilities or pricing."
        class="mt-5"
        :ui="{
          label: 'text-[15.5px]',
          description: 'text-[15px] mb-3 text-default',
        }"
      >
        <template #label>
          <div class="flex items-center gap-2 mb-2.5">
            <UIcon :name="ICONS.llm" class="text-xl!" />Preferred Model
          </div>
        </template>
        <USelectMenu
          v-model="selectedModel"
          :items="models"
          value-key="id"
          label-key="name"
          placeholder="Select an AI model..."
          :loading="isFetchingModels"
          class="w-full"
          :ui="{
            base: 'bg-neutral-100 justify-between p-2 rounded-sm ring-0 text-[15.5px]! px-2 pr-1 dark:bg-neutral-800',
            content: 'bg-neutral-100 dark:bg-neutral-800',
            input:
              'text-[15.5px]! border-b-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none! outline-0',
          }"
        >
          <template #item="{ item }">
            <div class="flex flex-col gap-1 py-1">
              <span class="font-medium text-[15.5px]">{{
                (item as AIModel).name || (item as AIModel).id
              }}</span>
              <span class="text-[15px] text-neutral-500">{{ (item as AIModel).id }}</span>
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
