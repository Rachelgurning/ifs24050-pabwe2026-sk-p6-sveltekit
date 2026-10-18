import { screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import ContentPage from "./ContentPage.svelte";
import { demoProfile, fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

const fire = vi.mocked(Swal.fire);
const lastIcon = () => (fire.mock.calls.at(-1)![0] as any).icon;

const content = (extra = {}) => ({
  id: 4,
  course_id: 3,
  title: "Dasar Java",
  youtube: "https://youtu.be/uHyfQV0kbgo",
  my_status_finished: false,
  ...extra,
});

const props = { courseId: "3", contentId: "4" };

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("ContentPage", () => {
  it("menampilkan pemutar YouTube tanpa cookie untuk tautan yang valid", async () => {
    mockFetch(() => ok({ course_content: content() }));
    const { container } = renderWithProviders(ContentPage, { props, profile: demoProfile });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat materi");
    expect(await screen.findByRole("heading", { level: 1, name: "Dasar Java" })).toBeInTheDocument();
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/uHyfQV0kbgo");
    expect(frame).toHaveAttribute("title", "Video materi: Dasar Java");
    expect(screen.getByRole("link", { name: /kembali ke kursus/i })).toHaveAttribute("href", "/courses/3");
    expect(screen.getByText("Status: Belum selesai")).toBeInTheDocument();
  });

  it("menawarkan tautan asli bila tautan video tidak dikenali", async () => {
    mockFetch(() => ok({ course_content: content({ youtube: "https://example.com/video" }) }));
    const { container } = renderWithProviders(ContentPage, { props, profile: demoProfile });
    const link = await screen.findByRole("link", { name: "Buka tautan asli" });
    expect(link).toHaveAttribute("href", "https://example.com/video");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("menampilkan pesan galat bila materi gagal dimuat", async () => {
    mockFetch(() => fail("Konten tidak ditemukan"));
    renderWithProviders(ContentPage, { props, profile: demoProfile });
    expect(await screen.findByRole("alert")).toHaveTextContent("Konten tidak ditemukan");
  });

  it("menandai materi selesai (status 1) lalu memuat ulang", async () => {
    let finished = false;
    const fetchMock = mockFetch((url, init) => {
      if (init.method === "POST") {
        finished = true;
        return ok(undefined, "Berhasil mengubah status");
      }
      return ok({ course_content: content({ my_status_finished: finished }) });
    });
    renderWithProviders(ContentPage, { props, profile: demoProfile });
    (await screen.findByRole("button", { name: /tandai selesai/i })).click();
    expect(await screen.findByText("Status: Selesai dipelajari")).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, init]) => init.method === "POST")!;
    expect(post[0]).toBe(`${DELCOM_BASEURL}/courses/-/contents/4/learns`);
    expect(post[1].body).toBe('{"status":1}');
    expect(screen.getByRole("button", { name: /tandai belum selesai/i })).toBeInTheDocument();
    await waitFor(() => expect(lastIcon()).toBe("success"));
  });

  it("mengirim status 0 saat materi yang selesai ditandai belum selesai", async () => {
    const fetchMock = mockFetch((url, init) =>
      init.method === "POST" ? ok() : ok({ course_content: content({ my_status_finished: true }) })
    );
    renderWithProviders(ContentPage, { props, profile: demoProfile });
    (await screen.findByRole("button", { name: /tandai belum selesai/i })).click();
    await waitFor(() => expect(fetchMock.mock.calls.some(([, i]) => i.method === "POST")).toBe(true));
    const post = fetchMock.mock.calls.find(([, init]) => init.method === "POST")!;
    expect(post[1].body).toBe('{"status":0}');
  });

  it("menampilkan galat bila pembaruan status gagal", async () => {
    mockFetch((url, init) =>
      init.method === "POST" ? fail("Anda belum menjadi peserta") : ok({ course_content: content() })
    );
    renderWithProviders(ContentPage, { props, profile: demoProfile });
    (await screen.findByRole("button", { name: /tandai selesai/i })).click();
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(screen.getByRole("button", { name: /tandai selesai/i })).toBeEnabled();
  });
});
