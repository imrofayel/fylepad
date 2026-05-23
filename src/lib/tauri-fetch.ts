function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function isAiRequest(input: RequestInfo | URL) {
  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.pathname === "/ai" || parsedUrl.pathname.startsWith("/ai/");
  } catch {
    return url === "/ai" || url.startsWith("/ai/");
  }
}

function getTauriBearerToken() {
  try {
    return window.localStorage.getItem("session_token");
  } catch {
    return null;
  }
}

function normalizeHeaders(headers?: HeadersInit) {
  const normalized = new Headers(headers);
  normalized.delete("user-agent");
  normalized.delete("User-Agent");
  return normalized;
}

export function patchFetchForTauri() {
  if (!isTauri()) return;

  const originalFetch = window.fetch;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (isAiRequest(input)) {
      const headers = normalizeHeaders(init?.headers);
      const token = getTauriBearerToken();

      if (token && !headers.has("Authorization") && !headers.has("authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const newInit: RequestInit = {
        ...init,
        headers,
      };

      return originalFetch(input, newInit);
    }

    return originalFetch(input, init);
  };
}
