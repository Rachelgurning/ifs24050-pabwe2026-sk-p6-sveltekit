import { createRawSnippet } from "svelte";
import { screen } from "@testing-library/svelte";
import { expect, it } from "vitest";
import AuthLayout from "./AuthLayout.svelte";
import { renderWithProviders } from "../../../test-utils";

it("membungkus isi dengan teks pengenal kursus dan landmark utama", () => {
  const children = createRawSnippet(() => ({ render: () => "<p>formulir</p>" }));
  renderWithProviders(AuthLayout, { props: { children } });
  expect(screen.getByTestId("auth-tagline")).toHaveTextContent(/kursus video/i);
  expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
  expect(screen.getByRole("main")).toHaveTextContent("formulir");
});
