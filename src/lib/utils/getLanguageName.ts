type LanguageInfo = {
  label: string;
  icon: string;
};

const LANGUAGE_MAP: Record<string, LanguageInfo> = {
  js: { label: "JavaScript", icon: "vscode-icons:file-type-js" },
  javascript: { label: "JavaScript", icon: "vscode-icons:file-type-js" },

  ts: { label: "TypeScript", icon: "vscode-icons:file-type-typescript" },
  typescript: { label: "TypeScript", icon: "vscode-icons:file-type-typescript" },

  jsx: { label: "React JSX", icon: "vscode-icons:file-type-reactjs" },
  tsx: { label: "React TSX", icon: "vscode-icons:file-type-reactts" },

  html: { label: "HTML", icon: "vscode-icons:file-type-html" },
  css: { label: "CSS", icon: "vscode-icons:file-type-css" },
  scss: { label: "SCSS", icon: "vscode-icons:file-type-scss" },
  sass: { label: "Sass", icon: "vscode-icons:file-type-sass" },

  vue: { label: "Vue", icon: "vscode-icons:file-type-vue" },
  svelte: { label: "Svelte", icon: "vscode-icons:file-type-svelte" },
  astro: { label: "Astro", icon: "vscode-icons:file-type-astro" },

  py: { label: "Python", icon: "vscode-icons:file-type-python" },
  python: { label: "Python", icon: "vscode-icons:file-type-python" },

  rb: { label: "Ruby", icon: "vscode-icons:file-type-ruby" },
  php: { label: "PHP", icon: "vscode-icons:file-type-php" },

  java: { label: "Java", icon: "vscode-icons:file-type-java" },
  kt: { label: "Kotlin", icon: "vscode-icons:file-type-kotlin" },

  go: { label: "Go", icon: "vscode-icons:file-type-go" },
  rs: { label: "Rust", icon: "vscode-icons:file-type-rust" },

  c: { label: "C", icon: "vscode-icons:file-type-c" },
  cpp: { label: "C++", icon: "vscode-icons:file-type-cpp" },
  cs: { label: "C#", icon: "vscode-icons:file-type-csharp" },

  sh: { label: "Shell", icon: "vscode-icons:file-type-shell" },
  bash: { label: "Bash", icon: "vscode-icons:file-type-shell" },
  zsh: { label: "Zsh", icon: "vscode-icons:file-type-shell" },

  json: { label: "JSON", icon: "vscode-icons:file-type-json" },
  yaml: { label: "YAML", icon: "vscode-icons:file-type-yaml" },
  yml: { label: "YAML", icon: "vscode-icons:file-type-yaml" },
  xml: { label: "XML", icon: "vscode-icons:file-type-xml" },

  sql: { label: "SQL", icon: "vscode-icons:file-type-sql" },

  md: { label: "Markdown", icon: "vscode-icons:file-type-markdown" },
  markdown: { label: "Markdown", icon: "vscode-icons:file-type-markdown" },

  dockerfile: { label: "Dockerfile", icon: "vscode-icons:file-type-docker" },
  env: { label: "Environment", icon: "vscode-icons:file-type-dotenv" },

  txt: { label: "Plain Text", icon: "vscode-icons:file-type-text" },
};

export function getLanguageInfo(input?: string): LanguageInfo {
  if (!input) {
    return {
      label: "Plain Text",
      icon: "vscode-icons:file-type-text",
    };
  }

  let value = input.trim();

  // remove path
  value = value.split("/").pop() || value;

  // special files
  const lower = value.toLowerCase();
  if (lower === "dockerfile") {
    return LANGUAGE_MAP.dockerfile;
  }

  if (lower === ".env") {
    return LANGUAGE_MAP.env;
  }

  // remove query params if any
  value = value.split("?")[0];

  // extract extension if filename
  const parts = value.split(".");
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : value.toLowerCase();

  if (!ext) {
    return {
      label: "Plain Text",
      icon: "tabler:code-asterisk",
    };
  }

  return (
    LANGUAGE_MAP[ext] || {
      label: "Plain Text",
      icon: "tabler:code-asterisk",
    }
  );
}
