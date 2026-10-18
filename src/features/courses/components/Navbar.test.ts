import { screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import { goto } from "$app/navigation";
import Navbar from "./Navbar.svelte";
import { demoProfile, renderWithProviders } from "../../../test-utils";
import { get } from "svelte/store";
import { isProfile } from "../../auth/states/authStore";

describe("Navbar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan logo dan menyembunyikan profil saat belum ada sesi", () => {
    renderWithProviders(Navbar);
    expect(screen.getByRole("link", { name: /delcom courses/i })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: /abdullah/i })).not.toBeInTheDocument();
  });

  it("menampilkan inisial bila pengguna tidak punya foto", () => {
    renderWithProviders(Navbar, { profile: demoProfile });
    expect(screen.getByRole("link", { name: /abdullah ubaid/i })).toHaveAttribute("href", "/profile");
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("menampilkan foto profil bila tersedia", () => {
    const { container } = renderWithProviders(Navbar, {
      profile: { ...demoProfile, photo: "https://x.test/p.png" },
    });
    expect(container.querySelector("img")).toHaveAttribute("src", "https://x.test/p.png");
  });

  it("keluar setelah dikonfirmasi lalu menuju halaman masuk", async () => {
    renderWithProviders(Navbar, { profile: demoProfile });
    screen.getByRole("button", { name: /keluar/i }).click();
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(get(isProfile)).toBe(false);
  });

  it("tidak keluar bila konfirmasi dibatalkan", async () => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    renderWithProviders(Navbar, { profile: demoProfile });
    screen.getByRole("button", { name: /keluar/i }).click();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(goto).not.toHaveBeenCalled();
    expect(get(isProfile)).toBe(true);
  });
});
