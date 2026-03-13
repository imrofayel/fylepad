// stores/focus.ts
import { defineStore } from 'pinia'

export const useFocusStore = defineStore('focus', {
  state: () => ({
    focused: false,
  }),
  actions: {
    setFocused(value: boolean) {
      this.focused = value
    },
    toggleFocus() {
      this.focused = !this.focused
    },
  },
})
