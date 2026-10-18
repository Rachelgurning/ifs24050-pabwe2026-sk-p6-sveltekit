import { afterEach, describe, expect, it, vi } from "vitest";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";
import { mockFetch, ok } from "../../../test-utils";

describe("userApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("memanggil endpoint pengguna dengan metode yang benar", async () => {
    const fetchMock = mockFetch(() => ok({}));
    await getMe();
    await getUsers();
    await putMe({ name: "A", email: "a@a.com" });
    await putPassword({ password: "lama", new_password: "baru" });
    const calls = fetchMock.mock.calls.map(([url, init]) => [url.replace(DELCOM_BASEURL, ""), init.method]);
    expect(calls).toEqual([
      ["/users/me", "GET"],
      ["/users", "GET"],
      ["/users/me", "PUT"],
      ["/users/change-password", "PUT"],
    ]);
    expect(fetchMock.mock.calls[3][1].body).toBe('{"password":"lama","new_password":"baru"}');
  });

  it("mengunggah foto sebagai multipart", async () => {
    const fetchMock = mockFetch(() => ok());
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await postPhoto(file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/users/photo`);
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("photo")).toBe(file);
  });
});
