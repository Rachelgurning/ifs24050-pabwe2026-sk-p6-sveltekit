import { createRawSnippet } from "svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import RootLayout from "./routes/+layout.svelte";
import { demoProfile, mockFetch, ok, resetState } from "./test-utils";
import { putAccessToken } from "./helpers/apiHelper";

const children = createRawSnippet(() => ({ render: () => "<p>isi rute</p>" }));

describe("layout akar aplikasi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("rute /auth merender anak langsung tanpa layout kursus", () => {
    (page as any).url = new URL("http://localhost/auth/login");
    render(RootLayout, { props: { children } });
    expect(screen.getByText("isi rute")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Menu utama" })).not.toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });

  it("rute lain dibungkus CourseLayout dengan navbar dan sidebar", async () => {
    (page as any).url = new URL("http://localhost/users");
    putAccessToken("tok");
    mockFetch(() => ok({ user: demoProfile }));
    render(RootLayout, { props: { children } });
    expect(await screen.findByText("isi rute")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu utama" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("rute terlindungi tanpa token diarahkan ke halaman masuk", async () => {
    (page as any).url = new URL("http://localhost/");
    render(RootLayout, { props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("membuang shell #boot statis dari app.html saat aplikasi tampil", () => {
    (page as any).url = new URL("http://localhost/auth/login");
    const boot = document.createElement("div");
    boot.id = "boot";
    document.body.appendChild(boot);
    render(RootLayout, { props: { children } });
    expect(document.getElementById("boot")).toBeNull();
  });
});
