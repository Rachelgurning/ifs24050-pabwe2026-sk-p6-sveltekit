import { derived, writable } from "svelte/store";
import { removeAccessToken } from "../../../helpers/apiHelper";
import { getMe } from "../../users/api/userApi";
import type { UserProfile } from "../../users/types";

export const isAuthenticated = writable(false);
export const isProfile = writable(false);
export const profile = writable<UserProfile | null>(null);

/** Id pengguna yang sedang masuk (undefined bila belum ada profil). */
export const myId = derived(profile, ($profile) => $profile?.id);

export const setIsAuth = (value: boolean) => isAuthenticated.set(value);
export const setIsProfile = (value: boolean) => isProfile.set(value);
export const setProfile = (value: UserProfile | null) => profile.set(value);

/** Keluar: hapus token dan reset seluruh status sesi secara sinkron. */
export function logout() {
  removeAccessToken();
  setIsAuth(false);
  setIsProfile(false);
  setProfile(null);
}

/**
 * Memuat profil dari token tersimpan. Status login dan profil baru dinyatakan
 * siap sekaligus setelah profil berhasil diambil; bila gagal sesi dibersihkan.
 */
export async function loadProfile(): Promise<boolean> {
  const result = await getMe();
  if (!result.success) {
    logout();
    return false;
  }
  setProfile(result.data.user);
  setIsAuth(true);
  setIsProfile(true);
  return true;
}
