import { ref, computed } from "vue";
import { createAuthClient } from "better-auth/vue";

const API = import.meta.env.VITE_BACKEND_API;

export const authClient = createAuthClient({
  baseURL: API,
  basePath: "/auth",
});

const user = ref<any>(null);
const loading = ref(false);
const initialized = ref(false);

export function useAuth() {
  async function fetchUser() {
    loading.value = true;

    try {
      const { data, error } = await authClient.getSession();

      if (error) {
        user.value = null;
      } else {
        user.value = data?.user ?? null;
      }
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function signIn(provider: "google") {
    loading.value = true;

    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL: window.location.origin,
    });

    loading.value = false;

    if (error) {
      console.error("Sign-in failed:", error);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  }

  async function logout() {
    await authClient.signOut();
    user.value = null;
  }

  const isAuthenticated = computed(() => !!user.value);

  if (!initialized.value) {
    fetchUser();
  }

  return {
    user,
    loading,
    initialized,

    isAuthenticated,

    fetchUser,
    signInWithGoogle: () => signIn("google"),
    logout,
  };
}
