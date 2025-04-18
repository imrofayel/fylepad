export default defineNuxtConfig({
  // (optional) Enable the Nuxt devtools
  devtools: { enabled: true },

  // Enable SSG
  ssr: false,

  // Enables the development server to be discoverable by other devices for mobile development

  telemetry: false,

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  devServer: { host: '0.0.0.0' },

  vite: {
    // Better support for Tauri CLI output
    clearScreen: false,
    // Enable environment variables
    // Additional environment variables can be found at
    // https://v2.tauri.app/reference/environment-variables/
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      // Tauri requires a consistent port
      strictPort: true,
      hmr: {
        // Use websocket for mobile hot reloading
        protocol: 'ws',
        // Make sure it's available on the network
        host: '0.0.0.0',
        // Use a specific port for hmr
        port: 5183,
      },
    },
  },

  pwa: {
    manifest: {
      name: 'fylepad - a notepad of your dreams!',
      short_name: 'fylepad',
      description: 'a minimal notepad with everything you\'d need',

      icons: [
        {
          src: "icons/32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          src: "icons/64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "icons/128x128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "icons/144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "icons/192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ]
    },
    workbox: {
      navigateFallback: "/"
    },

    devOptions: {
      enabled: true,
      type: "module"
    },
  },

  modules: ['@nuxt/icon', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@vite-pwa/nuxt'  ],
  css: ['assets/css/main.css'],
  compatibilityDate: '2024-12-23'
});