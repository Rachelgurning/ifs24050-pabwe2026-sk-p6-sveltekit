import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import process from "process";
import { DELETE, GET, PATCH, POST, PUT } from "./+server";

const call = (handler: any, path: string, init: RequestInit = {}, search = "") =>
  handler({
    request: new Request(`http://localhost/api/v1/${path}${search}`, init),
    params: { path },
    url: new URL(`http://localhost/api/v1/${path}${search}`),
  }) as Promise<Response>;

describe("proxy /api/v1", () => {
  beforeEach(() => {
    delete process.env.DELCOM_API_UPSTREAM;
  });
  afterEach(() => vi.unstubAllGlobals());

  it("meneruskan GET ke upstream bawaan beserta header & query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{"status":"success"}', { status: 200, headers: { "content-type": "application/json; charset=utf-8" } })
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = await call(GET, "courses", { headers: { Authorization: "Bearer t", Accept: "application/json" } }, "?is_me=1");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(await res.json()).toEqual({ status: "success" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://open-api.delcom.org/api/v1/courses?is_me=1");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(init.headers.get("authorization")).toBe("Bearer t");
    expect(init.headers.get("accept")).toBe("application/json");
    expect(init.headers.get("content-type")).toBeNull();
  });

  it("memakai DELCOM_API_UPSTREAM (tanpa slash akhir) dan meneruskan body", async () => {
    process.env.DELCOM_API_UPSTREAM = "http://upstream.test/v9/";
    const fetchMock = vi.fn().mockResolvedValue(new Response("x", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await call(POST, "auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
    });
    expect(res.status).toBe(201);
    expect(res.headers.get("content-type")).toBe("text/plain;charset=UTF-8");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://upstream.test/v9/auth/login");
    expect(init.headers.get("content-type")).toBe("application/json");
    expect(new TextDecoder().decode(init.body)).toBe('{"a":1}');
  });

  it("memberi content-type JSON bawaan bila upstream tidak mengirimnya", async () => {
    const upstream = new Response(null, { status: 204 });
    upstream.headers.delete("content-type");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(upstream));
    const res = await call(DELETE, "courses/1", { method: "DELETE" });
    expect(res.status).toBe(204);
    expect(res.headers.get("content-type")).toBe("application/json");
  });

  it("mendukung PUT dan PATCH", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await call(PUT, "courses/1", { method: "PUT", body: "{}" });
    await call(PATCH, "courses/1", { method: "PATCH", body: "{}" });
    expect(fetchMock.mock.calls.map(([, i]) => i.method)).toEqual(["PUT", "PATCH"]);
  });

  it("menolak path traversal", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await call(GET, "../secret");
    expect(res.status).toBe(400);
    expect((await res.json()).status).toBe("error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mengembalikan 502 saat upstream tidak terjangkau", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const res = await call(GET, "courses");
    expect(res.status).toBe(502);
    expect((await res.json()).message).toMatch(/tidak dapat terhubung/i);
  });
});
