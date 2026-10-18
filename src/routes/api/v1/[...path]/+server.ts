import process from "process";
import type { RequestHandler } from "./$types";

const DEFAULT_UPSTREAM = "https://open-api.delcom.org/api/v1";
const FORWARDED_HEADERS = ["authorization", "content-type", "accept"];

const failure = (message: string, status: number) =>
  new Response(JSON.stringify({ status: "error", message, data: null }), {
    status,
    headers: { "content-type": "application/json" },
  });

/**
 * Proxy same-origin ke Delcom Open API. Browser memanggil `/api/v1/*` sehingga
 * tidak ada request lintas-origin/preflight CORS (Lighthouse: "Authorization will
 * not be covered by the wildcard symbol (*) in CORS Access-Control-Allow-Headers").
 */
const proxy: RequestHandler = async ({ request, params, url }) => {
  if (params.path.split("/").includes("..")) {
    return failure("Path tidak valid.", 400);
  }

  const upstream = (process.env.DELCOM_API_UPSTREAM || DEFAULT_UPSTREAM).replace(/\/+$/, "");
  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const response = await fetch(`${upstream}/${params.path}${url.search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
    });
    return new Response(response.body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return failure("Tidak dapat terhubung ke server Delcom.", 502);
  }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
