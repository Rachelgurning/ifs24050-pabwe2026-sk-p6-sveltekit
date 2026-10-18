import { createRawSnippet } from "svelte";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal.svelte";

const children = createRawSnippet(() => ({
  render: () => '<input aria-label="isian" />',
}));

describe("Modal", () => {
  it("menampilkan dialog bertitle dan memfokuskan isian pertama", () => {
    render(Modal, { props: { id: "uji", title: "Judul Uji", onClose: vi.fn(), children } });
    const dialog = screen.getByRole("dialog", { name: "Judul Uji" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText("isian")).toHaveFocus();
  });

  it("menutup lewat Escape, tombol tutup, dan latar belakang", async () => {
    const onClose = vi.fn();
    render(Modal, { props: { id: "uji", title: "Judul", onClose, children } });
    await fireEvent.keyDown(window, { key: "a" });
    expect(onClose).not.toHaveBeenCalled();
    await fireEvent.keyDown(window, { key: "Escape" });
    screen.getByRole("button", { name: "Tutup" }).click();
    screen.getByTestId("modal-backdrop").click();
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("mengembalikan fokus ke elemen sebelumnya saat ditutup", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = render(Modal, { props: { id: "uji", title: "J", onClose: vi.fn(), children } });
    expect(trigger).not.toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
