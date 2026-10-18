import { fireEvent, screen, waitFor, within } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import HomePage from "./HomePage.svelte";
import { demoProfile, fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

const list = [
  { id: 1, user_id: 1, title: "Svelte Dasar", description: "Belajar svelte", students: [], author: { name: "Ubaid" } },
  { id: 2, user_id: 2, title: "Dasar C", description: "Bahasa pemrograman", students: [1], author: { name: "Budi" } },
];

const fire = vi.mocked(Swal.fire);
const lastIcon = () => (fire.mock.calls.at(-1)![0] as any).icon;

/** Handler API: GET daftar, selainnya sukses kecuali dikonfigurasi gagal. */
function api(options: { listResult?: unknown; mutationResult?: unknown } = {}) {
  return mockFetch((url, init) => {
    if (init.method === "GET") return options.listResult ?? ok({ courses: list });
    return options.mutationResult ?? ok(undefined, "Berhasil");
  });
}

const gets = (fetchMock: ReturnType<typeof api>) =>
  fetchMock.mock.calls.filter(([, init]) => init.method === "GET");

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("HomePage", () => {
  it("memuat dan menampilkan daftar kursus", async () => {
    api();
    renderWithProviders(HomePage, { profile: demoProfile });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat kursus");
    expect(await screen.findByText("Svelte Dasar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Semua Kursus" })).toBeInTheDocument();
    expect(screen.getByText("Milik saya", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Terdaftar")).toBeInTheDocument();
  });

  it("menampilkan pesan galat bila gagal memuat", async () => {
    api({ listResult: fail("Server bermasalah") });
    renderWithProviders(HomePage, { profile: demoProfile });
    expect(await screen.findByRole("alert")).toHaveTextContent("Server bermasalah");
  });

  it("memfilter dengan pencarian dan menampilkan keadaan kosong", async () => {
    api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    const search = screen.getByLabelText("Cari kursus");
    await fireEvent.input(search, { target: { value: "  pemrograman " } });
    expect(screen.queryByText("Svelte Dasar")).not.toBeInTheDocument();
    expect(screen.getByText("Dasar C")).toBeInTheDocument();
    await fireEvent.input(search, { target: { value: "tidak ada" } });
    expect(screen.getByText("Belum ada kursus yang cocok.")).toBeInTheDocument();
  });

  it("memuat ulang dengan is_me=1 saat filter milik saya dinyalakan", async () => {
    const fetchMock = api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    await fireEvent.click(screen.getByLabelText("Milik saya", { selector: "input" }));
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    expect(gets(fetchMock)[1][0]).toBe(`${DELCOM_BASEURL}/courses?is_me=1`);
  });

  it("membuka dan menutup modal tambah kursus", async () => {
    api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: /tambah kursus/i }).click();
    const dialog = await screen.findByRole("dialog", { name: "Tambah Kursus" });
    within(dialog).getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("memuat ulang daftar setelah kursus berhasil ditambah", async () => {
    const fetchMock = api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: /tambah kursus/i }).click();
    await fireEvent.input(await screen.findByLabelText("Judul kursus"), { target: { value: "Baru" } });
    await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: "Desk" } });
    await fireEvent.submit(screen.getByRole("button", { name: "Tambah" }).closest("form")!);
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("menghapus kursus milik sendiri setelah konfirmasi", async () => {
    const fetchMock = api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: "Hapus kursus Svelte Dasar" }).click();
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    const del = fetchMock.mock.calls.find(([, init]) => init.method === "DELETE")!;
    expect(del[0]).toBe(`${DELCOM_BASEURL}/courses/1`);
  });

  it("membatalkan hapus kursus bila konfirmasi ditolak", async () => {
    const fetchMock = api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    screen.getByRole("button", { name: "Hapus kursus Svelte Dasar" }).click();
    await waitFor(() => expect(fire).toHaveBeenCalled());
    await Promise.resolve();
    expect(fetchMock.mock.calls.some(([, init]) => init.method === "DELETE")).toBe(false);
  });

  it("menampilkan galat bila hapus kursus gagal", async () => {
    api({ mutationResult: fail("Tidak berwenang") });
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: "Hapus kursus Svelte Dasar" }).click();
    await waitFor(() => expect(lastIcon()).toBe("error"));
  });

  it("menghapus semua kursus milik saya setelah konfirmasi", async () => {
    const fetchMock = api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: /hapus semua milik saya/i }).click();
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    const del = fetchMock.mock.calls.find(([, init]) => init.method === "DELETE")!;
    expect(del[0]).toBe(`${DELCOM_BASEURL}/courses`);
  });

  it("membatalkan hapus semua bila konfirmasi ditolak", async () => {
    const fetchMock = api();
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    screen.getByRole("button", { name: /hapus semua milik saya/i }).click();
    await waitFor(() => expect(fire).toHaveBeenCalled());
    await Promise.resolve();
    expect(fetchMock.mock.calls.some(([, init]) => init.method === "DELETE")).toBe(false);
  });

  it("menampilkan galat bila hapus semua gagal", async () => {
    api({ mutationResult: fail("Unauthenticated.") });
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: /hapus semua milik saya/i }).click();
    await waitFor(() => expect(lastIcon()).toBe("error"));
  });

  it("menyembunyikan tombol hapus semua bila tidak punya kursus", async () => {
    api({ listResult: ok({ courses: [list[1]] }) });
    renderWithProviders(HomePage, { profile: demoProfile });
    await screen.findByText("Dasar C");
    expect(screen.queryByRole("button", { name: /hapus semua/i })).not.toBeInTheDocument();
  });
});
