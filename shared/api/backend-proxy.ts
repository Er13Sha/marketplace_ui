const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

type BackendRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const hopByHopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export async function proxyBackendRequest(
  request: Request,
  context: BackendRouteContext
) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(path.join("/"), BACKEND_URL);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  hopByHopHeaders.forEach((header) => headers.delete(header));

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }
  const location = backendResponse.headers.get("location");
  if (location) {
    responseHeaders.set("location", location);
  }

  const responseCookies =
    (
      backendResponse.headers as Headers & {
        getSetCookie?: () => string[];
      }
    ).getSetCookie?.() ?? [];

  if (responseCookies.length > 0) {
    responseCookies.forEach((cookie) => {
      responseHeaders.append("set-cookie", cookie);
    });
  } else {
    const cookie = backendResponse.headers.get("set-cookie");
    if (cookie) {
      responseHeaders.append("set-cookie", cookie);
    }
  }

  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}
