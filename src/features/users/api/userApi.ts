import { apiRequest } from "../../../helpers/apiHelper";
import type { UserProfile } from "../types";

export const getMe = () =>
  apiRequest<{ user: UserProfile }>("/users/me");

export const getUsers = () =>
  apiRequest<{ users: UserProfile[] }>("/users");

export const putMe = (payload: { name: string; email: string }) =>
  apiRequest("/users/me", { method: "PUT", body: payload });

export const postPhoto = (photo: File) => {
  const formData = new FormData();
  formData.append("photo", photo);
  return apiRequest("/users/photo", { method: "POST", formData });
};

export const putPassword = (payload: { password: string; new_password: string }) =>
  apiRequest("/users/change-password", { method: "PUT", body: payload });
