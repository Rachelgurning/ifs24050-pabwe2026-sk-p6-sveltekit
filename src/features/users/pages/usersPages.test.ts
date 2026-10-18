import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import UsersPage from "./UsersPage.svelte";
import ProfilePage from "./ProfilePage.svelte";
import { profile } from "../../auth/states/authStore";
import { demoProfile, fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

const fire = vi.mocked(Swal.fire);
const lastIcon = () => (fire.mock.calls.at(-1)![0] as any).icon;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("UsersPage", () => {
  it("menampilkan daftar pengguna dengan foto atau inisial", async () => {
    mockFetch(() =>
      ok({
        users: [
          { id: 1, name: "Ani", email: "ani@a.com", photo: "https://x.test/a.png" },
          { id: 2, name: "budi", email: "budi@a.com", photo: null },
        ],
      })
    );
    const { container } = renderWithProviders(UsersPage);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("ani@a.com")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("menampilkan keadaan kosong", async () => {
    mockFetch(() => ok({ users: [] }));
    renderWithProviders(UsersPage);
    expect(await screen.findByText("Belum ada pengguna.")).toBeInTheDocument();
  });

  it("menampilkan pesan galat", async () => {
    mockFetch(() => fail("Tidak berwenang"));
    renderWithProviders(UsersPage);
    expect(await screen.findByRole("alert")).toHaveTextContent("Tidak berwenang");
  });
});

describe("ProfilePage", () => {
  const form = (name: RegExp | string) => screen.getByRole("button", { name }).closest("form")!;

  it("menampilkan data profil, inisial, dan foto", () => {
    renderWithProviders(ProfilePage, { profile: demoProfile });
    expect(screen.getByLabelText("Nama")).toHaveValue("Abdullah Ubaid");
    expect(screen.getByLabelText("Email")).toHaveValue("abdullah@example.com");
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("menampilkan foto saat tersedia", () => {
    renderWithProviders(ProfilePage, { profile: { ...demoProfile, photo: "https://x.test/p.png" } });
    expect(screen.getByAltText("Foto profil saat ini")).toHaveAttribute("src", "https://x.test/p.png");
  });

  it("tetap aman dirender tanpa profil", () => {
    renderWithProviders(ProfilePage);
    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("");
  });

  it("menyimpan data akun lalu menyegarkan profil", async () => {
    const fetchMock = mockFetch((url, init) =>
      init.method === "PUT" ? ok(undefined, "Berhasil mengubah data") : ok({ user: { ...demoProfile, name: "Baru" } })
    );
    renderWithProviders(ProfilePage, { profile: demoProfile });
    await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Baru" } });
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "baru@example.com" } });
    await fireEvent.submit(form("Simpan perubahan"));
    await waitFor(() => expect(lastIcon()).toBe("success"));
    expect(fetchMock.mock.calls[0][1].body).toBe('{"name":"Baru","email":"baru@example.com"}');
    expect(get(profile)?.name).toBe("Baru");
  });

  it("menampilkan galat saat menyimpan data gagal", async () => {
    mockFetch(() => fail("Email sudah dipakai"));
    renderWithProviders(ProfilePage, { profile: demoProfile });
    await fireEvent.submit(form("Simpan perubahan"));
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(get(profile)?.name).toBe("Abdullah Ubaid");
  });

  it("memperingatkan bila foto belum dipilih", async () => {
    const fetchMock = mockFetch(() => ok());
    renderWithProviders(ProfilePage, { profile: demoProfile });
    Object.defineProperty(screen.getByLabelText("Pilih foto baru"), "files", { value: [], configurable: true });
    await fireEvent.submit(form("Unggah foto"));
    await waitFor(() => expect(lastIcon()).toBe("warning"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mengunggah foto lalu menyegarkan profil", async () => {
    const fetchMock = mockFetch((url, init) =>
      init.method === "POST" ? ok(undefined, "Berhasil mengubah foto") : ok({ user: demoProfile })
    );
    renderWithProviders(ProfilePage, { profile: demoProfile });
    const file = new File(["x"], "f.png", { type: "image/png" });
    Object.defineProperty(screen.getByLabelText("Pilih foto baru"), "files", { value: [file], configurable: true });
    await fireEvent.submit(form("Unggah foto"));
    await waitFor(() => expect(lastIcon()).toBe("success"));
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/users/photo`);
  });

  it("mengubah kata sandi lalu mengosongkan isian", async () => {
    const fetchMock = mockFetch(() => ok(undefined, "Berhasil mengubah password"));
    renderWithProviders(ProfilePage, { profile: demoProfile });
    await fireEvent.input(screen.getByLabelText("Kata sandi saat ini"), { target: { value: "lama123" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi baru"), { target: { value: "baru123" } });
    await fireEvent.submit(form("Ubah kata sandi"));
    await waitFor(() => expect(screen.getByLabelText("Kata sandi baru")).toHaveValue(""));
    expect(fetchMock.mock.calls[0][1].body).toBe('{"password":"lama123","new_password":"baru123"}');
  });

  it("mempertahankan isian saat ubah kata sandi gagal", async () => {
    mockFetch(() => fail("Kata sandi salah"));
    renderWithProviders(ProfilePage, { profile: demoProfile });
    await fireEvent.input(screen.getByLabelText("Kata sandi saat ini"), { target: { value: "salah" } });
    await fireEvent.submit(form("Ubah kata sandi"));
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("salah");
  });
});
