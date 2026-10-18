import { render } from "@testing-library/svelte";
import { vi } from "vitest";
import type { Component } from "svelte";
import {
  logout,
  setIsAuth,
  setIsProfile,
  setProfile,
} from "./features/auth/states/authStore";
import {
  setContent,
  setCourse,
  setCourses,
  mutations,
} from "./features/courses/states/coursesStore";
import { setUsers } from "./features/users/states/userStore";
import type { UserProfile } from "./features/users/types";
import { putAccessToken } from "./helpers/apiHelper";

export const demoProfile: UserProfile = {
  id: 1,
  name: "Abdullah Ubaid",
  email: "abdullah@example.com",
  photo: null,
};

/** Mengosongkan seluruh store dan localStorage sebelum setiap pengujian. */
export function resetState() {
  localStorage.clear();
  logout();
  setCourses([]);
  setCourse(null);
  setContent(null);
  setUsers([]);
  mutations.set({ course: false, cover: false, student: false, rating: false, content: false });
}

/** Merender komponen dengan store bersih dan, opsional, sesi pengguna aktif. */
export function renderWithProviders(
  component: Component<any>,
  options: { props?: Record<string, unknown>; profile?: UserProfile | null; token?: string } = {}
) {
  resetState();
  if (options.token) putAccessToken(options.token);
  if (options.profile) {
    setProfile(options.profile);
    setIsAuth(true);
    setIsProfile(true);
  }
  return render(component, { props: options.props ?? {} });
}

type Handler = (url: string, init: any) => unknown;

/** Mengganti fetch global; handler mengembalikan badan JSON respons. */
export function mockFetch(handler: Handler) {
  const fn = vi.fn(async (url: string, init: any) => ({
    json: async () => handler(url, init),
  }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

export const ok = (data?: unknown, message = "Berhasil") => ({
  status: "success",
  message,
  data,
});

export const fail = (message = "Gagal") => ({ status: "fail", message });
