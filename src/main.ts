import "./assets/css/main.css";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";
import { addCollection } from "@iconify/vue";
import aiSvg from "./assets/icons/hume-ai.svg?raw";
import tabler from "@iconify-json/tabler/icons.json";

addCollection(tabler);

addCollection({
  prefix: "icons",
  icons: {
    ai: {
      body: aiSvg,
      width: 1200,
      height: 1200,
    },
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(ui);

app.mount("#app");
