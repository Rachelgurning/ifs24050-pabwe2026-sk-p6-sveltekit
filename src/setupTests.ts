import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

vi.mock("$app/state", () => ({
  page: {
    params: {} as Record<string, string>,
    url: new URL("http://localhost/"),
  },
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));
