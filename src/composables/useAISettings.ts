import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
import { isCloudMode } from "@/lib/editorDb";
import { DEFAULT_MODEL } from "@/lib/ai";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  pricing?: {
    input?: string;
    output?: string;
  };
}

const aiEnabled = useStorage("fylepad-ai-enabled", true);
const apiKey = useStorage("fylepad-ai-key", "");
const selectedModel = useStorage("fylepad-ai-model", DEFAULT_MODEL);
const models = ref<AIModel[]>([]);
const isFetchingModels = ref(false);
const aiError = ref<string | null>(null);

export function useAISettings() {
  const isConfigured = computed(() => {
    if (!aiEnabled.value) return false;
    // In cloud mode, auth manages the AI. In local mode, we need the API key.
    if (isCloudMode()) return true;
    return !!apiKey.value;
  });

  const fetchModels = async () => {
    if (models.value.length > 0) return;

    isFetchingModels.value = true;
    try {
      const response = await fetch("https://ai-gateway.vercel.sh/v1/models");
      if (!response.ok) throw new Error("Failed to fetch models");

      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        // Filter only language models
        models.value = data.data.filter((model: any) => model.type === "language");
      }
    } catch (error) {
      console.error("Failed to fetch AI models:", error);
    } finally {
      isFetchingModels.value = false;
    }
  };

  const clearError = () => {
    aiError.value = null;
  };

  const setError = (error: string) => {
    aiError.value = error;
  };

  return {
    aiEnabled,
    apiKey,
    selectedModel,
    models,
    isFetchingModels,
    isConfigured,
    aiError,
    fetchModels,
    clearError,
    setError,
  };
}
