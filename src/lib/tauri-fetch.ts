function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function patchFetchForTauri() {
  if (!isTauri()) return;

  const originalFetch = window.fetch;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (
      url.includes("/ai") ||
      url.includes("localhost:3008") ||
      url.includes(import.meta.env.VITE_AI_BACKEND_API || "")
    ) {
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
