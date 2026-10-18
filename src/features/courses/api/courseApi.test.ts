import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "./courseApi";
import { mockFetch, ok } from "../../../test-utils";

describe("courseApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("memetakan setiap fungsi ke endpoint dan metode Delcom yang benar", async () => {
    const fetchMock = mockFetch(() => ok({}));
    await api.postCourse({ title: "T", description: "D" });
    await api.putCourse(3, { title: "T", description: "D" });
    await api.getCourses();
    await api.getCourses(true);
    await api.getCourse(3);
    await api.deleteCourse(3);
    await api.deleteAllCourses();
    await api.postStudent(3);
    await api.deleteStudent(3);
    await api.putRatings(3, { ratings: 5, comment: "Mantap" });
    await api.postContent(3, { title: "T", youtube: "https://youtu.be/uHyfQV0kbgo" });
    await api.putContent(9, { title: "T", youtube: "https://youtu.be/uHyfQV0kbgo" });
    await api.getContent(9);
    await api.deleteContent(9);
    await api.postContentStatus(9, 1);

    const calls = fetchMock.mock.calls.map(([url, init]) => `${init.method} ${url.replace(DELCOM_BASEURL, "")}`);
    expect(calls).toEqual([
      "POST /courses",
      "PUT /courses/3",
      "GET /courses",
      "GET /courses?is_me=1",
      "GET /courses/3",
      "DELETE /courses/3",
      "DELETE /courses",
      "POST /courses/3/students",
      "DELETE /courses/3/students",
      "PUT /courses/3/students/ratings",
      "POST /courses/3/contents",
      "PUT /courses/-/contents/9",
      "GET /courses/-/contents/9",
      "DELETE /courses/-/contents/9",
      "POST /courses/-/contents/9/learns",
    ]);
    expect(fetchMock.mock.calls[9][1].body).toBe('{"ratings":5,"comment":"Mantap"}');
    expect(fetchMock.mock.calls[14][1].body).toBe('{"status":1}');
  });

  it("mengunggah sampul sebagai berkas `cover`", async () => {
    const fetchMock = mockFetch(() => ok());
    const file = new File(["x"], "c.png", { type: "image/png" });
    await api.postCourseCover(3, file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/courses/3/cover`);
    expect((init.body as FormData).get("cover")).toBe(file);
  });
});
