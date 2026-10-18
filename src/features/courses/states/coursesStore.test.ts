import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearMutation,
  content,
  course,
  courses,
  getRole,
  isOwner,
  isStudent,
  markMutation,
  mutations,
  setContent,
  setCourse,
  setCourses,
} from "./coursesStore";
import { resetState } from "../../../test-utils";
import type { Course } from "../types";

const sample: Course = { id: 1, user_id: 1, title: "T", description: "D", students: [2] };

describe("coursesStore", () => {
  beforeEach(resetState);

  it("menyimpan koleksi, detail, dan konten", () => {
    setCourses([sample]);
    setCourse({ ...sample, contents: [], ratings: [], my_percentage_finished: "0" });
    setContent({ id: 1, course_id: 1, title: "C", youtube: "y", my_status_finished: false });
    expect(get(courses)).toHaveLength(1);
    expect(get(course)?.id).toBe(1);
    expect(get(content)?.title).toBe("C");
  });

  it("menyalakan dan mematikan bendera mutasi", () => {
    markMutation("rating");
    expect(get(mutations).rating).toBe(true);
    expect(get(mutations).course).toBe(false);
    clearMutation("rating");
    expect(get(mutations).rating).toBe(false);
  });

  it("menentukan pemilik dan peserta", () => {
    expect(isOwner(sample, 1)).toBe(true);
    expect(isOwner(sample, 2)).toBe(false);
    expect(isOwner(null, 1)).toBe(false);
    expect(isStudent(sample, 2)).toBe(true);
    expect(isStudent(sample, 1)).toBe(false);
    expect(isStudent(null, 2)).toBe(false);
  });

  it("mendahulukan pemilik bila pengguna juga peserta", () => {
    const both: Course = { ...sample, students: [1] };
    expect(getRole(both, 1)).toBe("owner");
    expect(getRole(sample, 2)).toBe("student");
    expect(getRole(sample, 9)).toBe("visitor");
    expect(getRole(null, undefined)).toBe("visitor");
  });
});
