import { describe, expect, it } from "vitest";
import { handle, securityHeaders } from "./hooks.server";

describe("hooks.server", () => {
  it("menambahkan header keamanan ke setiap respons", async () => {
    const response = await (handle as any)({
      event: {},
      resolve: async () => new Response("ok"),
    });
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(response.headers.get(name)).toBe(value);
    }
    expect(await response.text()).toBe("ok");
  });
});
