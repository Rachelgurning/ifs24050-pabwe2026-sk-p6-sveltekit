const confirmButtonColor = "#4338ca";

/** SweetAlert2 dimuat saat dibutuhkan agar bundel awal tetap kecil. */
async function fire(options: Record<string, unknown>) {
  const { default: Swal } = await import("sweetalert2");
  return Swal.fire(options);
}

export function showSuccessDialog(message: string) {
  return fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonColor,
    timer: 2200,
    timerProgressBar: true,
  });
}

export function showErrorDialog(message: string) {
  return fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor,
  });
}

export function showWarningDialog(message: string) {
  return fire({
    icon: "warning",
    title: "Perhatian",
    text: message,
    confirmButtonColor,
  });
}

export async function showConfirmDialog(
  title: string,
  text: string,
  confirmText = "Ya, lanjutkan"
): Promise<boolean> {
  const result = await fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor,
    cancelButtonColor: "#475569",
  });
  return result.isConfirmed;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Mengubah tautan YouTube (watch, youtu.be, embed, shorts) menjadi id video. */
export function getYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}
