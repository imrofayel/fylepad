import "./assets/css/main.css";
import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";
import { addCollection } from "@iconify/vue";
import aiSvg from "./assets/icons/hume-ai.svg?raw";
import { registerIcons } from "@lib/register-icons.js";
import { patchFetchForTauri } from "@lib/tauri-fetch.js";
import "@lib/xfce-icons";

patchFetchForTauri();

registerIcons();

const IS_TAURI = "__TAURI_INTERNALS__" in window;

addCollection({
  prefix: "icons",
  icons: {
    ai: {
      body: aiSvg,
      width: 1200,
      height: 1200,
    },
    square: {
      body: '<path fill="currentColor" d="M3 3v18h18V3"/>',
      width: 25,
      height: 25,
    },
  },
});

const router = createRouter({
  history: IS_TAURI ? createWebHashHistory() : createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(ui);

app.mount("#app");
