import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isAuthenticated,
  isProfile,
  loadProfile,
  logout,
  myId,
  profile,
  setIsAuth,
  setIsProfile,
  setProfile,
} from "./authStore";
import { demoProfile, fail, mockFetch, ok, resetState } from "../../../test-utils";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";

describe("authStore", () => {
  beforeEach(resetState);
  afterEach(() => vi.unstubAllGlobals());

  it("menyimpan status dan profil serta menurunkan id pengguna", () => {
    expect(get(myId)).toBeUndefined();
    setIsAuth(true);
    setIsProfile(true);
    setProfile(demoProfile);
    expect(get(isAuthenticated)).toBe(true);
    expect(get(isProfile)).toBe(true);
    expect(get(myId)).toBe(1);
  });

  it("logout menghapus token dan mereset semua status", () => {
    putAccessToken("t");
    setIsAuth(true);
    setIsProfile(true);
    setProfile(demoProfile);
    logout();
    expect(getAccessToken()).toBeNull();
    expect(get(isAuthenticated)).toBe(false);
    expect(get(isProfile)).toBe(false);
    expect(get(profile)).toBeNull();
  });

  it("loadProfile menyiapkan status login dan profil bersamaan", async () => {
    mockFetch(() => ok({ user: demoProfile }));
    expect(await loadProfile()).toBe(true);
    expect(get(profile)).toEqual(demoProfile);
    expect(get(isAuthenticated)).toBe(true);
    expect(get(isProfile)).toBe(true);
  });

  it("loadProfile membersihkan sesi saat gagal", async () => {
    putAccessToken("kedaluwarsa");
    mockFetch(() => fail("Unauthenticated."));
    expect(await loadProfile()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(get(isProfile)).toBe(false);
  });
});
