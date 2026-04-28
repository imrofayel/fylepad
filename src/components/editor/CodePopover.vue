<script setup lang="ts">
import { ICONS } from "@/lib/constants/icons";
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
  { label: "Plain Text", value: "txt", icon: ICONS.languages.plainText },
  { label: "Markdown", value: "md", icon: ICONS.languages.markdown },
  { label: "JSON", value: "json", icon: ICONS.languages.json },
  { label: "YAML", value: "yaml", icon: ICONS.languages.yaml },
  { label: "TOML", value: "toml", icon: ICONS.languages.toml },
  { label: "XML", value: "xml", icon: ICONS.languages.xml },
  { label: "INI", value: "ini", icon: ICONS.languages.ini },

  // Web
  { label: "JavaScript", value: "js", icon: ICONS.languages.javascript },
  { label: "TypeScript", value: "ts", icon: ICONS.languages.typescript },
  { label: "React", value: "jsx", icon: ICONS.languages.react },
  { label: "React", value: "tsx", icon: ICONS.languages.reactTs },
  { label: "HTML", value: "html", icon: ICONS.languages.html },
  { label: "CSS", value: "css", icon: ICONS.languages.css },
  { label: "SCSS", value: "scss", icon: ICONS.languages.scss },
  { label: "SASS", value: "sass", icon: ICONS.languages.sass },
  { label: "LESS", value: "less", icon: ICONS.languages.less },
  { label: "Vue", value: "vue", icon: ICONS.languages.vue },
  { label: "Svelte", value: "svelte", icon: ICONS.languages.svelte },
  { label: "Astro", value: "astro", icon: ICONS.languages.astro },

  // Backend
  { label: "Python", value: "py", icon: ICONS.languages.python },
  { label: "Go", value: "go", icon: ICONS.languages.go },
  { label: "Rust", value: "rs", icon: ICONS.languages.rust },
  { label: "Java", value: "java", icon: ICONS.languages.java },
  { label: "C", value: "c", icon: ICONS.languages.c },
  { label: "C++", value: "cpp", icon: ICONS.languages.cpp },
  { label: "C#", value: "csharp", icon: ICONS.languages.csharp },
  { label: "PHP", value: "php", icon: ICONS.languages.php },
  { label: "Ruby", value: "rb", icon: ICONS.languages.ruby },
  { label: "Swift", value: "swift", icon: ICONS.languages.swift },
  { label: "Kotlin", value: "kotlin", icon: ICONS.languages.kotlin },
  { label: "Dart", value: "dart", icon: ICONS.languages.dart },

  // JVM / Functional
  { label: "Scala", value: "scala", icon: ICONS.languages.scala },
  { label: "Haskell", value: "hs", icon: ICONS.languages.haskell },
  { label: "Elixir", value: "ex", icon: ICONS.languages.elixir },
  { label: "Erlang", value: "erl", icon: ICONS.languages.erlang },
  { label: "OCaml", value: "ml", icon: ICONS.languages.ocaml },

  // Scripting
  { label: "Terminal", value: "bash", icon: ICONS.terminal },
  { label: "Lua", value: "lua", icon: ICONS.languages.lua },
  { label: "Perl", value: "pl", icon: ICONS.languages.perl },
  { label: "PowerShell", value: "powershell", icon: ICONS.languages.powershell },

  // Data / Query
  { label: "SQL", value: "sql", icon: ICONS.languages.sql },
  { label: "GraphQL", value: "graphql", icon: ICONS.languages.graphql },

  // Infra
  { label: "Dockerfile", value: "dockerfile", icon: ICONS.languages.dockerfile },
  { label: "NGINX", value: "nginx", icon: ICONS.languages.nginx },
  { label: "Makefile", value: "makefile", icon: ICONS.languages.makefile },
  { label: "CMake", value: "cmake", icon: ICONS.languages.cmake },

  // Other
  { label: "Assembly", value: "asm", icon: ICONS.languages.assembly },
  { label: "Other", value: "other", icon: ICONS.languages.disc },
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
