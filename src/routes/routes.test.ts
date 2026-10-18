import { createRawSnippet } from "svelte";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import * as layoutModule from "./+layout";
import HomeRoute from "./+page.svelte";
import ErrorRoute from "./+error.svelte";
import AuthLayoutRoute from "./auth/+layout.svelte";
import LoginRoute from "./auth/login/+page.svelte";
import RegisterRoute from "./auth/register/+page.svelte";
import DetailRoute from "./courses/[courseId]/+page.svelte";
import ContentRoute from "./courses/[courseId]/contents/[contentId]/+page.svelte";
import UsersRoute from "./users/+page.svelte";
import ProfileRoute from "./profile/+page.svelte";
import { demoProfile, mockFetch, ok, renderWithProviders, resetState } from "../test-utils";

const params = page.params as Record<string, string>;

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  vi.unstubAllGlobals();
  Object.keys(params).forEach((key) => delete params[key]);
});

describe("rute SvelteKit", () => {
  it("menjalankan aplikasi sebagai SPA tanpa prerender", () => {
    expect(layoutModule.ssr).toBe(false);
    expect(layoutModule.prerender).toBe(false);
  });

  it("/ menampilkan daftar kursus", async () => {
    mockFetch(() => ok({ courses: [] }));
    renderWithProviders(HomeRoute, { profile: demoProfile });
    expect(await screen.findByRole("heading", { level: 1, name: "Semua Kursus" })).toBeInTheDocument();
  });

  it("+error menampilkan halaman tidak ditemukan", () => {
    renderWithProviders(ErrorRoute);
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
  });

  it("/auth memakai layout autentikasi", () => {
    mockFetch(() => ok());
    const children = createRawSnippet(() => ({ render: () => "<p>anak auth</p>" }));
    renderWithProviders(AuthLayoutRoute, { props: { children } });
    expect(screen.getByText("anak auth")).toBeInTheDocument();
    expect(screen.getByTestId("auth-tagline")).toBeInTheDocument();
  });

  it("/auth/login mengalihkan ke beranda setelah login berhasil", async () => {
    mockFetch((url) => (url.endsWith("/auth/login") ? ok({ token: "t" }) : ok({ user: demoProfile })));
    renderWithProviders(LoginRoute);
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "123456" } });
    await fireEvent.submit(screen.getByRole("button", { name: "Masuk" }).closest("form")!);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("/auth/register mengalihkan ke halaman masuk setelah mendaftar", async () => {
    mockFetch(() => ok(undefined, "Berhasil mendaftar"));
    renderWithProviders(RegisterRoute);
    await fireEvent.input(screen.getByLabelText("Nama lengkap"), { target: { value: "Ubaid" } });
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "123456" } });
    await fireEvent.submit(screen.getByRole("button", { name: "Daftar" }).closest("form")!);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("/courses/[courseId] membaca parameter dari page.params", async () => {
    params.courseId = "42";
    const fetchMock = mockFetch(() => ok({ course: null }));
    renderWithProviders(DetailRoute, { profile: demoProfile });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/courses/42`);
  });

  it("/courses/[courseId]/contents/[contentId] membaca kedua parameter", async () => {
    params.courseId = "42";
    params.contentId = "7";
    const fetchMock = mockFetch(() => ok({ course_content: null }));
    renderWithProviders(ContentRoute, { profile: demoProfile });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/courses/-/contents/7`);
    expect(screen.getByRole("link", { name: /kembali ke kursus/i })).toHaveAttribute("href", "/courses/42");
  });

  it("/users menampilkan direktori pengguna", async () => {
    mockFetch(() => ok({ users: [] }));
    renderWithProviders(UsersRoute, { profile: demoProfile });
    expect(await screen.findByRole("heading", { level: 1, name: "Pengguna" })).toBeInTheDocument();
  });

  it("/profile menampilkan profil", () => {
    renderWithProviders(ProfileRoute, { profile: demoProfile });
    expect(screen.getByRole("heading", { level: 1, name: "Profil" })).toBeInTheDocument();
  });
});
