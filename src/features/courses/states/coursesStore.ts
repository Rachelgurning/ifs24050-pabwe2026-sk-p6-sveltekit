import { writable } from "svelte/store";
import type { Course, CourseContent, CourseDetail, MutationKey } from "../types";

export const courses = writable<Course[]>([]);
export const course = writable<CourseDetail | null>(null);
export const content = writable<CourseContent | null>(null);

/** Bendera mutasi: halaman memuat ulang data saat bendera menyala. */
export const mutations = writable<Record<MutationKey, boolean>>({
  course: false,
  cover: false,
  student: false,
  rating: false,
  content: false,
});

export const setCourses = (value: Course[]) => courses.set(value);
export const setCourse = (value: CourseDetail | null) => course.set(value);
export const setContent = (value: CourseContent | null) => content.set(value);

export const markMutation = (key: MutationKey) =>
  mutations.update((state) => ({ ...state, [key]: true }));

export const clearMutation = (key: MutationKey) =>
  mutations.update((state) => ({ ...state, [key]: false }));

export const isOwner = (item: Course | null, profileId: number | undefined) =>
  !!item && item.user_id === profileId;

export const isStudent = (item: Course | null, profileId: number | undefined) =>
  !!item && item.students.includes(profileId as number);

export type CourseRole = "owner" | "student" | "visitor";

/** Pemilik didahulukan bila pengguna sekaligus terdaftar sebagai peserta. */
export function getRole(item: Course | null, profileId: number | undefined): CourseRole {
  if (isOwner(item, profileId)) return "owner";
  if (isStudent(item, profileId)) return "student";
  return "visitor";
}
