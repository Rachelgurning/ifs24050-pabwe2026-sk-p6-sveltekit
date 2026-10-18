import { createRawSnippet } from "svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goto } from "$app/navigation";
import CourseLayout from "./CourseLayout.svelte";
import { putAccessToken } from "../../../helpers/apiHelper";
import { demoProfile, fail, mockFetch, ok, renderWithProviders, resetState } from "../../../test-utils";

const children = createRawSnippet(() => ({ render: () => "<p>isi halaman</p>" }));

describe("CourseLayout", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("mengarahkan ke halaman masuk bila tidak ada token", async () => {
    renderWithProviders(CourseLayout, { props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi");
    expect(screen.queryByText("isi halaman")).not.toBeInTheDocument();
  });

  it("menampilkan isi setelah profil berhasil dimuat", async () => {
    resetState();
    putAccessToken("tok");
    mockFetch(() => ok({ user: demoProfile }));
    render(CourseLayout, { props: { children } });
    expect(await screen.findByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu utama" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lewati ke konten utama/i })).toHaveAttribute("href", "#main");
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengarahkan ke halaman masuk bila profil gagal dimuat", async () => {
    resetState();
    putAccessToken("kedaluwarsa");
    mockFetch(() => fail("Unauthenticated."));
    render(CourseLayout, { props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("tidak memuat ulang profil bila sesi sudah siap", () => {
    const fetchMock = mockFetch(() => ok({ user: demoProfile }));
    renderWithProviders(CourseLayout, { props: { children }, profile: demoProfile, token: "tok" });
    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
