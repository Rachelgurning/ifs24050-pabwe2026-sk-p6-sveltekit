import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { page } from "$app/state";
import Sidebar from "./Sidebar.svelte";

const current = (path: string) => {
  (page as any).url = new URL(`http://localhost${path}`);
  render(Sidebar);
  return screen.getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "page");
};

describe("Sidebar", () => {
  it("menandai Semua Kursus aktif di beranda dan rute kursus", () => {
    const active = current("/");
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveTextContent("Semua Kursus");
  });

  it("Semua Kursus tetap aktif pada halaman detail kursus", () => {
    expect(current("/courses/3/contents/4")[0]).toHaveTextContent("Semua Kursus");
  });

  it("menandai Pengguna dan Profil sesuai rute", () => {
    expect(current("/users")[0]).toHaveTextContent("Pengguna");
    document.body.innerHTML = "";
    expect(current("/profile")[0]).toHaveTextContent("Profil");
  });

  it("tidak menandai apa pun untuk rute lain", () => {
    expect(current("/entah")).toHaveLength(0);
  });
});
