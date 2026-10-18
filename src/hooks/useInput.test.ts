import { get } from "svelte/store";
import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("menyimpan nilai input, lalu mengembalikannya saat reset", () => {
    const { value, onChange, reset } = useInput("awal");
    expect(get(value)).toBe("awal");
    const input = document.createElement("input");
    input.value = "baru";
    onChange({ target: input } as unknown as Event);
    expect(get(value)).toBe("baru");
    reset();
    expect(get(value)).toBe("awal");
  });
});
