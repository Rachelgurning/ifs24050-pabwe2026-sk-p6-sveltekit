import { apiRequest } from "../../../helpers/apiHelper";
import type { Course, CourseContent, CourseDetail } from "../types";

export const postCourse = (payload: { title: string; description: string }) =>
  apiRequest("/courses", { method: "POST", body: payload });

export const postCourseCover = (id: number | string, cover: File) => {
  const formData = new FormData();
  formData.append("cover", cover);
  return apiRequest(`/courses/${id}/cover`, { method: "POST", formData });
};

export const putCourse = (
  id: number | string,
  payload: { title: string; description: string }
) => apiRequest(`/courses/${id}`, { method: "PUT", body: payload });

export const getCourses = (isMe = false) =>
  apiRequest<{ courses: Course[] }>(isMe ? "/courses?is_me=1" : "/courses");

export const getCourse = (id: number | string) =>
  apiRequest<{ course: CourseDetail }>(`/courses/${id}`);

export const deleteCourse = (id: number | string) =>
  apiRequest(`/courses/${id}`, { method: "DELETE" });

export const deleteAllCourses = () => apiRequest("/courses", { method: "DELETE" });

export const postStudent = (id: number | string) =>
  apiRequest(`/courses/${id}/students`, { method: "POST" });

export const deleteStudent = (id: number | string) =>
  apiRequest(`/courses/${id}/students`, { method: "DELETE" });

export const putRatings = (
  id: number | string,
  payload: { ratings: number; comment: string }
) => apiRequest(`/courses/${id}/students/ratings`, { method: "PUT", body: payload });

export const postContent = (
  courseId: number | string,
  payload: { title: string; youtube: string }
) =>
  apiRequest<{ content_id: number }>(`/courses/${courseId}/contents`, {
    method: "POST",
    body: payload,
  });

export const putContent = (
  id: number | string,
  payload: { title: string; youtube: string }
) => apiRequest(`/courses/-/contents/${id}`, { method: "PUT", body: payload });

export const getContent = (id: number | string) =>
  apiRequest<{ course_content: CourseContent }>(`/courses/-/contents/${id}`);

export const deleteContent = (id: number | string) =>
  apiRequest(`/courses/-/contents/${id}`, { method: "DELETE" });

export const postContentStatus = (id: number | string, status: 0 | 1) =>
  apiRequest(`/courses/-/contents/${id}/learns`, {
    method: "POST",
    body: { status },
  });
