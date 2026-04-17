import "./assets/css/main.css";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(ui);

app.mount("#app");
