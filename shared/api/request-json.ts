const apiUrl = (path: string) => `/api/backend${path}`;

type ApiErrorPayload = {
  error?: unknown;
};

export async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as ApiErrorPayload).error)
        : `Backend request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
