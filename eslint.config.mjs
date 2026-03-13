// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/multi-word-component-names": [
      "error",
      {
        ignores: ["editor", "command", "info", "default", "about", "index"],
      },
    ],
    "vue/html-self-closing": "off"
  },
});
