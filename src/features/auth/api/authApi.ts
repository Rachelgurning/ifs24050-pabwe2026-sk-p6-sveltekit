import { apiRequest } from "../../../helpers/apiHelper";

export const postLogin = (payload: { email: string; password: string }) =>
  apiRequest<{ token: string }>("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });

export const postRegister = (payload: {
  name: string;
  email: string;
  password: string;
}) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
