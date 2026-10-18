import { fireEvent, screen, waitFor, within } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import { goto } from "$app/navigation";
import DetailPage from "./DetailPage.svelte";
import { markMutation } from "../states/coursesStore";
import { demoProfile, fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

const fire = vi.mocked(Swal.fire);
const lastIcon = () => (fire.mock.calls.at(-1)![0] as any).icon;

const detail = (extra: Record<string, unknown> = {}) => ({
  id: 3,
  user_id: 1,
  title: "Dasar C",
  cover: "https://x.test/c.png",
  description: "Belajar dasar C dari awal",
  created_at: "2024-10-06T00:40:35.000000Z",
  author: { name: "Ubaid" },
  students: [],
  contents: [
    { id: 1, course_id: 3, title: "Pengenalan", youtube: "https://youtu.be/uHyfQV0kbgo", my_status_finished: true },
    { id: 2, course_id: 3, title: "Variabel", youtube: "https://youtu.be/uHyfQV0kbgo", my_status_finished: false },
  ],
  total_contents: 2,
  ratings: [{ name: "Budi", ratings: 4, comment: "Keren kali kursusnya" }],
  avg_ratings: "4.00",
  my_percentage_finished: "50.00",
  ...extra,
});

/** Peran ditentukan lewat user_id dan students terhadap profil id 1. */
const OWNER = {};
const STUDENT = { user_id: 2, students: [1] };
const VISITOR = { user_id: 2, students: [5] };

function api(course: unknown, mutationResult: unknown = ok(undefined, "Berhasil")) {
  return mockFetch((url, init) => (init.method === "GET" ? ok({ course }) : mutationResult));
}
const gets = (m: ReturnType<typeof api>) => m.mock.calls.filter(([, init]) => init.method === "GET");
const props = { courseId: "3" };

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("DetailPage - umum", () => {
  it("menampilkan status memuat lalu detail kursus", async () => {
    api(detail(OWNER));
    renderWithProviders(DetailPage, { props, profile: demoProfile });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat kursus");
    expect(await screen.findByRole("heading", { level: 1, name: "Dasar C" })).toBeInTheDocument();
    expect(screen.getByAltText("Sampul kursus Dasar C")).toHaveAttribute("src", "https://x.test/c.png");
    expect(screen.getByText("4.0")).toBeInTheDocument();
    expect(screen.getByText("Pemilik")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /semua kursus/i })).toHaveAttribute("href", "/");
  });

  it("menampilkan nilai bawaan saat sampul, penulis, dan rating kosong", async () => {
    api(detail({ ...OWNER, cover: null, author: undefined, avg_ratings: null, contents: [], ratings: [] }));
    const { container } = renderWithProviders(DetailPage, { props, profile: demoProfile });
    expect(await screen.findByText(/oleh Tanpa nama/)).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("Belum ada materi.")).toBeInTheDocument();
    expect(screen.getByText("Belum ada ulasan.")).toBeInTheDocument();
  });

  it("menampilkan pesan galat bila kursus gagal dimuat", async () => {
    mockFetch(() => fail("Kursus tidak ditemukan"));
    renderWithProviders(DetailPage, { props, profile: demoProfile });
    expect(await screen.findByRole("alert")).toHaveTextContent("Kursus tidak ditemukan");
  });

  it("memuat kursus lain saat courseId berubah", async () => {
    const fetchMock = api(detail(OWNER));
    const { rerender } = renderWithProviders(DetailPage, { props, profile: demoProfile });
    await screen.findByText("Dasar C");
    await rerender({ courseId: "8" });
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    expect(gets(fetchMock)[1][0]).toBe(`${DELCOM_BASEURL}/courses/8`);
  });

  it("memuat ulang saat bendera mutasi menyala", async () => {
    const fetchMock = api(detail(OWNER));
    renderWithProviders(DetailPage, { props, profile: demoProfile });
    await screen.findByText("Dasar C");
    markMutation("rating");
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
  });
});

describe("DetailPage - pemilik", () => {
  const setup = async (mutationResult?: unknown) => {
    const fetchMock = api(detail(OWNER), mutationResult);
    renderWithProviders(DetailPage, { props, profile: demoProfile });
    await screen.findByText("Dasar C");
    return fetchMock;
  };
  const methods = (m: ReturnType<typeof api>) => m.mock.calls.map(([url, init]) => `${init.method} ${url.replace(DELCOM_BASEURL, "")}`);

  it("menampilkan kontrol pemilik dan tautan materi", async () => {
    await setup();
    expect(screen.getByRole("button", { name: /ubah data/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ubah sampul/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hapus kursus/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ikuti kursus/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pengenalan/i })).toHaveAttribute("href", "/courses/3/contents/1");
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.queryByLabelText("Komentar")).not.toBeInTheDocument();
  });

  it("membuka modal ubah data, ubah sampul, dan tambah konten", async () => {
    await setup();
    screen.getByRole("button", { name: /ubah data/i }).click();
    let dialog = await screen.findByRole("dialog", { name: "Ubah Data Kursus" });
    expect(within(dialog).getByLabelText("Judul kursus")).toHaveValue("Dasar C");
    within(dialog).getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    screen.getByRole("button", { name: /ubah sampul/i }).click();
    dialog = await screen.findByRole("dialog", { name: "Ubah Sampul Kursus" });
    within(dialog).getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    screen.getByRole("button", { name: /tambah konten/i }).click();
    dialog = await screen.findByRole("dialog", { name: "Tambah Konten" });
    within(dialog).getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("membuka modal ubah konten dengan data materi", async () => {
    await setup();
    screen.getByRole("button", { name: "Ubah konten Variabel" }).click();
    const dialog = await screen.findByRole("dialog", { name: "Ubah Konten" });
    expect(within(dialog).getByLabelText("Judul materi")).toHaveValue("Variabel");
  });

  it("mengunggah sampul dari halaman detail", async () => {
    const fetchMock = await setup();
    screen.getByRole("button", { name: /ubah sampul/i }).click();
    const input = await screen.findByLabelText("Berkas gambar");
    Object.defineProperty(input, "files", { value: [new File(["x"], "c.png", { type: "image/png" })], configurable: true });
    await fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(methods(fetchMock)).toContain("POST /courses/3/cover"));
  });

  it("menambah dan mengubah konten dari halaman detail", async () => {
    const fetchMock = await setup();
    screen.getByRole("button", { name: /tambah konten/i }).click();
    await fireEvent.input(await screen.findByLabelText("Judul materi"), { target: { value: "Baru" } });
    await fireEvent.input(screen.getByLabelText("Tautan YouTube"), { target: { value: "https://youtu.be/uHyfQV0kbgo" } });
    await fireEvent.submit(screen.getByLabelText("Judul materi").closest("form")!);
    await waitFor(() => expect(methods(fetchMock)).toContain("POST /courses/3/contents"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    screen.getByRole("button", { name: "Ubah konten Variabel" }).click();
    await fireEvent.submit((await screen.findByLabelText("Judul materi")).closest("form")!);
    await waitFor(() => expect(methods(fetchMock)).toContain("PUT /courses/-/contents/2"));
  });

  it("menghapus kursus lalu kembali ke beranda", async () => {
    const fetchMock = await setup();
    screen.getByRole("button", { name: /hapus kursus/i }).click();
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(methods(fetchMock)).toContain("DELETE /courses/3");
  });

  it("tidak menghapus kursus bila konfirmasi ditolak", async () => {
    const fetchMock = await setup();
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    screen.getByRole("button", { name: /hapus kursus/i }).click();
    await waitFor(() => expect(fire).toHaveBeenCalled());
    await Promise.resolve();
    expect(methods(fetchMock)).not.toContain("DELETE /courses/3");
    expect(goto).not.toHaveBeenCalled();
  });

  it("menampilkan galat bila hapus kursus gagal", async () => {
    await setup(fail("Tidak berwenang"));
    screen.getByRole("button", { name: /hapus kursus/i }).click();
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(goto).not.toHaveBeenCalled();
  });

  it("menghapus konten dan memuat ulang", async () => {
    const fetchMock = await setup();
    screen.getByRole("button", { name: "Hapus konten Variabel" }).click();
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    expect(methods(fetchMock)).toContain("DELETE /courses/-/contents/2");
  });

  it("tidak menghapus konten bila konfirmasi ditolak", async () => {
    const fetchMock = await setup();
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    screen.getByRole("button", { name: "Hapus konten Variabel" }).click();
    await waitFor(() => expect(fire).toHaveBeenCalled());
    await Promise.resolve();
    expect(methods(fetchMock).some((m) => m.startsWith("DELETE"))).toBe(false);
  });

  it("menampilkan galat bila hapus konten gagal", async () => {
    await setup(fail("Gagal menghapus konten"));
    screen.getByRole("button", { name: "Hapus konten Variabel" }).click();
    await waitFor(() => expect(lastIcon()).toBe("error"));
  });
});

describe("DetailPage - peserta", () => {
  const setup = async (mutationResult?: unknown) => {
    const fetchMock = api(detail(STUDENT), mutationResult);
    renderWithProviders(DetailPage, { props, profile: demoProfile });
    await screen.findByText("Dasar C");
    return fetchMock;
  };

  it("menampilkan progres, rating, dan tombol keluar tanpa kontrol pemilik", async () => {
    await setup();
    expect(screen.getByText("Peserta", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByLabelText(/progres belajar: 50.00%/i)).toHaveValue(50);
    expect(screen.getByRole("button", { name: /keluar dari kursus/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ubah data/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /tambah konten/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /variabel/i })).toBeInTheDocument();
  });

  it("keluar dari kursus setelah konfirmasi", async () => {
    const fetchMock = await setup();
    screen.getByRole("button", { name: /keluar dari kursus/i }).click();
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    const del = fetchMock.mock.calls.find(([, init]) => init.method === "DELETE")!;
    expect(del[0]).toBe(`${DELCOM_BASEURL}/courses/3/students`);
  });

  it("tetap menjadi peserta bila konfirmasi keluar ditolak", async () => {
    const fetchMock = await setup();
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    screen.getByRole("button", { name: /keluar dari kursus/i }).click();
    await waitFor(() => expect(fire).toHaveBeenCalled());
    await Promise.resolve();
    expect(fetchMock.mock.calls.some(([, init]) => init.method === "DELETE")).toBe(false);
  });

  it("mengirim rating dan komentar", async () => {
    const fetchMock = await setup();
    await fireEvent.change(screen.getByLabelText("Rating (1 sampai 5)"), { target: { value: "3" } });
    await fireEvent.input(screen.getByLabelText("Komentar"), { target: { value: "Cukup bagus" } });
    await fireEvent.submit(screen.getByRole("button", { name: /kirim rating/i }).closest("form")!);
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    const put = fetchMock.mock.calls.find(([, init]) => init.method === "PUT")!;
    expect(put[0]).toBe(`${DELCOM_BASEURL}/courses/3/students/ratings`);
    expect(put[1].body).toBe('{"ratings":3,"comment":"Cukup bagus"}');
  });

  it("menampilkan galat bila rating gagal dikirim", async () => {
    await setup(fail("Rating tidak valid"));
    await fireEvent.input(screen.getByLabelText("Komentar"), { target: { value: "x" } });
    await fireEvent.submit(screen.getByRole("button", { name: /kirim rating/i }).closest("form")!);
    await waitFor(() => expect(lastIcon()).toBe("error"));
  });
});

describe("DetailPage - pengunjung", () => {
  const setup = async (mutationResult?: unknown) => {
    const fetchMock = api(detail(VISITOR), mutationResult);
    renderWithProviders(DetailPage, { props, profile: demoProfile });
    await screen.findByText("Dasar C");
    return fetchMock;
  };

  it("menampilkan materi terkunci dan tombol ikuti kursus", async () => {
    await setup();
    expect(screen.getByText("Tamu")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /pengenalan/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("(ikuti kursus untuk membuka)")).toHaveLength(2);
    expect(screen.queryByLabelText("Komentar")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/progres belajar/i)).not.toBeInTheDocument();
  });

  it("mengikuti kursus lalu memuat ulang", async () => {
    const fetchMock = await setup();
    screen.getByRole("button", { name: /ikuti kursus/i }).click();
    await waitFor(() => expect(gets(fetchMock)).toHaveLength(2));
    const post = fetchMock.mock.calls.find(([, init]) => init.method === "POST")!;
    expect(post[0]).toBe(`${DELCOM_BASEURL}/courses/3/students`);
  });

  it("menampilkan galat bila gagal mengikuti kursus", async () => {
    await setup(fail("Gagal mengikuti"));
    screen.getByRole("button", { name: /ikuti kursus/i }).click();
    await waitFor(() => expect(lastIcon()).toBe("error"));
  });
});
