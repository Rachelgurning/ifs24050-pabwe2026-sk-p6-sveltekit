import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import CourseForm from "./CourseForm.svelte";

describe("CourseForm", () => {
  const setup = (extra = {}) => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(CourseForm, {
      props: { id: "f", submitLabel: "Simpan", loading: false, onSubmit, onCancel, ...extra },
    });
    return { onSubmit, onCancel };
  };

  it("mengirim judul dan deskripsi yang diisi", async () => {
    const { onSubmit } = setup();
    await fireEvent.input(screen.getByLabelText("Judul kursus"), { target: { value: "Judul" } });
    await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: "Isi" } });
    await fireEvent.submit(screen.getByRole("button", { name: "Simpan" }).closest("form")!);
    expect(onSubmit).toHaveBeenCalledWith("Judul", "Isi");
  });

  it("memuat nilai awal dan memanggil onCancel", () => {
    const { onCancel } = setup({ title: "Awal", description: "Desk" });
    expect(screen.getByLabelText("Judul kursus")).toHaveValue("Awal");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Desk");
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onCancel).toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat menyimpan", () => {
    setup({ loading: true });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
