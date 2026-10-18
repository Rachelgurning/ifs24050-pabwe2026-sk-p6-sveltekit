import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  getYoutubeId,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

const fire = vi.mocked(Swal.fire);

describe("toolsHelper", () => {
  beforeEach(() => fire.mockClear());

  it("menampilkan dialog sukses, galat, dan peringatan", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("bad");
    await showWarningDialog("warn");
    expect(fire.mock.calls.map((c) => (c[0] as any).icon)).toEqual(["success", "error", "warning"]);
    expect((fire.mock.calls[0][0] as any).text).toBe("ok");
  });

  it("dialog konfirmasi mengembalikan pilihan pengguna", async () => {
    expect(await showConfirmDialog("T", "X")).toBe(true);
    expect((fire.mock.calls[0][0] as any).confirmButtonText).toBe("Ya, lanjutkan");
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    expect(await showConfirmDialog("T", "X", "Hapus")).toBe(false);
    expect((fire.mock.calls[1][0] as any).confirmButtonText).toBe("Hapus");
  });

  it("memformat tanggal dengan aman", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
    expect(formatDate("2024-10-06T01:27:37.000000Z")).toMatch(/2024/);
  });

  it("mengekstrak id video YouTube dari berbagai bentuk tautan", () => {
    expect(getYoutubeId(null)).toBeNull();
    expect(getYoutubeId("")).toBeNull();
    expect(getYoutubeId("https://example.com/a")).toBeNull();
    expect(getYoutubeId("https://youtu.be/uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://www.youtube.com/watch?v=uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://www.youtube.com/watch?list=1&v=uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://www.youtube.com/embed/uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://www.youtube.com/shorts/uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
  });
});
