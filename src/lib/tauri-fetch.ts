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

export function patchFetchForTauri() {
  if (!isTauri()) return;

  const originalFetch = window.fetch;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (isAiRequest(input)) {
      const newInit: RequestInit = {
        ...init,
        headers: {
          ...init?.headers,
        },
      };

      if (newInit.headers && typeof newInit.headers === "object") {
        const headers = newInit.headers as Record<string, string>;
        delete headers["user-agent"];
        delete headers["User-Agent"];
      }

      return originalFetch(input, newInit);
    }

    return originalFetch(input, init);
  };
}
