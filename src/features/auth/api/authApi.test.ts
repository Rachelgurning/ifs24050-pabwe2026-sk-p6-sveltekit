import { afterEach, expect, it, vi } from "vitest";
import { postLogin, postRegister } from "./authApi";
import { mockFetch, ok } from "../../../test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";

afterEach(() => vi.unstubAllGlobals());

it("login dan register dikirim tanpa header Authorization", async () => {
  putAccessToken("lama");
  const fetchMock = mockFetch(() => ok({ token: "t" }));
  const login = await postLogin({ email: "a@a.com", password: "123456" });
  await postRegister({ name: "A", email: "a@a.com", password: "123456" });
  expect(login.data.token).toBe("t");
  const [first, second] = fetchMock.mock.calls;
  expect(first[0]).toBe(`${DELCOM_BASEURL}/auth/login`);
  expect(second[0]).toBe(`${DELCOM_BASEURL}/auth/register`);
  expect(first[1].headers.Authorization).toBeUndefined();
  expect(second[1].method).toBe("POST");
});
