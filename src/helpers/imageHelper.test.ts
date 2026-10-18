import { describe, expect, it } from "vitest";
import { IMAGE_SIZES, imageSrcset, optimizedImage } from "./imageHelper";

const src = "https://open-api.delcom.org/cover/1.jpg";

describe("imageHelper", () => {
  it("mengembalikan URL asli bila optimasi nonaktif (bawaan di luar Vercel)", () => {
    expect(optimizedImage(src, 640)).toBe(src);
    expect(imageSrcset(src, [384, 640])).toBeUndefined();
  });

  it("mengembalikan undefined untuk sumber kosong", () => {
    expect(optimizedImage(null, 64, true)).toBeUndefined();
    expect(optimizedImage(undefined, 64, false)).toBeUndefined();
    expect(imageSrcset("", [64], true)).toBeUndefined();
  });

  it("membangun URL Vercel Image Optimization dengan lebar yang diizinkan", () => {
    expect(optimizedImage(src, 600, true)).toBe(`/_vercel/image?url=${encodeURIComponent(src)}&w=640&q=75`);
    expect(optimizedImage(src, 32, true)).toContain("&w=64&");
    expect(optimizedImage(src, 99999, true)).toContain(`&w=${IMAGE_SIZES[IMAGE_SIZES.length - 1]}&`);
  });

  it("tidak mengoptimasi URL non-http (mis. data: atau path lokal)", () => {
    expect(optimizedImage("/logo.svg", 64, true)).toBe("/logo.svg");
    expect(imageSrcset("data:image/png;base64,AA", [64], true)).toBeUndefined();
  });

  it("membuat srcset dengan deskriptor lebar", () => {
    const set = imageSrcset(src, [300, 640], true)!;
    expect(set).toBe(
      `/_vercel/image?url=${encodeURIComponent(src)}&w=384&q=75 384w, /_vercel/image?url=${encodeURIComponent(src)}&w=640&q=75 640w`
    );
  });
});
