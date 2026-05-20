import { ref, computed, watch } from "vue";
import { createAuthClient } from "better-auth/vue";
import { bearer } from "better-auth/plugins";

const API = import.meta.env.VITE_BACKEND_API;
const IS_TAURI = "__TAURI_INTERNALS__" in window;

export const authClient = createAuthClient({
  baseURL: API,
  basePath: "/auth",
  plugins: [bearer()],
});

const user = ref<any>(null);
const loading = ref(false);
const initialized = ref(false);
const sessionToken = ref<string | null>(localStorage.getItem("session_token"));

watch(sessionToken, (val) => {
  if (val) localStorage.setItem("session_token", val);
  else localStorage.removeItem("session_token");
});

async function fetchUserInternal(token?: string | null) {
  loading.value = true;
  try {
    const t = token ?? sessionToken.value;
    const options = t ? { fetchOptions: { headers: { Authorization: `Bearer ${t}` } } } : {};

    console.log("fetchUserInternal with token:", t);
    console.log("getSession options:", JSON.stringify(options));

    const { data, error } = await authClient.getSession(options);
    console.log("getSession result:", data, error);
    user.value = error ? null : (data?.user ?? null);
  } finally {
    loading.value = false;
    initialized.value = true;
  }
}

function handleDeepLinkUrl(url: string) {
  console.log("Handling deep link:", url);
  if (!url.startsWith("fylepad://auth")) return;

  const urlObj = new URL(url);
  const token = urlObj.searchParams.get("token");
  console.log("Token from deep link:", token);

  if (token) {
    sessionToken.value = token;
    fetchUserInternal(token);
  }
}

// Register listeners eagerly at module load
if (IS_TAURI) {
  (async () => {
    const { onOpenUrl } = await import("@tauri-apps/plugin-deep-link");
    const { listen } = await import("@tauri-apps/api/event");

    await onOpenUrl((urls) => {
      console.log("onOpenUrl fired:", urls);
      handleDeepLinkUrl(urls[0]);
    });

    await listen<string[]>("deep-link-received", (event) => {
      console.log("deep-link-received fired:", event.payload);
      handleDeepLinkUrl(event.payload[0]);
    });

    console.log("✅ Deep link listeners registered");
  })();
}

export function useAuth() {
  async function signIn(provider: "google") {
    loading.value = true;
    try {
      if (IS_TAURI) {
        const { openUrl } = await import("@tauri-apps/plugin-opener");
        await openUrl(`${API}/auth/desktop/google`);
      } else {
        const { data, error } = await authClient.signIn.social({
          provider,
          callbackURL: window.location.origin,
        });
        if (error) {
          console.error("Sign-in failed:", error);
          return;
        }
        if (data?.url) window.location.href = data.url;
      }
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await authClient.signOut();
    sessionToken.value = null;
    user.value = null;
    localStorage.removeItem("session_token");
  }

  const isAuthenticated = computed(() => !!user.value);

  if (!initialized.value) {
    fetchUserInternal();
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    fetchUser: fetchUserInternal,
    signInWithGoogle: () => signIn("google"),
    logout,
  };
}
