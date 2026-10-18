import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import AddModal from "./AddModal.svelte";
import ChangeModal from "./ChangeModal.svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import ContentModal from "./ContentModal.svelte";
import { mutations } from "../states/coursesStore";
import { fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

const fire = vi.mocked(Swal.fire);
const lastIcon = () => (fire.mock.calls.at(-1)![0] as any).icon;
const submit = (name: RegExp | string) =>
  fireEvent.submit(screen.getByRole("button", { name }).closest("form")!);

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("AddModal", () => {
  const fill = async () => {
    await fireEvent.input(screen.getByLabelText("Judul kursus"), { target: { value: "Baru" } });
    await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: "Deskripsi" } });
  };

  it("menambah kursus, menyalakan bendera, dan menutup dialog", async () => {
    const onClose = vi.fn();
    const fetchMock = mockFetch(() => ok(undefined, "Berhasil menambah"));
    renderWithProviders(AddModal, { props: { onClose } });
    await fill();
    await submit("Tambah");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].body).toBe('{"title":"Baru","description":"Deskripsi"}');
    expect(get(mutations).course).toBe(true);
    await waitFor(() => expect(lastIcon()).toBe("success"));
  });

  it("menampilkan galat dan tetap membuka dialog saat gagal", async () => {
    const onClose = vi.fn();
    mockFetch(() => fail("Data tidak valid"));
    renderWithProviders(AddModal, { props: { onClose } });
    await fill();
    await submit("Tambah");
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onClose).not.toHaveBeenCalled();
    expect(get(mutations).course).toBe(false);
  });
});

describe("ChangeModal", () => {
  const course = { id: 5, user_id: 1, title: "Lama", description: "Desk lama", students: [] };

  it("mengubah kursus dengan data awal terisi", async () => {
    const onClose = vi.fn();
    const fetchMock = mockFetch(() => ok(undefined, "Berhasil mengubah"));
    renderWithProviders(ChangeModal, { props: { course, onClose } });
    expect(screen.getByLabelText("Judul kursus")).toHaveValue("Lama");
    await fireEvent.input(screen.getByLabelText("Judul kursus"), { target: { value: "Baru" } });
    await submit("Simpan");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/courses/5`);
    expect(init.method).toBe("PUT");
    expect(get(mutations).course).toBe(true);
  });

  it("menampilkan galat saat gagal", async () => {
    const onClose = vi.fn();
    mockFetch(() => fail());
    renderWithProviders(ChangeModal, { props: { course, onClose } });
    await submit("Simpan");
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ChangeCoverModal", () => {
  const withFile = (files: File[]) =>
    Object.defineProperty(screen.getByLabelText("Berkas gambar"), "files", { value: files, configurable: true });

  it("memperingatkan bila belum ada berkas", async () => {
    const fetchMock = mockFetch(() => ok());
    renderWithProviders(ChangeCoverModal, { props: { courseId: 4, onClose: vi.fn() } });
    withFile([]);
    await submit("Unggah");
    await waitFor(() => expect(lastIcon()).toBe("warning"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mengunggah sampul lalu menutup dialog", async () => {
    const onClose = vi.fn();
    const fetchMock = mockFetch(() => ok(undefined, "Berhasil mengubah cover"));
    renderWithProviders(ChangeCoverModal, { props: { courseId: 4, onClose } });
    const file = new File(["x"], "c.png", { type: "image/png" });
    withFile([file]);
    await submit("Unggah");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/courses/4/cover`);
    expect(get(mutations).cover).toBe(true);
  });

  it("menampilkan galat saat unggah gagal", async () => {
    const onClose = vi.fn();
    mockFetch(() => fail("Ukuran terlalu besar"));
    renderWithProviders(ChangeCoverModal, { props: { courseId: 4, onClose } });
    withFile([new File(["x"], "c.png", { type: "image/png" })]);
    await submit("Unggah");
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ContentModal", () => {
  const fill = async (title: string, youtube: string) => {
    await fireEvent.input(screen.getByLabelText("Judul materi"), { target: { value: title } });
    await fireEvent.input(screen.getByLabelText("Tautan YouTube"), { target: { value: youtube } });
  };

  it("menambah konten ke kursus", async () => {
    const onClose = vi.fn();
    const fetchMock = mockFetch(() => ok({ content_id: 1 }, "Berhasil menambahkan konten"));
    renderWithProviders(ContentModal, { props: { courseId: 3, onClose } });
    expect(screen.getByRole("heading", { name: "Tambah Konten" })).toBeInTheDocument();
    await fill("Intro", "https://youtu.be/uHyfQV0kbgo");
    await submit("Tambah");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/courses/3/contents`);
    expect(init.method).toBe("POST");
    expect(get(mutations).content).toBe(true);
  });

  it("mengubah konten yang ada", async () => {
    const onClose = vi.fn();
    const content = { id: 9, course_id: 3, title: "Lama", youtube: "https://youtu.be/aaaaaaaaaaa", my_status_finished: false };
    const fetchMock = mockFetch(() => ok(undefined, "Berhasil mengubah konten"));
    renderWithProviders(ContentModal, { props: { courseId: 3, content, onClose } });
    expect(screen.getByRole("heading", { name: "Ubah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("Lama");
    await submit("Simpan");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/courses/-/contents/9`);
    expect(init.method).toBe("PUT");
  });

  it("menampilkan galat saat gagal", async () => {
    const onClose = vi.fn();
    mockFetch(() => fail("Tautan tidak valid"));
    renderWithProviders(ContentModal, { props: { courseId: 3, onClose } });
    await fill("Intro", "https://youtu.be/uHyfQV0kbgo");
    await submit("Tambah");
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
