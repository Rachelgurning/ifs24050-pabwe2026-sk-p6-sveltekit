import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import CourseCard from "./CourseCard.svelte";
import type { Course } from "../types";

const base: Course = {
  id: 7,
  user_id: 1,
  title: "Dasar C",
  description: "Belajar dasar C",
  students: [2, 3],
  cover: "https://x.test/c.png",
  author: { name: "Ubaid" },
  total_contents: 3,
  avg_ratings: "4.0000",
};

describe("CourseCard", () => {
  it("menampilkan ringkasan kursus dan penanda pemilik", () => {
    const onDelete = vi.fn();
    const { container } = render(CourseCard, { props: { course: base, myId: 1, onDelete } });
    expect(screen.getByRole("link", { name: "Dasar C" })).toHaveAttribute("href", "/courses/7");
    expect(screen.getByText("oleh Ubaid")).toBeInTheDocument();
    expect(screen.getByText("3 materi")).toBeInTheDocument();
    expect(screen.getByText("2 peserta")).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();
    expect(screen.getByText("Milik saya")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", base.cover);
    screen.getByRole("button", { name: "Hapus kursus Dasar C" }).click();
    expect(onDelete).toHaveBeenCalledWith(base);
  });

  it("menandai peserta dan memberi nilai bawaan saat data opsional kosong", () => {
    const course: Course = {
      ...base,
      cover: null,
      author: undefined,
      total_contents: undefined,
      avg_ratings: null,
    };
    const { container } = render(CourseCard, { props: { course, myId: 2, onDelete: vi.fn() } });
    expect(screen.getByText("Terdaftar")).toBeInTheDocument();
    expect(screen.getByText("oleh Tanpa nama")).toBeInTheDocument();
    expect(screen.getByText("0 materi")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("button", { name: /hapus/i })).not.toBeInTheDocument();
  });

  it("tanpa penanda untuk pengunjung", () => {
    render(CourseCard, { props: { course: base, myId: 99, onDelete: vi.fn() } });
    expect(screen.queryByText("Milik saya")).not.toBeInTheDocument();
    expect(screen.queryByText("Terdaftar")).not.toBeInTheDocument();
  });

  it("kartu prioritas memuat gambar segera dengan fetchpriority tinggi", () => {
    const { container } = render(CourseCard, { props: { course: base, myId: 1, onDelete: vi.fn(), priority: true } });
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("kartu biasa memuat gambar secara lazy tanpa fetchpriority", () => {
    const { container } = render(CourseCard, { props: { course: base, myId: 1, onDelete: vi.fn() } });
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).not.toHaveAttribute("fetchpriority");
  });
});
