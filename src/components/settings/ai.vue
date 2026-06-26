<script setup lang="ts">
import { useAISettings, type AIModel, PROVIDER_META } from "@/composables/useAISettings";
import { isCloudMode } from "@/lib/editorDb";
import { computed, onMounted, ref, watch } from "vue";
import { ICONS } from "@/lib/constants/icons";

const {
  aiEnabled,
  apiKey,
  selectedModel,
  selectedModelName,
  selectedModelProvider,
  models,
  fetchModels,
  isFetchingModels,
} = useAISettings();
const cloudMode = isCloudMode();

const isEditingKey = ref(false);
const modelPickerOpen = ref(false);
const modelSearch = ref("");

onMounted(() => {
  if (aiEnabled.value) {
    fetchModels();
  }
});

const handleToggleAI = (val: boolean) => {
  aiEnabled.value = val;
  if (val) {
    fetchModels();
  }
};

/** Sync name + provider whenever selectedModel changes */
watch(
  [selectedModel, models],
  ([id, list]) => {
    const match = list.find((m) => m.id === id);
    if (match) {
      selectedModelName.value = match.name || match.id;
      selectedModelProvider.value = match.provider;
    }
  },
  { immediate: true },
);

/** Provider icon for the currently selected model */
const selectedProviderIcon = computed(() => {
  return PROVIDER_META[selectedModelProvider.value]?.icon || null;
});

/** Display name from storage */
const displayName = computed(() => {
  return selectedModelName.value || selectedModel.value || "Select a model...";
});

/** Group models by provider, filtered by search */
const groupedModels = computed(() => {
  const q = modelSearch.value.toLowerCase().trim();
  const groups: { provider: string; meta: (typeof PROVIDER_META)[string]; models: AIModel[] }[] =
    [];

  for (const [key, meta] of Object.entries(PROVIDER_META)) {
    const filtered = models.value.filter((m) => {
      if (m.provider !== key) return false;
      if (!q) return true;
      return m.name?.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
    });
    if (filtered.length > 0) {
      groups.push({ provider: key, meta, models: filtered });
    }
  }
  return groups;
});

const selectModel = (model: AIModel) => {
  selectedModel.value = model.id;
  selectedModelName.value = model.name || model.id;
  selectedModelProvider.value = model.provider;
  modelPickerOpen.value = false;
  modelSearch.value = "";
};
</script>

<template>
  <div class="flex flex-col gap-2 max-w-2xl">
    <div>
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-medium text-neutral-900 dark:text-white">
          {{ cloudMode ? "AI" : "AI" }}
        </h3>
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
          <span
            class="text-neutral-600 dark:text-neutral-400 font-mono"
            :class="apiKey ? 'text-[8px]' : 'text-sm'"
          >
            {{ apiKey ? "● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●" : "Add a key here" }}
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
            base: 'bg-neutral-100 dark:bg-neutral-800 font-mono justify-between p-1.5 focus:ring-0! focus:outline-none! focus-visible:ring-0! focus-visible:outline-none! outline-0! px-2 pr-1 rounded-sm',
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

      <p class="text-[15px] mb-3">
        You can get your AI Gateway API key from
        <a href="https://vercel.com/ai-gateway" target="_blank" class="text-primary-500"
          >https://vercel.com/ai-gateway</a
        >
      </p>
    </template>

    <template v-if="aiEnabled">
      <!-- Model Selection -->
      <UFormField
        description="Choose from curated text models by OpenAI, Claude, Google, and DeepSeek."
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

        <UPopover
          v-model:open="modelPickerOpen"
          :ui="{ content: 'p-0 bg-neutral-100 dark:bg-neutral-800!' }"
        >
          <!-- Custom trigger -->
          <button class="model-trigger" type="button">
            <span class="flex items-center gap-2 min-w-0">
              <UIcon
                v-if="selectedProviderIcon"
                :name="selectedProviderIcon"
                class="size-5 shrink-0"
                :class="selectedModelProvider === 'deepseek' && 'text-[#4d6bfe]!'"
              />
              <span v-if="isFetchingModels" class="text-[15.5px]">Loading models...</span>
              <span v-else class="text-[15px] truncate">{{ displayName }}</span>
            </span>
            <UIcon name="ph:caret-circle-up-down-duotone" class="size-5 text-default! shrink-0!" />
          </button>

          <!-- Dropdown content -->
          <template #content>
            <div class="w-[var(--reka-popover-trigger-width)] max-h-[320px] flex flex-col">
              <!-- Search -->
              <div class="p-1 px-2.5">
                <input
                  v-model="modelSearch"
                  type="text"
                  placeholder="Search"
                  class="w-full bg-transparent text-[15.5px] outline-none placeholder:text-neutral-400"
                />
              </div>

              <!-- Model list -->
              <div class="overflow-y-auto p-1">
                <template v-for="group in groupedModels" :key="group.provider">
                  <button
                    v-for="model in group.models"
                    :key="model.id"
                    type="button"
                    class="model-option py-[8.5px]!"
                    :class="{ active: selectedModel === model.id }"
                    @click="selectModel(model)"
                  >
                    <UIcon
                      :name="group.meta.icon"
                      class="size-5 shrink-0"
                      :class="group.meta.label === 'DeepSeek' && 'text-[#4d6bfe]!'"
                    />
                    <span class="truncate">{{ model.name || model.id }}</span>
                    <UIcon
                      v-if="selectedModel === model.id"
                      :name="ICONS.check"
                      class="size-5 ml-auto shrink-0 text-primary-500"
                    />
                  </button>
                </template>
                <div v-if="groupedModels.length === 0" class="text-center text-[15.5px] py-4">
                  No models found
                </div>
              </div>
            </div>
          </template>
        </UPopover>
      </UFormField>
    </template>
  </div>
</template>

<style scoped>
.model-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--color-neutral-100);
  cursor: pointer;
  transition: background 0.15s ease;
}

:root.dark .model-trigger {
  background: var(--color-neutral-800);
}

.model-group-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 8px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-400);
}

:root.dark .model-group-header {
  color: var(--color-neutral-500);
}

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.model-option:hover {
  background: var(--color-neutral-200);
}

:root.dark .model-option:hover {
  background: var(--color-neutral-700);
}

.model-option.active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

:root.dark .model-option.active {
  background: var(--color-primary-950);
  color: var(--color-primary-400);
}
</style>
