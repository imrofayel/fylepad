import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
import { isCloudMode } from "@/lib/editorDb";
import { DEFAULT_MODEL } from "@/lib/ai";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  modelType: string;
  provider: string;
  pricing?: {
    input?: string;
    output?: string;
  };
}

export interface ProviderInfo {
  label: string;
  icon: string;
}

const ALLOWED_PROVIDERS = ["openai", "anthropic", "google", "deepseek", "mistral"] as const;

const EXCLUDED_TAGS = ["reasoning", "image-generation"];

export const PROVIDER_META: Record<string, ProviderInfo> = {
  openai: { label: "OpenAI", icon: "ri:openai-fill" },
  anthropic: { label: "Claude", icon: "vscode-icons:file-type-claude" },
  google: { label: "Google", icon: "vscode-icons:file-type-gemini" },
  deepseek: { label: "DeepSeek", icon: "ri:deepseek-fill" },
  mistral: { label: "Mistral", icon: "logos:mistral-ai-icon" },
};

const aiEnabled = useStorage("fylepad-ai-enabled", true);
const apiKey = useStorage("fylepad-ai-key", "");
const selectedModel = useStorage("fylepad-ai-model", DEFAULT_MODEL);
const selectedModelName = useStorage("fylepad-ai-model-name", "");
const selectedModelProvider = useStorage("fylepad-ai-model-provider", "anthropic");
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
        models.value = data.data
          .filter((model: any) => {
            // Only language (text) models
            if (model.type !== "language") return false;

            // Only from allowed providers
            const provider = model.owned_by?.toLowerCase();
            if (!ALLOWED_PROVIDERS.includes(provider)) return false;

            // Exclude reasoning, vision, and image-generation models
            const tags: string[] = model.tags || [];
            if (tags.some((t: string) => EXCLUDED_TAGS.includes(t))) return false;

            return true;
          })
          .map((model: any) => ({
            ...model,
            modelType: model.type,
            provider: model.owned_by?.toLowerCase(),
          }));
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
    selectedModelName,
    selectedModelProvider,
    models,
    isFetchingModels,
    isConfigured,
    aiError,
    fetchModels,
    clearError,
    setError,
  };
}
