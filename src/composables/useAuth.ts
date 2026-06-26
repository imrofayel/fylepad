import { ref, computed, watch } from "vue";
import { createAuthClient } from "better-auth/vue";
import { bearer } from "better-auth/plugins";
import { setCloudMode, IS_TAURI } from "@/lib/editorDb";
import { initializeEditorStore, reinitializeEditorStore } from "@/composables/useEditor";

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
  // Session tokens are not used in local desktop mode
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
  if (IS_TAURI) {
    if (!initialized.value) {
      await initializeEditorStore();
      initialized.value = true;
      loading.value = false;
    }
    return;
  }

  loading.value = true;
  try {
    const { data, error } = await authClient.getSession();
    const newUser = error ? null : (data?.user ?? null);
    const wasAuthenticated = !!user.value;
    const isNowAuthenticated = !!newUser;

    user.value = newUser;

    // On initial load (browser): set cloud mode based on auth, then init editor store once
    // On login transition: switch to cloud mode and reinitialize
    if (!wasAuthenticated && isNowAuthenticated) {
      setCloudMode(true);
    }

    if (!initialized.value) {
      // First load — init editor store after auth is known
      await initializeEditorStore();
    } else if (!wasAuthenticated && isNowAuthenticated) {
      // Login transition — reinitialize from cloud
      await reinitializeEditorStore();
    }
  } finally {
    loading.value = false;
    initialized.value = true;
  }
}

// Deep linking for auth is not required in Tauri local mode

export function useAuth() {
  async function signIn(provider: "google") {
    loading.value = true;
    try {
      if (IS_TAURI) {
        console.warn("Authentication is not supported in local desktop mode");
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
      user.value = null;
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
