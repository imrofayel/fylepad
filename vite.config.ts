import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import VueRouter from "vue-router/vite";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },

  optimizeDeps: {
    include: [
      "@nuxt/ui > prosemirror-state",
      "@nuxt/ui > prosemirror-transform",
      "@nuxt/ui > prosemirror-model",
      "@nuxt/ui > prosemirror-view",
      "@nuxt/ui > prosemirror-gapcursor",
      "@tiptap/extension-table > prosemirror-tables",
    ],
  },

  plugins: [
    VueRouter({
      /* options */
    }),
    vue(),
    ui({
      components: {
        dirs: ["src/components"],
        extensions: ["vue"],
        directoryAsNamespace: true,
        dts: true,
      },
      ui: {
        colors: {
          primary: "black",
          neutral: "neutral",
        },
        icons: {
          light: "tabler:moon",
          dark: "tabler:sun",
        },
        tooltip: {
          slots: {
            content: "p-2 h-7",
            text: "dark:text-neutral-300 text-neutral-600 font-medium!",
          },
        },
        slideover: {
          slots: {
            content: "bg-default/90 backdrop-blur-sm",
          },
        },
        textarea: {
          slots: {
            base: "focus-visible:ring-1! dark:focus-visible:ring-neutral-500! text-[16.5px]! font-medium text-default! focus-visible:ring-neutral-400!",
          },
        },
        popover: {
          slots: {
            content:
              "ring-1 ring-neutral-300 dark:bg-neutral-900 bg-neutral-100 dark:ring-neutral-600",
            arrow:
              "dark:stroke-neutral-600! dark:fill-neutral-900! fill-neutral-100! stroke-neutral-300!",
          },
        },
        input: {
          slots: {
            base: "focus-visible:ring-1! dark:focus-visible:ring-neutral-500! text-[16.5px] font-medium text-default! focus-visible:ring-neutral-400!",
          },
        },
        button: {
          compoundVariants: [
            {
              color: "neutral",
              variant: "link",
              class: "hover:text-neutral-600 dark:hover:text-neutral-300 px-0",
            },
            {
              color: "neutral",
              variant: "solid",
              class:
                "bg-green text-white/95! text-[16.5px]! py-1.5 px-2.5 hover:bg-green active:bg-green active:opacity-80 hover:opacity-80 duration-200 transition-all",
            },
            {
              color: "primary",
              variant: "solid",
              class:
                "dark:bg-neutral-400 dark:disabled:bg-neutral-400 text-inverted dark:hover:bg-neutral-400/80 dark:active:bg-neutral-300/80 bg-green hover:bg-green/80 active:bg-green/80 light:disabled:bg-green/80 light:ring-1! ring-green-ring",
            },
          ],
        },
      },
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  staged: {
    "*.{js,ts,tsx,vue,svelte}": "vp check --fix",
  },
}));
