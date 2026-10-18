import { get } from "svelte/store";
import { expect, it } from "vitest";
import { setUsers, users } from "./userStore";

it("menyimpan daftar pengguna", () => {
  setUsers([{ id: 1, name: "A", email: "a@a.com" }]);
  expect(get(users)).toHaveLength(1);
});
