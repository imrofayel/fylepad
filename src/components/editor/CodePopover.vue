<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { onBeforeUnmount, onMounted, ref } from "vue";

type Language = {
  label: string;
  value: string;
  icon: string;
};

const props = defineProps<{
  editor: Editor;
}>();

const open = ref(false);
const selected = ref<string>("txt");

const DEFAULT_LANGUAGE = "txt";
const FALLBACK_LANGUAGE = "other";

// ---------------- Language Registry ----------------
const languages: Language[] = [
  // Core
  { label: "Plain Text", value: "txt", icon: "material-icon-theme:document" },
  { label: "Markdown", value: "md", icon: "material-icon-theme:markdown" },
  { label: "JSON", value: "json", icon: "material-icon-theme:json" },
  { label: "YAML", value: "yaml", icon: "material-icon-theme:yaml" },
  { label: "TOML", value: "toml", icon: "material-icon-theme:toml" },
  { label: "XML", value: "xml", icon: "material-icon-theme:xml" },
  { label: "INI", value: "ini", icon: "material-icon-theme:settings" },

  // Web
  { label: "JavaScript", value: "js", icon: "material-icon-theme:javascript" },
  { label: "TypeScript", value: "ts", icon: "material-icon-theme:typescript" },
  { label: "React", value: "jsx", icon: "material-icon-theme:react" },
  { label: "React", value: "tsx", icon: "material-icon-theme:react-ts" },
  { label: "HTML", value: "html", icon: "material-icon-theme:html" },
  { label: "CSS", value: "css", icon: "material-icon-theme:css" },
  { label: "SCSS", value: "scss", icon: "material-icon-theme:sass" },
  { label: "SASS", value: "sass", icon: "material-icon-theme:sass" },
  { label: "LESS", value: "less", icon: "material-icon-theme:less" },
  { label: "Vue", value: "vue", icon: "material-icon-theme:vue" },
  { label: "Svelte", value: "svelte", icon: "material-icon-theme:svelte" },
  { label: "Astro", value: "astro", icon: "material-icon-theme:astro" },

  // Backend
  { label: "Python", value: "py", icon: "material-icon-theme:python" },
  { label: "Go", value: "go", icon: "material-icon-theme:go" },
  { label: "Rust", value: "rs", icon: "material-icon-theme:rust" },
  { label: "Java", value: "java", icon: "material-icon-theme:java" },
  { label: "C", value: "c", icon: "material-icon-theme:c" },
  { label: "C++", value: "cpp", icon: "material-icon-theme:cpp" },
  { label: "C#", value: "csharp", icon: "material-icon-theme:csharp" },
  { label: "PHP", value: "php", icon: "material-icon-theme:php" },
  { label: "Ruby", value: "rb", icon: "material-icon-theme:ruby" },
  { label: "Swift", value: "swift", icon: "material-icon-theme:swift" },
  { label: "Kotlin", value: "kotlin", icon: "material-icon-theme:kotlin" },
  { label: "Dart", value: "dart", icon: "material-icon-theme:dart" },

  // JVM / Functional
  { label: "Scala", value: "scala", icon: "material-icon-theme:scala" },
  { label: "Haskell", value: "hs", icon: "material-icon-theme:haskell" },
  { label: "Elixir", value: "ex", icon: "material-icon-theme:elixir" },
  { label: "Erlang", value: "erl", icon: "material-icon-theme:erlang" },
  { label: "OCaml", value: "ml", icon: "material-icon-theme:ocaml" },

  // Scripting
  { label: "Terminal", value: "bash", icon: "vscode-icons:file-type-shell" },
  { label: "Lua", value: "lua", icon: "material-icon-theme:lua" },
  { label: "Perl", value: "pl", icon: "material-icon-theme:perl" },
  { label: "PowerShell", value: "powershell", icon: "material-icon-theme:powershell" },

  // Data / Query
  { label: "SQL", value: "sql", icon: "material-icon-theme:database" },
  { label: "GraphQL", value: "graphql", icon: "material-icon-theme:graphql" },

  // Infra
  { label: "Dockerfile", value: "dockerfile", icon: "material-icon-theme:docker" },
  { label: "NGINX", value: "nginx", icon: "material-icon-theme:nginx" },
  { label: "Makefile", value: "makefile", icon: "material-icon-theme:makefile" },
  { label: "CMake", value: "cmake", icon: "material-icon-theme:cmake" },

  // Other
  { label: "Assembly", value: "asm", icon: "material-icon-theme:assembly" },
  { label: "Other", value: "other", icon: "material-icon-theme:disc" },
];

const LANGUAGE_ALIASES: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  rust: "rs",
  markdown: "md",
  plaintext: "txt",
  text: "txt",
  yaml: "yaml",
  docker: "dockerfile",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  react: "jsx",
};

const languageValues = new Set(languages.map((l) => l.value));

// ---------------- Helpers ----------------
function normalizeLanguage(value?: string) {
  if (!value) return DEFAULT_LANGUAGE;

  const lower = value.toLowerCase();
  return LANGUAGE_ALIASES[lower] || lower;
}

function syncFromEditor() {
  if (!props.editor.isActive("codeBlock")) {
    open.value = false;
    return;
  }

  const lang = props.editor.getAttributes("codeBlock").language as string | undefined;
  const normalized = normalizeLanguage(lang);

  if (languageValues.has(normalized)) {
    selected.value = normalized;
  } else {
    selected.value = FALLBACK_LANGUAGE;
  }
}

onMounted(() => {
  syncFromEditor();
  props.editor.on("selectionUpdate", syncFromEditor);
  props.editor.on("update", syncFromEditor);
});

onBeforeUnmount(() => {
  props.editor.off("selectionUpdate", syncFromEditor);
  props.editor.off("update", syncFromEditor);
});

function updateLanguage(value: string) {
  selected.value = value;

  props.editor
    .chain()
    .focus()
    .updateAttributes("codeBlock", {
      language: value === DEFAULT_LANGUAGE ? null : value,
    })
    .run();

  open.value = false;
}

function getIcon(value?: string) {
  return languages.find((l) => l.value === value)?.icon;
}
</script>

<template>
  <UInputMenu
    v-model="selected"
    v-model:open="open"
    :items="languages"
    label-key="label"
    value-key="value"
    by="value"
    :open-on-focus="false"
    icon="i-lucide-code"
    placeholder="Select language"
    :ui="{
      root: 'max-w-40!',
      base: 'ring-0 py-1! px-8! bg-transparent text-default! text-[16px]!',
      leading: 'ps-1!',
      trailing: 'pe-1!',
    }"
    :content="{ hideWhenEmpty: true }"
    @update:model-value="updateLanguage"
  >
    <template #leading="{ modelValue }">
      <UIcon v-if="getIcon(modelValue)" :name="getIcon(modelValue)" class="size-5" />
    </template>

    <template #item-leading="{ item }">
      <UIcon :name="item.icon" class="size-4.5" />
    </template>

    <template #item-label="{ item }">
      {{ item.label }}
    </template>
  </UInputMenu>
</template>
