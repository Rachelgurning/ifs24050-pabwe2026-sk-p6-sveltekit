import { waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { demoProfile, fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

describe("AuthSessionRedirect", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("tidak mengalihkan dan tidak memanggil API tanpa token", async () => {
    const fetchMock = mockFetch(() => ok());
    renderWithProviders(AuthSessionRedirect);
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengalihkan ke beranda setelah token, status login, dan profil siap", async () => {
    mockFetch(() => ok({ user: demoProfile }));
    renderWithProviders(AuthSessionRedirect, { token: "tok" });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("tidak mengalihkan bila token tidak valid", async () => {
    const fetchMock = mockFetch(() => fail("Unauthenticated."));
    renderWithProviders(AuthSessionRedirect, { token: "basi" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await Promise.resolve();
    expect(goto).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
