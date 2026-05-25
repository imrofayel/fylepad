const API = import.meta.env.VITE_BACKEND_API;

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    const msg = body?.message || body?.error || `Request failed (${status})`;
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  get isConflict() {
    return this.status === 409;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API}${path}`);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const init: RequestInit = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), init);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json);
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, query?: Record<string, string>) =>
    request<T>("GET", path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string, body?: unknown, query?: Record<string, string>) =>
    request<T>("DELETE", path, body, query),
};
