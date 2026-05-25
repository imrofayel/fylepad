import { ref, computed, watch } from "vue";
import { createAuthClient } from "better-auth/vue";
import { bearer } from "better-auth/plugins";
import { setCloudMode, IS_TAURI } from "@/lib/editorDb";
import { reinitializeEditorStore } from "@/composables/useEditor";

const API = import.meta.env.VITE_BACKEND_API;

export const authClient = createAuthClient({
  baseURL: API,
  basePath: "/auth",
  plugins: [bearer()],
});

const user = ref<any>(null);
const loading = ref(false);
const initialized = ref(false);
const sessionToken = ref<string | null>(IS_TAURI ? localStorage.getItem("session_token") : null);

if (IS_TAURI) {
  watch(sessionToken, (val) => {
    if (val) localStorage.setItem("session_token", val);
    else localStorage.removeItem("session_token");
  });
}

function getBearerAuthOptions(token?: string | null) {
  const t = token ?? sessionToken.value;

  if (!t) return undefined;

  return {
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${t}`,
      },
    },
  };
}

function getProfileRequestInit(): RequestInit {
  if (IS_TAURI) {
    const authOptions = getBearerAuthOptions();
    return authOptions ? authOptions.fetchOptions : {};
  }

  return {
    credentials: "include",
  };
}

async function fetchUserInternal(token?: string | null) {
  loading.value = true;
  try {
    const options = IS_TAURI ? getBearerAuthOptions(token) : undefined;

    const { data, error } = await authClient.getSession(options);
    const newUser = error ? null : (data?.user ?? null);
    const wasAuthenticated = !!user.value;
    const isNowAuthenticated = !!newUser;

    user.value = newUser;

    // Switch storage mode on auth state change (browser only)
    if (!IS_TAURI) {
      if (!wasAuthenticated && isNowAuthenticated) {
        setCloudMode(true);
        await reinitializeEditorStore();
      }
    }
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

  async function updatePhoto(file: File) {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`${API}/me/profile`, {
      method: "POST",
      ...getProfileRequestInit(),
      body: formData,
    });

    let payload: { url?: string; error?: string; details?: string } | null = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.details || payload?.error || `Upload failed (${response.status})`);
    }

    if (!payload?.url) {
      throw new Error("Upload succeeded, but no image URL was returned");
    }

    if (user.value) {
      const separator = payload.url.includes("?") ? "&" : "?";
      user.value.image = `${payload.url}${separator}t=${Date.now()}`;
    }

    return payload.url;
  }

  async function logout() {
    if (IS_TAURI) {
      await authClient.signOut(getBearerAuthOptions());
      sessionToken.value = null;
      localStorage.removeItem("session_token");
    } else {
      await authClient.signOut();

      // Switch back to local storage mode
      setCloudMode(false);
      await reinitializeEditorStore();
    }

    sessionToken.value = null;
    user.value = null;
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
    updatePhoto,
    signInWithGoogle: () => signIn("google"),
    logout,
  };
}
