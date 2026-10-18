import { screen } from "@testing-library/svelte";
import { expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils";

it("menampilkan halaman tidak ditemukan dengan tautan kembali", () => {
  renderWithProviders(NotFoundPage);
  expect(screen.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /kembali ke semua kursus/i })).toHaveAttribute("href", "/");
});
