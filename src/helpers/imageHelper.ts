/**
 * Optimasi gambar remote (cover & foto dari Delcom). Saat dibangun untuk Vercel,
 * gambar dilayani lewat Vercel Image Optimization (`/_vercel/image`): diperkecil sesuai
 * ukuran tampilan, dikonversi ke AVIF/WebP, dan di-cache lama di CDN & browser.
 * Di luar Vercel (Bun/Jenkins/lokal) URL asli dipakai apa adanya.
 */
export const IMAGE_SIZES = [64, 96, 128, 256, 384, 640, 828, 1080, 1280];
export const IMAGE_HOSTNAME = "open-api.delcom.org";

const isOptimizerOn = () => IMAGE_OPTIMIZER === "vercel";

const pickSize = (width: number) =>
  IMAGE_SIZES.find((size) => size >= width) ?? IMAGE_SIZES[IMAGE_SIZES.length - 1];

const canOptimize = (src: string | null | undefined, enabled: boolean): src is string =>
  enabled && !!src && /^https?:\/\//.test(src);

export function optimizedImage(
  src: string | null | undefined,
  width: number,
  enabled: boolean = isOptimizerOn()
): string | undefined {
  if (!src) return undefined;
  if (!canOptimize(src, enabled)) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${pickSize(width)}&q=75`;
}

export function imageSrcset(
  src: string | null | undefined,
  widths: number[],
  enabled: boolean = isOptimizerOn()
): string | undefined {
  if (!canOptimize(src, enabled)) return undefined;
  return widths.map((width) => `${optimizedImage(src, width, true)} ${pickSize(width)}w`).join(", ");
}
