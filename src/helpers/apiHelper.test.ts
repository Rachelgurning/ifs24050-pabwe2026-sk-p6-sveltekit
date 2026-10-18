import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiRequest,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";
import { mockFetch, ok } from "../test-utils";

describe("apiHelper", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("mengirim GET dengan header Authorization bila token ada", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch(() => ok({ a: 1 }, "Halo"));
    const result = await apiRequest("/x");
    expect(result).toEqual({ success: true, message: "Halo", data: { a: 1 } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/x`);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.body).toBeUndefined();
  });

  it("tidak mengirim Authorization bila auth=false atau token kosong", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch(() => ok());
    await apiRequest("/x", { auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    localStorage.clear();
    await apiRequest("/x");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim badan JSON", async () => {
    const fetchMock = mockFetch(() => ok());
    await apiRequest("/x", { method: "POST", body: { a: 1 } });
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe('{"a":1}');
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    const fetchMock = mockFetch(() => ok());
    const formData = new FormData();
    await apiRequest("/x", { method: "POST", formData });
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(formData);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("menandai gagal bila status bukan success dan memberi pesan kosong bawaan", async () => {
    mockFetch(() => ({ status: "fail" }));
    expect(await apiRequest("/x")).toEqual({ success: false, message: "", data: undefined });
  });

  it("mengembalikan hasil gagal saat jaringan bermasalah", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await apiRequest("/x");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/tidak dapat terhubung/i);
  });
});
