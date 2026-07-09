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
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },

  // ensure relative asset paths when built for Tauri bundles (robust check)
  base: process.env.TAURI_BUILD || process.env.NODE_ENV === "production" ? "./" : "/",

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
    VueRouter(),
    vue(),
    ui({
      icon: {
        mode: "svg",
      } as any,
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
          light: "ph:moon-duotone",
          dark: "ph:sun-dim-duotone",
          loading: "ph:spinner-gap-duotone",
        },
        modal: {
          slots: {
            overlay: "bg-transparent!",
            content:
              "bg-neutral-100 ring-1 ring-neutral-300 dark:ring-neutral-600 dark:bg-neutral-700 p-4! py-1.5! shadow-none! backdrop-blur-sm",
          },
        },
        toast: {
          slots: {
            root: "relative group overflow-hidden bg-default shadow-sm rounded-sm ring ring-default p-3 flex gap-2.5 focus:outline-none",
            wrapper: "w-0 flex-1 flex flex-col",
            title: "text-[15px] font-normal text-default",
            icon: "size-4.5",
          },
        },
        tooltip: {
          slots: {
            content:
              "p-2 h-7 ring-1 ring-neutral-300 dark:ring-neutral-600 bg-neutral-100 dark:bg-neutral-800! z-[100]",
            text: "text-default text-[14px]",
            arrow:
              "fill-neutral-100! dark:fill-neutral-800! dark:stroke-neutral-600! stroke-neutral-300!",
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
              "ring-1 ring-neutral-300 bg-neutral-100 dark:bg-neutral-800! dark:ring-neutral-600",
            arrow:
              "dark:stroke-neutral-600! fill-neutral-100! dark:fill-neutral-800! stroke-neutral-300!",
          },
        },
        dropdownMenu: {
          slots: {
            content:
              "ring-1 ring-neutral-300 dark:ring-neutral-600 bg-neutral-100 dark:bg-neutral-800!",
            arrow:
              "fill-neutral-100! dark:fill-neutral-800! dark:stroke-neutral-600! stroke-neutral-300!",
          },
        },
        input: {
          slots: {
            base: "focus-visible:ring-1! dark:focus-visible:ring-neutral-500! font-medium text-default! focus-visible:ring-neutral-400!",
          },
        },
        button: {
          slots: {
            base: "focus:ring-0!",
          },
          compoundVariants: [
            {
              color: "neutral",
              variant: "link",
              class: "hover:text-neutral-600 text-default dark:hover:text-neutral-300 px-0",
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
  build: {
    sourcemap: false,
    minify: "esbuild" as const,
    cssCodeSplit: true,
  },
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
