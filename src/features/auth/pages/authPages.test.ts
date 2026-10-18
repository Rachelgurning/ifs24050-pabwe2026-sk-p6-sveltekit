import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import LoginPage from "./LoginPage.svelte";
import RegisterPage from "./RegisterPage.svelte";
import { isProfile } from "../states/authStore";
import { getAccessToken } from "../../../helpers/apiHelper";
import { demoProfile, fail, mockFetch, ok, renderWithProviders } from "../../../test-utils";

const fire = vi.mocked(Swal.fire);
const lastIcon = () => (fire.mock.calls.at(-1)![0] as any).icon;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("LoginPage", () => {
  const fill = async () => {
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "123456" } });
    await fireEvent.submit(screen.getByRole("button", { name: "Masuk" }).closest("form")!);
  };

  it("menampilkan formulir dan tautan ke pendaftaran", () => {
    renderWithProviders(LoginPage, { props: { onSuccess: vi.fn() } });
    expect(screen.getByRole("heading", { level: 1, name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /daftar sekarang/i })).toHaveAttribute("href", "/auth/register");
  });

  it("menyimpan token, memuat profil, lalu memanggil onSuccess", async () => {
    const onSuccess = vi.fn();
    mockFetch((url) => (url.endsWith("/auth/login") ? ok({ token: "tok" }) : ok({ user: demoProfile })));
    renderWithProviders(LoginPage, { props: { onSuccess } });
    await fill();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(getAccessToken()).toBe("tok");
    expect(get(isProfile)).toBe(true);
  });

  it("menampilkan galat bila login gagal", async () => {
    const onSuccess = vi.fn();
    mockFetch(() => fail("Email atau kata sandi salah"));
    renderWithProviders(LoginPage, { props: { onSuccess } });
    await fill();
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });

  it("menampilkan galat bila profil gagal dimuat setelah login", async () => {
    const onSuccess = vi.fn();
    mockFetch((url) => (url.endsWith("/auth/login") ? ok({ token: "tok" }) : fail("Unauthenticated.")));
    renderWithProviders(LoginPage, { props: { onSuccess } });
    await fill();
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });
});

describe("RegisterPage", () => {
  const fill = async () => {
    await fireEvent.input(screen.getByLabelText("Nama lengkap"), { target: { value: "Ubaid" } });
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "123456" } });
    await fireEvent.submit(screen.getByRole("button", { name: "Daftar" }).closest("form")!);
  };

  it("mendaftar lalu memanggil onSuccess", async () => {
    const onSuccess = vi.fn();
    const fetchMock = mockFetch(() => ok(undefined, "Berhasil mendaftar"));
    renderWithProviders(RegisterPage, { props: { onSuccess } });
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
    await fill();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].body).toBe('{"name":"Ubaid","email":"a@a.com","password":"123456"}');
  });

  it("menampilkan galat bila pendaftaran gagal", async () => {
    const onSuccess = vi.fn();
    mockFetch(() => fail("Email sudah terdaftar"));
    renderWithProviders(RegisterPage, { props: { onSuccess } });
    await fill();
    await waitFor(() => expect(lastIcon()).toBe("error"));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
