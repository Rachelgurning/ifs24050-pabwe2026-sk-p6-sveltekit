const TOKEN_KEY = "token";

export interface ApiResult<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Pembungkus fetch ke Delcom Open API. Respons dianggap berhasil bila
 * `status` bernilai "success". Tidak pernah melempar galat: kegagalan jaringan
 * dikembalikan sebagai hasil gagal agar pemanggil cukup memeriksa `success`.
 */
export async function apiRequest<T = any>(
  path: string,
  { method = "GET", body, formData, auth = true }: ApiOptions = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${DELCOM_BASEURL}${path}`, {
      method,
      headers,
      body: payload,
    });
    const json = await response.json();
    return {
      success: json.status === "success",
      message: json.message ?? "",
      data: json.data,
    };
  } catch {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      data: undefined as T,
    };
  }
}
